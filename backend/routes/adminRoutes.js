const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');
const CompanyQuestion = require('../models/CompanyQuestion');
const MockTest = require('../models/MockTest');
const Submission = require('../models/Submission');
const { protect, isAdmin } = require('../middleware/auth');

// All routes require admin
router.use(protect, isAdmin);

// ==================== DASHBOARD ====================

// @desc    Get admin dashboard stats
// @route   GET /api/admin/dashboard
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalUsers,
      verifiedUsers,
      adminUsers,
      activeUsers,
      totalQuestions,
      totalCodingQuestions,
      totalCompanyQuestions,
      totalMockTests,
      totalSubmissions,
      todaySubmissions,
      weekSubmissions
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isVerified: true }),
      User.countDocuments({ isAdmin: true }),
      User.countDocuments({ status: 'active' }),
      Question.countDocuments(),
      CodingQuestion.countDocuments(),
      CompanyQuestion.countDocuments(),
      MockTest.countDocuments(),
      Submission.countDocuments(),
      Submission.countDocuments({
        createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
      }),
      Submission.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      })
    ]);

    // Daily signups for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailySignups = await User.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Daily submissions for last 30 days
    const dailySubmissions = await Submission.aggregate([
      { $match: { createdAt: { $gte: thirtyDaysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Top users
    const topUsers = await User.find()
      .select('name email score testsCompleted userType createdAt')
      .sort({ score: -1 })
      .limit(10);

    // Recent users
    const recentUsers = await User.find()
      .select('name email userType createdAt')
      .sort({ createdAt: -1 })
      .limit(5);

    // Category distribution
    const questionCategories = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const codingCategories = await CodingQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    // Recent activity
    const recentActivity = await Submission.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'name email')
      .populate('question', 'question')
      .populate('codingQuestion', 'title');

    res.status(200).json({
      success: true,
      stats: {
        users: {
          total: totalUsers,
          verified: verifiedUsers,
          admins: adminUsers,
          active: activeUsers
        },
        questions: {
          aptitude: questionCategories.find(c => c._id === 'aptitude')?.count || 0,
          programming: questionCategories.find(c => c._id === 'programming')?.count || 0,
          reasoning: questionCategories.find(c => c._id === 'reasoning')?.count || 0,
          verbal: questionCategories.find(c => c._id === 'verbal')?.count || 0,
          total: totalQuestions
        },
        coding: {
          total: totalCodingQuestions,
          byCategory: codingCategories
        },
        companyQuestions: totalCompanyQuestions,
        tests: {
          total: totalMockTests
        },
        submissions: {
          total: totalSubmissions,
          today: todaySubmissions,
          thisWeek: weekSubmissions
        },
        topUsers,
        recentUsers,
        dailySignups,
        dailySubmissions,
        recentActivity,
        questionCategories
      }
    });
  } catch (error) {
    console.error('Get dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching dashboard',
      error: error.message
    });
  }
});

// ==================== USER MANAGEMENT ====================

// @desc    Get all users
// @route   GET /api/admin/users
router.get('/users', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      userType, 
      role, 
      status,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;
    
    let query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (userType) query.userType = userType;
    if (role) query.role = role;
    if (status) query.status = status;

    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const users = await User.find(query)
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpiry')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.status(200).json({
      success: true,
      count: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      users
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching users',
      error: error.message
    });
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password -otp -otpExpiry -resetPasswordOTP -resetPasswordExpiry');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get user submissions
    const submissions = await Submission.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('question', 'question category')
      .populate('codingQuestion', 'title');

    // Get user stats
    const stats = await Submission.aggregate([
      { $match: { user: require('mongoose').Types.ObjectId(req.params.id) } },
      {
        $group: {
          _id: null,
          totalSubmissions: { $sum: 1 },
          correctSubmissions: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          totalScore: { $sum: '$score' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      user,
      submissions,
      stats: stats[0] || { totalSubmissions: 0, correctSubmissions: 0, totalScore: 0 }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user',
      error: error.message
    });
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
router.put('/users/:id', async (req, res) => {
  try {
    const { name, email, phone, userType, role, status, score, testsCompleted } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update fields
    if (name) user.name = name;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (userType) user.userType = userType;
    if (role) {
      user.role = role;
      user.isAdmin = (role === 'admin' || role === 'superadmin');
    }
    if (status) user.status = status;
    if (score !== undefined) user.score = score;
    if (testsCompleted !== undefined) user.testsCompleted = testsCompleted;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        role: user.role,
        status: user.status,
        score: user.score,
        testsCompleted: user.testsCompleted
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating user',
      error: error.message
    });
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete your own account'
      });
    }

    // Delete user's submissions
    await Submission.deleteMany({ user: req.params.id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting user',
      error: error.message
    });
  }
});

// @desc    Block user
// @route   POST /api/admin/users/:id/block
router.post('/users/:id/block', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Cannot block your own account'
      });
    }

    user.status = 'blocked';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User blocked successfully'
    });
  } catch (error) {
    console.error('Block user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error blocking user',
      error: error.message
    });
  }
});

// @desc    Unblock user
// @route   POST /api/admin/users/:id/unblock
router.post('/users/:id/unblock', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.status = 'active';
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully'
    });
  } catch (error) {
    console.error('Unblock user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error unblocking user',
      error: error.message
    });
  }
});

// @desc    Promote user to admin
// @route   POST /api/admin/users/:id/promote
router.post('/users/:id/promote', async (req, res) => {
  try {
    const { role = 'admin' } = req.body;

    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.role = role;
    user.isAdmin = true;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User promoted to ${role} successfully`
    });
  } catch (error) {
    console.error('Promote user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error promoting user',
      error: error.message
    });
  }
});

// @desc    Reset user progress
// @route   POST /api/admin/users/:id/reset
router.post('/users/:id/reset', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Reset user stats
    user.score = 0;
    user.testsCompleted = 0;
    user.totalQuestionsSolved = 0;
    user.totalCodingSolved = 0;
    user.dailyStreak = 0;
    user.bookmarkedQuestions = [];
    user.bookmarkedCodingQuestions = [];
    await user.save();

    // Delete user's submissions
    await Submission.deleteMany({ user: req.params.id });

    res.status(200).json({
      success: true,
      message: 'User progress reset successfully'
    });
  } catch (error) {
    console.error('Reset user error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting user progress',
      error: error.message
    });
  }
});

// ==================== QUESTION MANAGEMENT ====================

// @desc    Get all questions (Admin)
// @route   GET /api/admin/questions
router.get('/questions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      topic, 
      difficulty,
      search 
    } = req.query;

    let query = { isActive: true };

    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } },
        { topic: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    // Get category counts
    const categoryCounts = await Question.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      categoryCounts,
      questions
    });
  } catch (error) {
    console.error('Get admin questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});


// @desc    Add new question (Admin)
// @route   POST /api/admin/questions
router.post('/questions', protect, isAdmin, async (req, res) => {
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
});

// @desc    Update question (Admin)
// @route   PUT /api/admin/questions/:id
router.put('/questions/:id', protect, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!question) {
      return res.status(400).json({
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
      message: error.message
    });
  }
});

// @desc    Delete question (Admin)
// @route   DELETE /api/admin/questions/:id
router.delete('/questions/:id', protect, isAdmin, async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Delete related submissions
    await Submission.deleteMany({ question: req.params.id });

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
});

// @desc    Add new question (Admin)
// @route   POST /api/admin/questions
router.post('/questions', async (req, res) => {
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
});

// @desc    Update question (Admin)
// @route   PUT /api/admin/questions/:id
router.put('/questions/:id', async (req, res) => {
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
});

// @desc    Delete question (Admin)
// @route   DELETE /api/admin/questions/:id
router.delete('/questions/:id', async (req, res) => {
  try {
    const question = await Question.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Delete related submissions
    await Submission.deleteMany({ question: req.params.id });

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
});

// @desc    Bulk add questions (Admin)
// @route   POST /api/admin/questions/bulk
router.post('/questions/bulk', async (req, res) => {
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
});

// ==================== CODING QUESTION MANAGEMENT ====================

// @desc    Get all coding questions (Admin)
// @route   GET /api/admin/coding-questions
router.get('/coding-questions', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      category, 
      difficulty,
      search 
    } = req.query;

    let query = {};

    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await CodingQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .select('-testCases -solution');

    const total = await CodingQuestion.countDocuments(query);

    // Get category counts
    const categoryCounts = await CodingQuestion.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      categoryCounts,
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
});

// @desc    Add new coding question (Admin)
// @route   POST /api/admin/coding-questions
router.post('/coding-questions', async (req, res) => {
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
});

// @desc    Update coding question (Admin)
// @route   PUT /api/admin/coding-questions/:id
router.put('/coding-questions/:id', async (req, res) => {
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
});

// @desc    Delete coding question (Admin)
// @route   DELETE /api/admin/coding-questions/:id
router.delete('/coding-questions/:id', async (req, res) => {
  try {
    const question = await CodingQuestion.findByIdAndDelete(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        message: 'Coding question not found'
      });
    }

    // Delete related submissions
    await Submission.deleteMany({ codingQuestion: req.params.id });

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
});

// ==================== COMPANY QUESTION MANAGEMENT ====================

// @desc    Get all company questions (Admin)
// @route   GET /api/admin/company-questions
router.get('/company-questions', async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;

    let query = {};
    if (search) {
      query.company = { $regex: search, $options: 'i' };
    }

    const companies = await CompanyQuestion.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await CompanyQuestion.countDocuments(query);

    res.status(200).json({
      success: true,
      count: companies.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      companies
    });
  } catch (error) {
    console.error('Get company questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching company questions',
      error: error.message
    });
  }
});

// @desc    Add new company (Admin)
// @route   POST /api/admin/company-questions
router.post('/company-questions', async (req, res) => {
  try {
    const company = await CompanyQuestion.create(req.body);

    res.status(201).json({
      success: true,
      message: 'Company created successfully',
      company
    });
  } catch (error) {
    console.error('Add company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating company',
      error: error.message
    });
  }
});

// @desc    Update company (Admin)
// @route   PUT /api/admin/company-questions/:id
router.put('/company-questions/:id', async (req, res) => {
  try {
    const company = await CompanyQuestion.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        success: false,
        message: 'Company not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company updated successfully',
      company
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating company',
      error: error.message
    });
  }
});

// @desc    Delete company (Admin)
// @route   DELETE /api/admin/company-questions/:id
router.delete('/company-questions/:id', async (req, res) => {
  try {
    const company = await CompanyQuestion.findByIdAndDelete(req.params.id);

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
});

// ==================== MOCK TEST MANAGEMENT ====================

// @desc    Get all mock tests (Admin)
const { getMockTests, createMockTest, updateMockTest, deleteMockTest, toggleMockTest } = require('../controllers/mockTestController');
router.get('/mock-tests', getMockTests);



// @desc    Add new mock test (Admin)
router.post('/mock-tests', createMockTest);


// @desc    Update mock test (Admin)
router.put('/mock-tests/:id', updateMockTest);


// @desc    Delete mock test (Admin)
router.delete('/mock-tests/:id', deleteMockTest);


// @desc    Toggle mock test status (Admin)
router.post('/mock-tests/:id/toggle', toggleMockTest);


// ==================== LEADERBOARD MANAGEMENT ====================

// @desc    Get leaderboard (Admin)
// @route   GET /api/admin/leaderboard
router.get('/leaderboard', async (req, res) => {
  try {
    const { limit = 100, userType } = req.query;

    let query = {};
    if (userType) query.userType = userType;

    const leaderboard = await User.find(query)
      .select('name email score testsCompleted userType totalQuestionsSolved totalCodingSolved')
      .sort({ score: -1 })
      .limit(parseInt(limit));

    // Add rank
    const rankedLeaderboard = leaderboard.map((user, index) => ({
      ...user.toObject(),
      rank: index + 1
    }));

    res.status(200).json({
      success: true,
      count: rankedLeaderboard.length,
      leaderboard: rankedLeaderboard
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching leaderboard',
      error: error.message
    });
  }
});

// @desc    Reset leaderboard (Admin)
// @route   POST /api/admin/leaderboard/reset
router.post('/leaderboard/reset', async (req, res) => {
  try {
    await User.updateMany(
      { role: { $ne: 'superadmin' } },
      { 
        score: 0, 
        testsCompleted: 0, 
        totalQuestionsSolved: 0, 
        totalCodingSolved: 0,
        rank: 0 
      }
    );

    // Delete all submissions
    await Submission.deleteMany({});

    res.status(200).json({
      success: true,
      message: 'Leaderboard reset successfully'
    });
  } catch (error) {
    console.error('Reset leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error resetting leaderboard',
      error: error.message
    });
  }
});

// ==================== ANALYTICS ====================

// @desc    Get analytics
// @route   GET /api/admin/analytics
router.get('/analytics', async (req, res) => {
  try {
    const { period = '30' } = req.query;
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(period));

    // User stats
    const totalUsers = await User.countDocuments();
    const newUsers = await User.countDocuments({ createdAt: { $gte: daysAgo } });
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const activeUsers = await User.countDocuments({ status: 'active' });

    // Question stats
    const totalQuestions = await Question.countDocuments();
    const totalCodingQuestions = await CodingQuestion.countDocuments();

    // Test stats
    const totalMockTests = await MockTest.countDocuments({ isActive: true });

    // Submission stats
    const totalSubmissions = await Submission.countDocuments();
    const periodSubmissions = await Submission.countDocuments({ createdAt: { $gte: daysAgo } });

    // Daily users (for chart)
    const dailyUsers = await User.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Daily submissions (for chart)
    const dailySubmissions = await Submission.aggregate([
      { $match: { createdAt: { $gte: daysAgo } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Most solved questions
    const mostSolvedQuestions = await Submission.aggregate([
      { $match: { question: { $ne: null }, isCorrect: true } },
      { $group: { _id: '$question', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'questions',
          localField: '_id',
          foreignField: '_id',
          as: 'question'
        }
      },
      { $unwind: '$question' },
      {
        $project: {
          question: '$question.question',
          category: '$question.category',
          count: 1
        }
      }
    ]);

    // User type distribution
    const userTypeDistribution = await User.aggregate([
      { $group: { _id: '$userType', count: { $sum: 1 } } }
    ]);

    // Difficulty distribution
    const difficultyDistribution = await Question.aggregate([
      { $group: { _id: '$difficulty', count: { $sum: 1 } } }
    ]);

    // Average scores
    const averageScores = await User.aggregate([
      { $match: { score: { $gt: 0 } } },
      {
        $group: {
          _id: null,
          averageScore: { $avg: '$score' },
          averageTests: { $avg: '$testsCompleted' }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      analytics: {
        users: {
          total: totalUsers,
          new: newUsers,
          verified: verifiedUsers,
          active: activeUsers,
          byType: userTypeDistribution
        },
        questions: {
          total: totalQuestions,
          coding: totalCodingQuestions,
          byDifficulty: difficultyDistribution
        },
        tests: {
          total: totalMockTests
        },
        submissions: {
          total: totalSubmissions,
          period: periodSubmissions,
          daily: dailySubmissions
        },
        mostSolvedQuestions,
        averageScore: averageScores[0]?.averageScore || 0,
        averageTests: averageScores[0]?.averageTests || 0,
        dailyUsers
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
});

// ==================== SUBMISSIONS ====================

// @desc    Get all submissions (Admin)
// @route   GET /api/admin/submissions
router.get('/submissions', async (req, res) => {
  try {
    const { page = 1, limit = 50, userId, type } = req.query;
    
    let query = {};
    if (userId) query.user = userId;
    if (type) query.type = type;

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('user', 'name email')
      .populate('question', 'question category difficulty')
      .populate('codingQuestion', 'title difficulty')
      .populate('mockTest', 'title');

    const total = await Submission.countDocuments(query);

    res.status(200).json({
      success: true,
      count: submissions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      submissions
    });
  } catch (error) {
    console.error('Get submissions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching submissions',
      error: error.message
    });
  }
});

// ==================== SYSTEM SETTINGS ====================

// @desc    Get system settings
// @route   GET /api/admin/settings
router.get('/settings', async (req, res) => {
  try {
    // In a real app, these would be stored in a Settings model
    const settings = {
      siteName: 'Placement Preparation Portal',
      maintenanceMode: false,
      allowRegistration: true,
      emailVerification: true,
      otpExpiry: 10,
      maxLoginAttempts: 5,
      defaultUserRole: 'user',
      apiRateLimit: 100
    };

    res.status(200).json({
      success: true,
      settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching settings',
      error: error.message
    });
  }
});

// @desc    Update system settings
// @route   PUT /api/admin/settings
router.put('/settings', async (req, res) => {
  try {
    // In a real app, these would be saved to a Settings model
    const settings = req.body;

    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating settings',
      error: error.message
    });
  }
});

module.exports = router;

