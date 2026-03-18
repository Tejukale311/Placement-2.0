const CompanyQuestion = require('../models/CompanyQuestion');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');

// @desc    Get all companies
// @route   GET /api/companies
// @access  Public
exports.getCompanies = async (req, res) => {
  try {
    // Get all companies from database
    const companies = await CompanyQuestion.find({}).sort({ company: 1 });

    // If there are companies in DB, return them with counts
    if (companies.length > 0) {
      const companiesWithCounts = companies.map(c => ({
        _id: c._id,
        name: c.company,
        logo: c.logo,
        description: c.description,
        totalQuestions: c.totalQuestions || 0,
        totalCoding: c.totalCoding || 0,
        totalInterview: c.totalInterview || 0,
        createdAt: c.createdAt
      }));

      return res.status(200).json({
        success: true,
        count: companiesWithCounts.length,
        companies: companiesWithCounts
      });
    }

    // Return empty array if no companies in DB - user needs to add via admin
    res.status(200).json({
      success: true,
      count: 0,
      companies: []
    });
  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching companies',
      error: error.message
    });
  }
};

// @desc    Get single company questions
// @route   GET /api/companies/:name
// @access  Public
exports.getCompanyQuestions = async (req, res) => {
  try {
    const { name } = req.params;
    const { type } = req.query;

    const company = await CompanyQuestion.findOne({ company: name });

    if (!company) {
      // Return sample data if not in database
      return res.status(200).json({
        success: true,
        company: {
          name,
          description: `${name} interview questions and placement preparation`,
          questions: [],
          interviewQuestions: getSampleInterviewQuestions(name),
          codingProblems: getSampleCodingProblems(name)
        }
      });
    }

    let questions = company.questions;

    if (type && type !== 'all') {
      questions = questions.filter(q => q.type === type);
    }

    res.status(200).json({
      success: true,
      company: {
        _id: company._id,
        name: company.company,
        logo: company.logo,
        description: company.description,
        questions,
        interviewQuestions: company.interviewQuestions,
        codingProblems: company.codingProblems,
        placementProcess: company.placementProcess,
        totalQuestions: questions.length,
        totalCoding: company.codingProblems.length,
        totalInterview: company.interviewQuestions.length
      }
    });
  } catch (error) {
    console.error('Get company questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company questions',
      error: error.message
    });
  }
};

// @desc    Add or update company questions (Admin)
// @route   POST /api/companies
// @access  Private (Admin)
exports.addCompanyQuestions = async (req, res) => {
  try {
    const { company, questions, interviewQuestions, codingProblems, placementProcess, logo, description } = req.body;

    // Check if company exists
    let companyDoc = await CompanyQuestion.findOne({ company });

    if (companyDoc) {
      // Update existing
      companyDoc.questions = questions || companyDoc.questions;
      companyDoc.interviewQuestions = interviewQuestions || companyDoc.interviewQuestions;
      companyDoc.codingProblems = codingProblems || companyDoc.codingProblems;
      companyDoc.placementProcess = placementProcess || companyDoc.placementProcess;
      if (logo) companyDoc.logo = logo;
      if (description) companyDoc.description = description;
      
      await companyDoc.save();
    } else {
      // Create new
      companyDoc = await CompanyQuestion.create({
        company,
        questions: questions || [],
        interviewQuestions: interviewQuestions || [],
        codingProblems: codingProblems || [],
        placementProcess: placementProcess || [],
        logo: logo || '',
        description: description || ''
      });
    }

    // Update counts
    await CompanyQuestion.updateCounts(company);

    res.status(201).json({
      success: true,
      message: 'Company questions updated successfully',
      company: companyDoc
    });
  } catch (error) {
    console.error('Add company questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding company questions',
      error: error.message
    });
  }
};

// @desc    Delete company (Admin)
// @route   DELETE /api/companies/:name
// @access  Private (Admin)
exports.deleteCompany = async (req, res) => {
  try {
    const company = await CompanyQuestion.findOneAndDelete({ company: req.params.name });

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company deleted successfully'
    });
  } catch (error) {
    console.error('Delete company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting company',
      error: error.message
    });
  }
};

// @desc    Get company by ID
// @route   GET /api/companies/id/:id
// @access  Public
exports.getCompanyById = async (req, res) => {
  try {
    const company = await CompanyQuestion.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      company
    });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company',
      error: error.message
    });
  }
};

// @desc    Add question to company
// @route   POST /api/companies/:id/questions
// @access  Private (Admin)
exports.addCompanyQuestion = async (req, res) => {
  try {
    const { question, options, answer, difficulty, type, topic } = req.body;

    const company = await CompanyQuestion.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    // Add the new question
    company.questions.push({
      type: type || 'mcq',
      question,
      options: options || [],
      answer,
      difficulty: difficulty || 'medium',
      topic
    });

    await company.save();

    // Update counts
    await CompanyQuestion.updateCounts(company.company);

    res.status(201).json({
      success: true,
      message: 'Question added successfully',
      question: company.questions[company.questions.length - 1]
    });
  } catch (error) {
    console.error('Add company question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding question',
      error: error.message
    });
  }
};

// @desc    Update company question
// @route   PUT /api/companies/:id/questions/:questionId
// @access  Private (Admin)
exports.updateCompanyQuestion = async (req, res) => {
  try {
    const { question, options, answer, difficulty, type, topic } = req.body;

    const company = await CompanyQuestion.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const questionIndex = company.questions.findIndex(
      q => q._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Update the question
    if (question) company.questions[questionIndex].question = question;
    if (options) company.questions[questionIndex].options = options;
    if (answer !== undefined) company.questions[questionIndex].answer = answer;
    if (difficulty) company.questions[questionIndex].difficulty = difficulty;
    if (type) company.questions[questionIndex].type = type;
    if (topic) company.questions[questionIndex].topic = topic;

    await company.save();

    // Update counts
    await CompanyQuestion.updateCounts(company.company);

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question: company.questions[questionIndex]
    });
  } catch (error) {
    console.error('Update company question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
};

// @desc    Delete company question
// @route   DELETE /api/companies/:id/questions/:questionId
// @access  Private (Admin)
exports.deleteCompanyQuestion = async (req, res) => {
  try {
    const company = await CompanyQuestion.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    const questionIndex = company.questions.findIndex(
      q => q._id.toString() === req.params.questionId
    );

    if (questionIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Remove the question
    company.questions.splice(questionIndex, 1);

    await company.save();

    // Update counts
    await CompanyQuestion.updateCounts(company.company);

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully'
    });
  } catch (error) {
    console.error('Delete company question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
};

// Helper functions for sample data
function getSampleInterviewQuestions(company) {
  const sampleQuestions = {
    'TCS': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'HR', frequency: 95 },
      { question: 'Why do you want to join TCS?', difficulty: 'easy', category: 'HR', frequency: 90 },
      { question: 'What are your strengths and weaknesses?', difficulty: 'easy', category: 'HR', frequency: 85 },
      { question: 'Explain your project in detail', difficulty: 'medium', category: 'Technical', frequency: 95 },
      { question: 'What is OOP?', difficulty: 'easy', category: 'Technical', frequency: 80 }
    ],
    'Infosys': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'HR', frequency: 90 },
      { question: 'Why Infosys?', difficulty: 'easy', category: 'HR', frequency: 85 },
      { question: 'Explain polymorphism with example', difficulty: 'medium', category: 'Technical', frequency: 75 },
      { question: 'What is the difference between SQL and NoSQL?', difficulty: 'medium', category: 'Technical', frequency: 70 },
      { question: 'Explain your final year project', difficulty: 'medium', category: 'Technical', frequency: 90 }
    ],
    'Amazon': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'Leadership', frequency: 95 },
      { question: 'Why Amazon?', difficulty: 'easy', category: 'Leadership', frequency: 90 },
      { question: 'Describe a challenging situation and how you handled it', difficulty: 'hard', category: 'Leadership', frequency: 95 },
      { question: 'Explain the concept of AWS', difficulty: 'medium', category: 'Technical', frequency: 80 },
      { question: 'What is the time complexity of quicksort?', difficulty: 'medium', category: 'Technical', frequency: 75 }
    ],
    'Google': [
      { question: 'Tell me about yourself', difficulty: 'easy', category: 'General', frequency: 90 },
      { question: 'Why Google?', difficulty: 'easy', category: 'General', frequency: 85 },
      { question: 'Explain bubble sort and its complexity', difficulty: 'medium', category: 'Technical', frequency: 70 },
      { question: 'What happens when you type google.com in browser?', difficulty: 'hard', category: 'Technical', frequency: 85 },
      { question: 'Design a URL shortener', difficulty: 'hard', category: 'System Design', frequency: 80 }
    ]
  };

  return sampleQuestions[company] || [
    { question: 'Tell me about yourself', difficulty: 'easy', category: 'General', frequency: 80 },
    { question: 'Why do you want to join us?', difficulty: 'easy', category: 'HR', frequency: 75 },
    { question: 'Tell me about your projects', difficulty: 'medium', category: 'Technical', frequency: 85 }
  ];
}

function getSampleCodingProblems(company) {
  const sampleProblems = {
    'TCS': [
      { title: 'Reverse a String', difficulty: 'easy', topics: ['Strings'] },
      { title: 'Check Palindrome', difficulty: 'easy', topics: ['Strings'] },
      { title: 'Find Maximum in Array', difficulty: 'easy', topics: ['Arrays'] }
    ],
    'Infosys': [
      { title: 'Two Sum', difficulty: 'easy', topics: ['Arrays', 'Hashing'] },
      { title: 'Valid Parentheses', difficulty: 'medium', topics: ['Stacks'] },
      { title: 'Merge Sorted Arrays', difficulty: 'medium', topics: ['Arrays'] }
    ],
    'Amazon': [
      { title: 'Two Sum', difficulty: 'easy', topics: ['Arrays', 'Hashing'] },
      { title: 'Longest Substring Without Repeating Characters', difficulty: 'medium', topics: ['Sliding Window'] },
      { title: 'LRU Cache', difficulty: 'hard', topics: ['Design'] },
      { title: 'Number of Islands', difficulty: 'medium', topics: ['Graphs', 'DFS'] }
    ],
    'Google': [
      { title: 'Two Sum', difficulty: 'easy', topics: ['Arrays'] },
      { title: 'Reverse Linked List', difficulty: 'easy', topics: ['Linked Lists'] },
      { title: 'Merge Intervals', difficulty: 'medium', topics: ['Arrays', 'Sorting'] },
      { title: 'Median of Two Sorted Arrays', difficulty: 'hard', topics: ['Binary Search'] }
    ]
  };

  return sampleProblems[company] || [
    { title: 'Basic Programming Question', difficulty: 'easy', topics: ['Basics'] }
  ];
}

