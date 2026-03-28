const MockTest = require('../models/MockTest');
const Submission = require('../models/Submission');
const User = require('../models/User');
const Question = require('../models/Question');

// @desc    Get all mock tests
// @route   GET /api/mock-tests
// @access  Public
exports.getMockTests = async (req, res) => {
  try {
    const { company, category, difficulty, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (company && company !== 'all') query.company = company;
    if (category && category !== 'all') query.category = category;
    if (difficulty) query.difficulty = difficulty;

    const tests = await MockTest.find(query)
      .select('-sections.questions')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await MockTest.countDocuments(query);

    res.status(200).json({
      success: true,
      count: tests.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      tests
    });
  } catch (error) {
    console.error('Get mock tests error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mock tests',
      error: error.message
    });
  }
};

// @desc    Get single mock test with questions
// @route   GET /api/mock-tests/:id
// @access  Private
exports.getMockTest = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id).populate('sections.questions');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    // Check if user has already attempted this test
    const existingSubmission = await Submission.findOne({
      user: req.user.id,
      mockTest: test._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      test: {
        ...test.toObject(),
        sections: test.sections.map(section => ({
          ...section.toObject(),
          questions: section.questions.map(q => ({
_id: q._id,
            question: q.question,
            options: q.options,
            difficulty: q.difficulty,
            marks: q.marks,
questionType: q.questionType,
            correctAnswers: q.correctAnswers
          }))
        }))
      },
      previousAttempt: existingSubmission ? {
        score: existingSubmission.score,
        maxScore: existingSubmission.maxScore,
        isCorrect: existingSubmission.isCorrect,
        completedAt: existingSubmission.createdAt
      } : null
    });
  } catch (error) {
    console.error('Get mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching mock test',
      error: error.message
    });
  }
};

// @desc    Start mock test
// @route   POST /api/mock-tests/:id/start
// @access  Private
exports.startMockTest = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    // Update test attempts
    test.attempts += 1;
    await test.save();

    res.status(200).json({
      success: true,
      message: 'Test started',
      startTime: Date.now(),
      duration: test.duration * 60 * 1000 // Convert to milliseconds
    });
  } catch (error) {
    console.error('Start mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error starting test',
      error: error.message
    });
  }
};

// @desc    Submit mock test
// @route   POST /api/mock-tests/:id/submit
// @access  Private
exports.submitMockTest = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const userId = req.user.id;
    const testId = req.params.id;

    const test = await MockTest.findById(testId).populate('sections.questions');

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    let totalScore = 0;
    let totalMaxScore = 0;
    let correctAnswers = 0;
    let totalQuestions = 0;
    const sectionResults = [];
    const questionResults = [];

    // Evaluate each section
    for (const section of test.sections) {
      let sectionScore = 0;
      let sectionMaxScore = 0;
      let sectionCorrect = 0;
      let sectionQuestions = 0;

      for (const question of section.questions) {
        totalQuestions++;
        sectionQuestions++;
        totalMaxScore += question.marks;
        sectionMaxScore += question.marks;

        const userAnswerRaw = answers[question._id.toString()];
        const userAnswerArray = Array.isArray(userAnswerRaw) ? userAnswerRaw.map(Number) : [Number(userAnswerRaw)].filter(n => !isNaN(n));
        let isCorrect;
        
        if (question.questionType === 'single') {
          isCorrect = userAnswerArray.length > 0 && userAnswerArray[0] === question.correctAnswers[0];
        } else { // multi
          const correctSet = new Set(question.correctAnswers);
          const userSet = new Set(userAnswerArray);
          isCorrect = userSet.size === correctSet.size && [...userSet].every(a => correctSet.has(a));
        }
        
        console.log(`Q${question._id}: User=[${userAnswerArray}] Correct=[${question.correctAnswers}] isCorrect=${isCorrect}`);

        if (isCorrect) {
          totalScore += question.marks;
          sectionScore += question.marks;
          correctAnswers++;
          sectionCorrect++;
        }

        questionResults.push({
          questionId: question._id,
          userAnswer: userAnswerArray,
          correctAnswer: question.correctAnswers,
          isCorrect,
          marks: isCorrect ? question.marks : 0
        });
      }

      sectionResults.push({
        sectionName: section.name,
        score: sectionScore,
        maxScore: sectionMaxScore,
        correct: sectionCorrect,
        total: sectionQuestions,
        percentage: sectionMaxScore > 0 ? Math.round((sectionScore / sectionMaxScore) * 100) : 0
      });
    }

    const percentage = totalMaxScore > 0 ? Math.round((totalScore / totalMaxScore) * 100) : 0;
    const isPassed = percentage >= test.passingPercentage;

    // Create submission
    const submission = await Submission.create({
      user: userId,
      mockTest: testId,
      type: 'mocktest',
      answers,
      isCorrect: isPassed,
      score: totalScore,
      maxScore: totalMaxScore,
      timeTaken: timeTaken || 0,
      status: isPassed ? 'accepted' : 'wrong_answer'
    });

    // Update user stats
    await User.findByIdAndUpdate(userId, {
      $inc: { score: totalScore, testsCompleted: 1 }
    });

    // Update test average score
    const allSubmissions = await Submission.find({ mockTest: testId });
    const avgScore = allSubmissions.reduce((sum, s) => sum + s.score, 0) / allSubmissions.length;
    await MockTest.findByIdAndUpdate(testId, { averageScore: avgScore });

    res.status(200).json({
      success: true,
      result: {
        submissionId: submission._id,
        totalScore,
        maxScore: totalMaxScore,
        correctAnswers,
        totalQuestions,
        percentage,
        isPassed,
        passingPercentage: test.passingPercentage,
        timeTaken,
        sectionResults,
        questionResults
      }
    });
  } catch (error) {
    console.error('Submit mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting test',
      error: error.message
    });
  }
};

// @desc    Create mock test (Admin)
// @route   POST /api/mock-tests
// @access  Private (Admin)
exports.createMockTest = async (req, res) => {
  try {
    const test = await MockTest.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Mock test created successfully',
      test
    });
  } catch (error) {
    console.error('Create mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating mock test',
      error: error.message
    });
  }
};

// @desc    Update mock test (Admin)
// @route   PUT /api/mock-tests/:id
// @access  Private (Admin)
exports.updateMockTest = async (req, res) => {
  try {
    const test = await MockTest.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mock test updated successfully',
      test
    });
  } catch (error) {
    console.error('Update mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating mock test',
      error: error.message
    });
  }
};

// @desc    Delete mock test (Admin)
// @route   DELETE /api/mock-tests/:id
// @access  Private (Admin)
exports.deleteMockTest = async (req, res) => {
  try {
    const test = await MockTest.findByIdAndDelete(req.params.id);

    if (!test) {
      return res.status(404).json({
        success: false,
        message: 'Mock test not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Mock test deleted successfully'
    });
  } catch (error) {
    console.error('Delete mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting mock test',
      error: error.message
    });
  }
};

// @desc    Get user's mock test results
// @route   GET /api/mock-tests/my-results
// @access  Private
exports.getMyTestResults = async (req, res) => {
  try {
    const submissions = await Submission.find({ 
      user: req.user.id, 
      type: 'mocktest' 
    })
    .populate('mockTest', 'title company duration totalMarks averageScore')
    .populate('user', 'name')
    .sort({ createdAt: -1 })
    .limit(20);

    const total = await Submission.countDocuments({ user: req.user.id, type: 'mocktest' });

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      results: submissions.map(s => ({
        _id: s._id,
        test: s.mockTest,
        score: s.score,
        maxScore: s.maxScore,
        percentage: Math.round((s.score / s.maxScore) * 100),
        timeTaken: s.timeTaken,
        isPassed: s.isCorrect,
        completedAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('Get my test results error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching results'
    });
  }
};

// @desc    Get specific test submissions (admin)
// @route   GET /api/mock-tests/:testId/submissions
// @access  Private Admin
exports.getTestSubmissions = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.testId);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    const submissions = await Submission.find({ mockTest: req.params.testId })
      .populate('user', 'name email')
      .populate('mockTest', 'title')
      .sort({ score: -1, createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      test,
      submissions: submissions.map(s => ({
        user: s.user,
        score: s.score,
        percentage: Math.round((s.score / s.maxScore) * 100),
        timeTaken: s.timeTaken,
        submittedAt: s.createdAt
      }))
    });
  } catch (error) {
    console.error('Get test submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions'
    });
  }
};

// @desc    Get specific test result
// @route   GET /api/mock-tests/results/:submissionId
// @access  Private
exports.getTestResult = async (req, res) => {
  try {
    const submission = await Submission.findById(req.params.submissionId)
      .populate('mockTest', 'title sections')
      .populate('user', 'name');

    if (!submission) {
      return res.status(404).json({ success: false, message: 'Result not found' });
    }

    // Check ownership
    if (submission.user._id.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.status(200).json({
      success: true,
      result: submission
    });
  } catch (error) {
    console.error('Get test result error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching result'
    });
  }
};

// @desc    Toggle mock test status (Admin)
// @route   POST /api/mock-tests/:id/toggle
// @access  Private Admin
exports.toggleMockTest = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);

    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    test.isActive = !test.isActive;
    await test.save();

    res.status(200).json({
      success: true,
      message: `Test ${test.isActive ? 'activated' : 'deactivated'} successfully`,
      test: {
        _id: test._id,
        title: test.title,
        isActive: test.isActive
      }
    });
  } catch (error) {
    console.error('Toggle mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling test'
    });
  }
};


// @desc    Toggle mock test active status (Admin)
// @route   POST /api/mock-tests/:id/toggle
// @access  Private Admin
exports.toggleMockTest = async (req, res) => {
  try {
    const test = await MockTest.findById(req.params.id);
    if (!test) {
      return res.status(404).json({ success: false, message: 'Test not found' });
    }

    test.isActive = !test.isActive;
    await test.save();

    res.status(200).json({
      success: true,
      test,
      message: `Test ${test.isActive ? 'activated' : 'deactivated'}`
    });
  } catch (error) {
    console.error('Toggle mock test error:', error);
    res.status(500).json({
      success: false,
      message: 'Error toggling test status'
    });
  }
};



