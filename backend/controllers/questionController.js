const Question = require('../models/Question');
const Submission = require('../models/Submission');
const User = require('../models/User');

// @desc    Get all questions with filters
// @route   GET /api/questions
// @access  Public
exports.getQuestions = async (req, res) => {
  try {
    const { category, subcategory, difficulty, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;
    if (difficulty) query.difficulty = difficulty;

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      questions
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
};

// @desc    Get single question
// @route   GET /api/questions/:id
// @access  Public
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      question
    });
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching question',
      error: error.message
    });
  }
};

// @desc    Get random questions for practice
// @route   GET /api/questions/random
// @access  Private
exports.getRandomQuestions = async (req, res) => {
  try {
    const { category, subcategory, count = 10 } = req.query;

    const query = { isActive: true };
    if (category) query.category = category;
    if (subcategory) query.subcategory = subcategory;

    const questions = await Question.aggregate([
      { $match: query },
      { $sample: { size: parseInt(count) } }
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      questions
    });
  } catch (error) {
    console.error('Get random questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching random questions',
      error: error.message
    });
  }
};

// @desc    Get categories with counts
// @route   GET /api/questions/categories
// @access  Public
exports.getCategories = async (req, res) => {
  try {
    const categories = await Question.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: { category: '$category', subcategory: '$subcategory' },
          count: { $sum: 1 },
          easyCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
          mediumCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hardCount: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } }
        }
      },
      {
        $group: {
          _id: '$_id.category',
          subcategories: {
            $push: {
              name: '$_id.subcategory',
              count: '$count',
              easyCount: '$easyCount',
              mediumCount: '$mediumCount',
              hardCount: '$hardCount'
            }
          },
          total: { $sum: '$count' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
};

// @desc    Submit answer to question
// @route   POST /api/questions/:id/submit
// @access  Private
exports.submitAnswer = async (req, res) => {
  try {
    const { answer, answers } = req.body; // Support single 'answer' or array 'answers'
    const userId = req.user.id;
    const questionId = req.params.id;

    const question = await Question.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    let userAnswerArray = Array.isArray(answers) ? answers : [answer || -1];
    let isCorrect;

    if (question.questionType === 'single') {
      isCorrect = userAnswerArray[0] === question.correctAnswers[0];
    } else { // multi
      const correctSet = new Set(question.correctAnswers);
      const userSet = new Set(userAnswerArray.filter(a => a >= 0));
      isCorrect = userSet.size === correctSet.size && [...userSet].every(a => correctSet.has(a));
    }

    const score = isCorrect ? question.marks : 0;

    // Create submission record
    const submission = await Submission.create({
      user: userId,
      question: questionId,
      type: 'aptitude',
      answer: JSON.stringify(userAnswerArray), // Store array as string for backward compat
      isCorrect,
      score,
      maxScore: question.marks
    });

    // Update user score if correct
    if (isCorrect) {
      await User.findByIdAndUpdate(userId, {
        $inc: { score: score, totalQuestionsSolved: 1 }
      });
    }

    res.status(200).json({
      success: true,
      isCorrect,
      score,
      maxScore: question.marks,
      questionType: question.questionType,
      correctAnswers: question.correctAnswers,
      explanation: question.explanation,
      submission: {
        id: submission._id,
        answer: userAnswerArray,
        isCorrect: submission.isCorrect,
        score: submission.score,
        submittedAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Submit answer error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting answer',
      error: error.message
    });
  }
};

// @desc    Add new question (Admin)
// @route   POST /api/questions
// @access  Private (Admin)
exports.addQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question
    });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
};

// @desc    Update question (Admin)
// @route   PUT /api/questions/:id
// @access  Private (Admin)
exports.updateQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete question (Admin)
// @route   DELETE /api/questions/:id
// @access  Private (Admin)
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// @desc    Bulk add questions (Admin)
// @route   POST /api/questions/bulk
// @access  Private (Admin)
exports.bulkAddQuestions = async (req, res) => {
  try {
    const { questions } = req.body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of questions'
      });
    }

    const createdQuestions = await Question.insertMany(questions);

    res.status(201).json({
      success: true,
      message: `${createdQuestions.length} questions created successfully`,
      count: createdQuestions.length
    });
  } catch (error) {
    console.error('Bulk add questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error bulk creating questions',
      error: error.message
    });
  }
};

