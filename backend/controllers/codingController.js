const CodingQuestion = require('../models/CodingQuestion');
const Submission = require('../models/Submission');
const User = require('../models/User');

// Judge0 Public Free API configuration (no key required)
const JUDGE0_API_URL = 'https://ce.judge0.com';

const languageIds = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  c: 50,
  sql: 82
};

// Helper function to make Judge0 API requests
const judge0Request = async (endpoint, method, body = null) => {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${JUDGE0_API_URL}${endpoint}`, options);
  return response.json();
};

// @desc    Get all coding questions
// @route   GET /api/coding-questions
// @access  Public
exports.getCodingQuestions = async (req, res) => {
  try {
    const { difficulty, category, page = 1, limit = 20 } = req.query;

    const query = { isActive: true };

    if (difficulty) query.difficulty = difficulty;
    if (category) query.category = category;

    const questions = await CodingQuestion.find(query)
      .select('-solution -testCases')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CodingQuestion.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      questions
    });
  } catch (error) {
    console.error('Get coding questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding questions',
      error: error.message
    });
  }
};

// @desc    Get single coding question
// @route   GET /api/coding-questions/:id
// @access  Public
exports.getCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    // Don't send solution and test cases
    const questionData = question.toObject();
    delete questionData.solution;
    delete questionData.testCases;

    res.status(200).json({
      success: true,
      question: questionData
    });
  } catch (error) {
    console.error('Get coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching coding question',
      error: error.message
    });
  }
};

// @desc    Get random coding question (Daily Challenge)
// @route   GET /api/coding-questions/daily
// @access  Private
exports.getDailyChallenge = async (req, res) => {
  try {
    // Get a random question based on difficulty
    const difficultyWeights = { easy: 0.5, medium: 0.35, hard: 0.15 };
    const random = Math.random();
    let difficulty;
    
    if (random < difficultyWeights.easy) difficulty = 'easy';
    else if (random < difficultyWeights.easy + difficultyWeights.medium) difficulty = 'medium';
    else difficulty = 'hard';

    const question = await CodingQuestion.aggregate([
      { $match: { isActive: true, difficulty } },
      { $sample: { size: 1 } }
    ]);

    if (question.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No daily challenge available'
      });
    }

    const q = question[0];
    const questionData = {
      _id: q._id,
      title: q.title,
      description: q.description,
      problemStatement: q.problemStatement,
      inputFormat: q.inputFormat,
      outputFormat: q.outputFormat,
      constraints: q.constraints,
      examples: q.examples,
      difficulty: q.difficulty,
      category: q.category,
      language: q.language,
      starterCode: q.starterCode,
      points: q.points,
      isDailyChallenge: true
    };

    // Check if user already solved today's challenge
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const existingSubmission = await Submission.findOne({
      user: req.user.id,
      codingQuestion: q._id,
      isDailyChallenge: true,
      challengeDate: { $gte: today }
    });

    res.status(200).json({
      success: true,
      question: questionData,
      alreadySolved: !!existingSubmission,
      previousSubmission: existingSubmission
    });
  } catch (error) {
    console.error('Get daily challenge error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching daily challenge',
      error: error.message
    });
  }
};

// @desc    Run code (without submission)
// @route   POST /api/coding-questions/run
// @access  Private
exports.runCode = async (req, res) => {
  try {
    // Accept both 'input' and 'stdin' from frontend
    const { language, sourceCode, input, stdin, questionId } = req.body;

    if (!language || !sourceCode) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language and source code'
      });
    }

    const languageId = languageIds[language];
    
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    // Use whichever input is provided (stdin or input)
    const codeInput = input || stdin || '';

    // Create submission on Judge0
    const createResponse = await judge0Request('/submissions?base64_encoded=true&wait=true', 'POST', {
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: languageId,
      stdin: codeInput ? Buffer.from(codeInput).toString('base64') : '',
      expected_output: null,
      cpu_time_limit: 2,
      memory_limit: 128000
    });

    // Properly decode base64 responses - handle null/undefined
    let stdout = '';
    let stderr = '';
    let compile_output = '';

    try {
      stdout = createResponse.stdout ? Buffer.from(createResponse.stdout, 'base64').toString('utf8') : '';
    } catch (e) {
      stdout = createResponse.stdout || '';
    }

    try {
      stderr = createResponse.stderr ? Buffer.from(createResponse.stderr, 'base64').toString('utf8') : '';
    } catch (e) {
      stderr = createResponse.stderr || '';
    }

    try {
      compile_output = createResponse.compile_output ? Buffer.from(createResponse.compile_output, 'base64').toString('utf8') : '';
    } catch (e) {
      compile_output = createResponse.compile_output || '';
    }

    // Determine the final output to return
    let finalOutput = '';
    let outputType = 'stdout';

    // Priority: compile_output > stderr > stdout
    if (compile_output && compile_output.trim()) {
      finalOutput = compile_output;
      outputType = 'compile_output';
    } else if (stderr && stderr.trim()) {
      finalOutput = stderr;
      outputType = 'stderr';
    } else if (stdout !== null && stdout !== undefined) {
      finalOutput = stdout;
      outputType = 'stdout';
    }

    // If no output at all, provide a helpful message
    if (!finalOutput || !finalOutput.trim()) {
      // Check the status - if it's "Accepted" but no output, code might just not print anything
      const statusDesc = createResponse.status?.description || '';
      if (statusDesc.toLowerCase().includes('accepted')) {
        finalOutput = 'Code executed successfully (no output)';
      } else {
        finalOutput = 'No output';
      }
    }

    res.status(200).json({
      success: true,
      output: finalOutput,
      stdout: stdout,
      stderr: stderr,
      compile_output: compile_output,
      outputType: outputType,
      status: createResponse.status,
      statusDescription: createResponse.status?.description,
      time: createResponse.time,
      memory: createResponse.memory
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running code',
      error: error.message
    });
  }
};

// @desc    Submit code (with test cases)
// @route   POST /api/coding-questions/submit
// @access  Private
exports.submitCode = async (req, res) => {
  try {
    const { language, sourceCode, questionId } = req.body;
    const userId = req.user.id;

    if (!language || !sourceCode || !questionId) {
      return res.status(400).json({
        success: false,
        message: 'Please provide language, source code, and question ID'
      });
    }

    const question = await CodingQuestion.findById(questionId);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    const languageId = languageIds[language];
    
    if (!languageId) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported language'
      });
    }

    const testCases = question.testCases;
    let passedTests = 0;
    const results = [];

    // Run each test case
    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      const createResponse = await judge0Request('/submissions?base64_encoded=true&wait=true', 'POST', {
        source_code: Buffer.from(sourceCode).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(testCase.input).toString('base64'),
        expected_output: Buffer.from(testCase.output).toString('base64'),
        cpu_time_limit: question.timeLimit,
        memory_limit: question.memoryLimit * 1000
      });

      const output = createResponse.stdout ? Buffer.from(createResponse.stdout, 'base64').toString().trim() : '';
      const expectedOutput = testCase.output.trim();
      const isPassed = output === expectedOutput && createResponse.status.id === 3;

      if (isPassed) passedTests++;

      results.push({
        testCase: i + 1,
        input: testCase.input,
        expectedOutput: testCase.output,
        output,
        status: createResponse.status.description,
        isPassed,
        time: createResponse.time,
        memory: createResponse.memory
      });
    }

    const isAllPassed = passedTests === testCases.length;
    const score = isAllPassed ? question.points : Math.floor(question.points * (passedTests / testCases.length));

    // Create submission record
    const submission = await Submission.create({
      user: userId,
      codingQuestion: questionId,
      type: 'programming',
      code: {
        language,
        sourceCode
      },
      isCorrect: isAllPassed,
      score,
      maxScore: question.points,
      testCasesPassed: passedTests,
      totalTestCases: testCases.length,
      status: isAllPassed ? 'accepted' : 'wrong_answer'
    });

    // Update user score
    if (isAllPassed) {
      await User.findByIdAndUpdate(userId, {
        $inc: { score: score, totalCodingSolved: 1 }
      });

      // Update question stats
      await CodingQuestion.findByIdAndUpdate(questionId, {
        $inc: { totalSubmissions: 1 }
      });
    }

    res.status(200).json({
      success: true,
      isCorrect: isAllPassed,
      score,
      maxScore: question.points,
      passedTests,
      totalTests: testCases.length,
      results,
      submission: {
        id: submission._id,
        isCorrect: submission.isCorrect,
        score: submission.score,
        submittedAt: submission.createdAt
      }
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error submitting code',
      error: error.message
    });
  }
};

// @desc    Add new coding question (Admin)
// @route   POST /api/coding-questions
// @access  Private (Admin)
exports.addCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Coding question created successfully',
      question
    });
  } catch (error) {
    console.error('Add coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating coding question',
      error: error.message
    });
  }
};

// @desc    Update coding question (Admin)
// @route   PUT /api/coding-questions/:id
// @access  Private (Admin)
exports.updateCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coding question updated successfully',
      question
    });
  } catch (error) {
    console.error('Update coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating coding question',
      error: error.message
    });
  }
};

// @desc    Delete coding question (Admin)
// @route   DELETE /api/coding-questions/:id
// @access  Private (Admin)
exports.deleteCodingQuestion = async (req, res) => {
  try {
    const question = await CodingQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Coding question deleted successfully'
    });
  } catch (error) {
    console.error('Delete coding question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting coding question',
      error: error.message
    });
  }
};

