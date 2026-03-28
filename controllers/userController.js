const User = require('../models/User');
const Submission = require('../models/Submission');
const Question = require('../models/Question');
const CodingQuestion = require('../models/CodingQuestion');

// @desc    Get user profile
// @route   GET /api/user/profile
// @access  Private
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get recent submissions
    const recentSubmissions = await Submission.find({ user: user._id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('question', 'question category')
      .populate('codingQuestion', 'title');

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        score: user.score,
        testsCompleted: user.testsCompleted,
        totalQuestionsSolved: user.totalQuestionsSolved,
        totalCodingSolved: user.totalCodingSolved,
        rank: user.rank,
        education: user.education,
        skills: user.skills,
        projects: user.projects,
        experience: user.experience,
        createdAt: user.createdAt
      },
      recentActivity: recentSubmissions
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching profile',
      error: error.message
    });
  }
};

// @desc    Update user profile
// @route   PUT /api/user/profile
// @access  Private
exports.updateProfile = async (req, res) => {
  try {
    const { name, phone, education, skills, projects, experience } = req.body;

    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (education) user.education = education;
    if (skills) user.skills = skills;
    if (projects) user.projects = projects;
    if (experience) user.experience = experience;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        userType: user.userType,
        education: user.education,
        skills: user.skills,
        projects: user.projects,
        experience: user.experience
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

// @desc    Get user bookmarks
// @route   GET /api/user/bookmarks
// @access  Private
exports.getBookmarks = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('bookmarkedQuestions')
      .populate('bookmarkedCodingQuestions');

    res.status(200).json({
      success: true,
      questions: user.bookmarkedQuestions || [],
      codingQuestions: user.bookmarkedCodingQuestions || []
    });
  } catch (error) {
    console.error('Get bookmarks error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching bookmarks',
      error: error.message
    });
  }
};

// @desc    Add bookmark
// @route   POST /api/user/bookmarks
// @access  Private
exports.addBookmark = async (req, res) => {
  try {
    const { questionId, questionType, codingQuestionId } = req.body;
    const userId = req.user.id;

    if (questionType === 'aptitude' && questionId) {
      // Check if already bookmarked
      const user = await User.findById(userId);
      if (user.bookmarkedQuestions.includes(questionId)) {
        return res.status(400).json({
          success: false,
          message: 'Question already bookmarked'
        });
      }

      await User.findByIdAndUpdate(userId, {
        $push: { bookmarkedQuestions: questionId }
      });
    } else if (questionType === 'coding' && codingQuestionId) {
      const user = await User.findById(userId);
      if (user.bookmarkedCodingQuestions.includes(codingQuestionId)) {
        return res.status(400).json({
          success: false,
          message: 'Question already bookmarked'
        });
      }

      await User.findByIdAndUpdate(userId, {
        $push: { bookmarkedCodingQuestions: codingQuestionId }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookmark request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark added successfully'
    });
  } catch (error) {
    console.error('Add bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error adding bookmark',
      error: error.message
    });
  }
};

// @desc    Remove bookmark
// @route   DELETE /api/user/bookmarks
// @access  Private
exports.removeBookmark = async (req, res) => {
  try {
    const { questionId, questionType, codingQuestionId } = req.body;
    const userId = req.user.id;

    if (questionType === 'aptitude' && questionId) {
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedQuestions: questionId }
      });
    } else if (questionType === 'coding' && codingQuestionId) {
      await User.findByIdAndUpdate(userId, {
        $pull: { bookmarkedCodingQuestions: codingQuestionId }
      });
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid bookmark request'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Bookmark removed successfully'
    });
  } catch (error) {
    console.error('Remove bookmark error:', error);
    res.status(500).json({
      success: false,
      message: 'Error removing bookmark',
      error: error.message
    });
  }
};

// @desc    Get user submissions
// @route   GET /api/user/submissions
// @access  Private
exports.getSubmissions = async (req, res) => {
  try {
    const { type, page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    if (type) query.type = type;

    const submissions = await Submission.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate('question', 'question category difficulty')
      .populate('codingQuestion', 'title difficulty')
      .populate('mockTest', 'title company');

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
};

// @desc    Get user statistics
// @route   GET /api/user/stats
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get submission stats
    const totalSubmissions = await Submission.countDocuments({ user: userId });
    const correctSubmissions = await Submission.countDocuments({ user: userId, isCorrect: true });
    
    // Get category-wise stats
    const aptitudeStats = await Submission.aggregate([
      { $match: { user: userId, type: 'aptitude' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          correct: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          score: { $sum: '$score' }
        }
      }
    ]);

    const codingStats = await Submission.aggregate([
      { $match: { user: userId, type: 'programming' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          accepted: { $sum: { $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0] } },
          score: { $sum: '$score' }
        }
      }
    ]);

    const testStats = await Submission.aggregate([
      { $match: { user: userId, type: 'mocktest' } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          passed: { $sum: { $cond: ['$isCorrect', 1, 0] } },
          avgScore: { $avg: '$score' }
        }
      }
    ]);

    // Get user's rank
    const rank = await User.getLeaderboardRank(userId);

    const user = await User.findById(userId);

    res.status(200).json({
      success: true,
      stats: {
        overall: {
          totalScore: user.score,
          rank,
          totalQuestionsSolved: user.totalQuestionsSolved,
          totalCodingSolved: user.totalCodingSolved,
          testsCompleted: user.testsCompleted
        },
        aptitude: aptitudeStats[0] || { total: 0, correct: 0, score: 0 },
        coding: codingStats[0] || { total: 0, accepted: 0, score: 0 },
        mockTests: testStats[0] || { total: 0, passed: 0, avgScore: 0 }
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching stats',
      error: error.message
    });
  }
};

