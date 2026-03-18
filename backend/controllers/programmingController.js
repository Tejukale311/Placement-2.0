const ProgrammingQuestion = require('../models/ProgrammingQuestion');
const Submission = require('../models/Submission');
const User = require('../models/User');

// Judge0 API configuration
const JUDGE0_API_URL = 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

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
      'Content-Type': 'application/json',
      'X-RapidAPI-Key': JUDGE0_API_KEY,
      'X-RapidAPI-Host': JUDGE0_HOST
    }
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${JUDGE0_API_URL}${endpoint}`, options);
  return response.json();
};

// @desc    Get all programming questions
// @route   GET /api/programming
// @access  Public
exports.getProgrammingQuestions = async (req, res) => {
  try {

  const { section, topic, difficulty, page = 1, limit = 20 } = req.query;

  const query = { isActive: true };
  
  console.log('Query params:', { section, topic, difficulty });

  if (section) query.section = { $regex: section, $options: 'i' };
  if (topic) query.topic = { $regex: topic, $options: 'i' };

    if (difficulty) query.difficulty = { $regex: difficulty, $options: 'i' };

    const questions = await ProgrammingQuestion.find(query)
      .select('-solutionCode')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await ProgrammingQuestion.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      questions
    });
  } catch (error) {
    console.error('Get programming questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching programming questions',
      error: error.message
    });
  }
};

// @desc    Get sections
// @route   GET /api/programming/sections
exports.getSections = async (req, res) => {
  try {
    const sections = [
      'exercises',
      'technical-mcq', 
      'dsa',
      'interview-questions'
    ];
    res.json({ success: true, sections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get topics by section
// @route   GET /api/programming/topics/:section
exports.getTopics = async (req, res) => {
  try {
    const { section } = req.params;
    const topics = await ProgrammingQuestion.distinct('topic', { section });
    res.json({ success: true, topics: [...new Set(topics)] });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single programming question
// @route   GET /api/programming/:id
exports.getProgrammingQuestion = async (req, res) => {
  try {
    const question = await ProgrammingQuestion.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Programming question not found'
      });
    }

    const questionData = question.toObject();
    delete questionData.solutionCode;

    res.status(200).json({
      success: true,
      question: questionData
    });
  } catch (error) {
    console.error('Get programming question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching programming question',
      error: error.message
    });
  }
};

// @desc    Run code
// @route   POST /api/programming/run
exports.runCode = async (req, res) => {
  try {
    const { language, sourceCode, input } = req.body;

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

    const createResponse = await judge0Request('/submissions?base64_encoded=true&wait=true', 'POST', {
      source_code: Buffer.from(sourceCode).toString('base64'),
      language_id: languageId,
      stdin: input ? Buffer.from(input).toString('base64') : '',
      cpu_time_limit: 2,
      memory_limit: 128000
    });

    let stdout = createResponse.stdout ? Buffer.from(createResponse.stdout, 'base64').toString('utf8') : '';
    let stderr = createResponse.stderr ? Buffer.from(createResponse.stderr, 'base64').toString('utf8') : '';
    let compile_output = createResponse.compile_output ? Buffer.from(createResponse.compile_output, 'base64').toString('utf8') : '';

    let finalOutput = compile_output || stderr || stdout || 'No output';

    res.status(200).json({
      success: true,
      output: finalOutput,
      stdout, stderr, compile_output,
      status: createResponse.status?.description,
      time: createResponse.time,
      memory: createResponse.memory
    });
  } catch (error) {
    console.error('Run code error:', error);
    res.status(500).json({
      success: false,
      message: 'Error running code'
    });
  }
};

// @desc    Submit code
// @route   POST /api/programming/submit
exports.submitCode = async (req, res) => {
  try {
    const { language, sourceCode, questionId } = req.body;
    const userId = req.user.id;

    const question = await ProgrammingQuestion.findById(questionId);
    if (!question) return res.status(404).json({ success: false, message: 'Question not found' });

    const languageId = languageIds[language];
    if (!languageId) return res.status(400).json({ success: false, message: 'Unsupported language' });

    const testCases = question.testCases;
    let passedTests = 0;
    const results = [];

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      const createResponse = await judge0Request('/submissions?base64_encoded=true&wait=true', 'POST', {
        source_code: Buffer.from(sourceCode).toString('base64'),
        language_id: languageId,
        stdin: Buffer.from(testCase.input).toString('base64'),
        expected_output: Buffer.from(testCase.output).toString('base64'),
        cpu_time_limit: 2,
        memory_limit: 128000
      });

      const output = createResponse.stdout ? Buffer.from(createResponse.stdout, 'base64').toString().trim() : '';
      const isPassed = output === testCase.output.trim() && createResponse.status?.id === 3;

      if (isPassed) passedTests++;

      results.push({
        testCase: i + 1,
        input: testCase.input,
        expected: testCase.output,
        output,
        passed: isPassed
      });
    }

    const isSolved = passedTests === testCases.length;
    const score = isSolved ? question.points : 0;

    // Create submission
    await Submission.create({
      user: userId,
      programmingQuestion: questionId,
      type: 'programming',
      language,
      score,
      isCorrect: isSolved,
      testCasesPassed: passedTests,
      totalTestCases: testCases.length
    });

    if (isSolved) {
      await User.findByIdAndUpdate(userId, { $inc: { score: score } });
      await ProgrammingQuestion.findByIdAndUpdate(questionId, { $inc: { totalSubmissions: 1 } });
    }

    res.json({
      success: true,
      solved: isSolved,
      score,
      passedTests,
      totalTests: testCases.length,
      results
    });
  } catch (error) {
    console.error('Submit code error:', error);
    res.status(500).json({ success: false, message: 'Submit failed' });
  }
};

// Admin CRUD
exports.addProgrammingQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      isActive: true,
      points: req.body.points || 10,
      problemStatement: req.body.problemStatement || req.body.description || req.body.title
    };
    const question = await ProgrammingQuestion.create(questionData);
    res.status(201).json({ success: true, question });
  } catch (error) {
    console.error('Add question error:', error);
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateProgrammingQuestion = async (req, res) => {
  try {
    const question = await ProgrammingQuestion.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!question) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, question });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteProgrammingQuestion = async (req, res) => {
  try {
    const question = await ProgrammingQuestion.findByIdAndDelete(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleProgrammingQuestion = async (req, res) => {
  try {
    const question = await ProgrammingQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ success: false, message: 'Not found' });
    
    question.isActive = !question.isActive;
    await question.save();
    
    res.json({ success: true, question });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

