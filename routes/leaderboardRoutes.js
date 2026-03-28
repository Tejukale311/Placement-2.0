const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Submission = require('../models/Submission');

// @desc    Get leaderboard
// @route   GET /api/leaderboard
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { type = 'overall', page = 1, limit = 20 } = req.query;

    let sortOption = { score: -1, testsCompleted: -1 };

    // Get top users by score
    const users = await User.find({ isVerified: true, isAdmin: false })
      .select('name email score testsCompleted totalQuestionsSolved totalCodingSolved')
      .sort(sortOption)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    // Add rank to each user
    const leaderboard = users.map((user, index) => ({
      rank: (page - 1) * limit + index + 1,
      _id: user._id,
      name: user.name,
      email: user.email,
      score: user.score,
      testsCompleted: user.testsCompleted,
      totalQuestionsSolved: user.totalQuestionsSolved,
      totalCodingSolved: user.totalCodingSolved
    }));

    const total = await User.countDocuments({ isVerified: true, isAdmin: false });

    // Get current user's rank if authenticated (handled in frontend)
    res.status(200).json({
      success: true,
      count: leaderboard.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      leaderboard
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

// @desc    Get user's rank
// @route   GET /api/leaderboard/my-rank
// @access  Private
router.get('/my-rank', async (req, res) => {
  try {
    const userId = req.user.id;

    // Get user's position in leaderboard
    const rank = await User.getLeaderboardRank(userId);
    const user = await User.findById(userId)
      .select('name score testsCompleted totalQuestionsSolved totalCodingSolved');

    res.status(200).json({
      success: true,
      rank,
      user: {
        name: user.name,
        score: user.score,
        testsCompleted: user.testsCompleted,
        totalQuestionsSolved: user.totalQuestionsSolved,
        totalCodingSolved: user.totalCodingSolved
      }
    });
  } catch (error) {
    console.error('Get my rank error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching rank',
      error: error.message
    });
  }
});

// @desc    Get weekly top performers
// @route   GET /api/leaderboard/weekly
// @access  Public
router.get('/weekly', async (req, res) => {
  try {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get submissions in last week and aggregate scores
    const weeklyStats = await Submission.aggregate([
      { $match: { createdAt: { $gte: oneWeekAgo } } },
      {
        $group: {
          _id: '$user',
          weeklyScore: { $sum: '$score' },
          submissionsCount: { $sum: 1 }
        }
      },
      { $sort: { weeklyScore: -1 } },
      { $limit: 10 }
    ]);

    // Populate user details
    const userIds = weeklyStats.map(s => s._id);
    const users = await User.find({ _id: { $in: userIds } })
      .select('name email');

    const userMap = users.reduce((acc, user) => {
      acc[user._id.toString()] = user;
      return acc;
    }, {});

    const weeklyLeaderboard = weeklyStats.map((stat, index) => ({
      rank: index + 1,
      userId: stat._id,
      name: userMap[stat._id.toString()]?.name || 'Unknown',
      email: userMap[stat._id.toString()]?.email || '',
      weeklyScore: stat.weeklyScore,
      submissionsCount: stat.submissionsCount
    }));

    res.status(200).json({
      success: true,
      leaderboard: weeklyLeaderboard
    });
  } catch (error) {
    console.error('Get weekly leaderboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching weekly leaderboard',
      error: error.message
    });
  }
});

module.exports = router;

