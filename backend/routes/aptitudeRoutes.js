const express = require('express');
const router = express.Router();
const Question = require('../models/Question');
const { protect, isAdmin } = require('../middleware/auth');
const { 
  getCategories, 
  getTopics, 
  getAllTopics, 
  getTopicInfo, 
  getTopicsForAdmin,
  aptitudeData 
} = require('../data/aptitudeTopics');

// @desc    Get all aptitude categories
// @route   GET /api/aptitude/categories
// @access  Public
router.get('/categories', async (req, res) => {
  try {
    // Get question counts for each category
    const categoryCounts = await Question.aggregate([
      {
        $match: {
          category: { $in: Object.keys(aptitudeData) },
          isActive: true
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } }
        }
      }
    ]);

    const countsMap = {};
    categoryCounts.forEach(c => {
      countsMap[c._id] = c;
    });

    const categories = getCategories().map(cat => ({
      ...cat,
      totalQuestions: countsMap[cat.id]?.count || 0,
      easy: countsMap[cat.id]?.easy || 0,
      medium: countsMap[cat.id]?.medium || 0,
      hard: countsMap[cat.id]?.hard || 0
    }));

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
});

// @desc    Get topics for a category
// @route   GET /api/aptitude/topics
// @access  Public
router.get('/topics', async (req, res) => {
  try {
    const { category } = req.query;

    // If category specified, return topics for that category
    if (category) {
      const topics = getTopics(category);
      if (!topics) {
        return res.status(404).json({
          success: false,
          message: 'Invalid category'
        });
      }

      // Get question counts for each topic
      const topicCounts = await Question.aggregate([
        {
          $match: {
            category,
            topic: { $ne: null, $ne: '' },
            isActive: true
          }
        },
        {
          $group: {
            _id: '$topic',
            count: { $sum: 1 },
            easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
            hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } }
          }
        }
      ]);

      const countsMap = {};
      topicCounts.forEach(t => {
        countsMap[t._id] = t;
      });

      const topicsWithCounts = topics.map(topic => ({
        ...topic,
        totalQuestions: countsMap[topic.id]?.count || 0,
        easy: countsMap[topic.id]?.easy || 0,
        medium: countsMap[topic.id]?.medium || 0,
        hard: countsMap[topic.id]?.hard || 0
      }));

      return res.status(200).json({
        success: true,
        category: {
          id: category,
          name: aptitudeData[category]?.name,
          color: aptitudeData[category]?.color
        },
        topics: topicsWithCounts
      });
    }

    // Return all topics grouped by category
    const allTopics = getAllTopics();
    
    // Get question counts
    const topicCounts = await Question.aggregate([
      {
        $match: {
          category: { $in: Object.keys(aptitudeData) },
          topic: { $ne: null, $ne: '' },
          isActive: true
        }
      },
      {
        $group: {
          _id: { category: '$category', topic: '$topic' },
          count: { $sum: 1 }
        }
      }
    ]);

    const countsMap = {};
    topicCounts.forEach(t => {
      countsMap[`${t._id.category}_${t._id.topic}`] = t.count;
    });

    const topicsWithCounts = allTopics.map(topic => ({
      ...topic,
      totalQuestions: countsMap[`${topic.category}_${topic.id}`] || 0
    }));

    res.status(200).json({
      success: true,
      topics: topicsWithCounts
    });
  } catch (error) {
    console.error('Get topics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
});

// @desc    Get questions by category and/or topic
// @route   GET /api/aptitude/questions
// @access  Public
router.get('/questions', async (req, res) => {
  try {
    const { category, topic, difficulty, limit = 20, page = 1 } = req.query;

    // Validate category
    if (category && !aptitudeData[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    const query = {
      category: { $in: Object.keys(aptitudeData) },
      isActive: true
    };

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by topic
    if (topic) {
      query.topic = topic;
    }

    // Filter by difficulty
    if (difficulty) {
      query.difficulty = difficulty;
    }

    const questions = await Question.find(query)
      .select('-__v')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    // Get topic info
    let topicInfo = null;
    if (category && topic) {
      topicInfo = getTopicInfo(category, topic);
    }

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      category: category ? aptitudeData[category]?.name : null,
      topic: topicInfo,
      questions
    });
  } catch (error) {
    console.error('Get aptitude questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

// @desc    Get topics with question counts
// @route   GET /api/aptitude/topics-with-counts
// @access  Public
router.get('/topics-with-counts', async (req, res) => {
  try {
    const { category } = req.query;

    let categoriesToQuery = Object.keys(aptitudeData);
    if (category && aptitudeData[category]) {
      categoriesToQuery = [category];
    }

    const topicCounts = await Question.aggregate([
      {
        $match: {
          category: { $in: categoriesToQuery },
          topic: { $ne: null, $ne: '' },
          isActive: true
        }
      },
      {
        $group: {
          _id: { category: '$category', topic: '$topic' },
          count: { $sum: 1 },
          easy: { $sum: { $cond: [{ $eq: ['$difficulty', 'easy'] }, 1, 0] } },
          medium: { $sum: { $cond: [{ $eq: ['$difficulty', 'medium'] }, 1, 0] } },
          hard: { $sum: { $cond: [{ $eq: ['$difficulty', 'hard'] }, 1, 0] } }
        }
      }
    ]);

    const countsMap = {};
    topicCounts.forEach(t => {
      countsMap[`${t._id.category}_${t._id.topic}`] = t;
    });

    // Get all topics for requested category or all
    let allTopics = [];
    if (category && aptitudeData[category]) {
      const topics = getTopics(category);
      allTopics = topics.map(t => ({
        ...t,
        category,
        categoryName: aptitudeData[category].name,
        color: aptitudeData[category].color
      }));
    } else {
      allTopics = getAllTopics();
    }

    const topicsWithCounts = allTopics.map(topic => ({
      ...topic,
      totalQuestions: countsMap[`${topic.category}_${topic.id}`]?.count || 0,
      easy: countsMap[`${topic.category}_${topic.id}`]?.easy || 0,
      medium: countsMap[`${topic.category}_${topic.id}`]?.medium || 0,
      hard: countsMap[`${topic.category}_${topic.id}`]?.hard || 0
    }));

    res.status(200).json({
      success: true,
      topics: topicsWithCounts
    });
  } catch (error) {
    console.error('Get topics with counts error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics',
      error: error.message
    });
  }
});

// ==================== ADMIN ROUTES ====================

// @desc    Add aptitude question (Admin)
// @route   POST /api/admin/aptitude/question
// @access  Private (Admin)
router.post('/admin/question', protect, isAdmin, async (req, res) => {
  try {
    const { question, options, questionType, correctAnswers, difficulty, category, topic, explanation } = req.body;

    // Validate category
    if (!category || !aptitudeData[category]) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid category'
      });
    }

    // Validate topic
    const validTopics = getTopics(category);
    const topicExists = validTopics.some(t => t.id === topic);
    if (!topicExists) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid topic for the selected category'
      });
    }

    // Validate questionType and correctAnswers
    if (!['single', 'multi'].includes(questionType)) {
      return res.status(400).json({
        success: false,
        message: 'questionType must be "single" or "multi"'
      });
    }

    const newQuestion = await Question.create({
      question,
      options,
      questionType,
      correctAnswers,
      difficulty: difficulty || 'medium',
      category,
      topic,
      explanation: explanation || '',
      subcategory: category,
      isActive: true
    });

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      question: newQuestion
    });
  } catch (error) {
    console.error('Add aptitude question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating question',
      error: error.message
    });
  }
});

// @desc    Update aptitude question (Admin)
// @route   PUT /api/admin/aptitude/question/:id
// @access  Private (Admin)
router.put('/admin/question/:id', protect, isAdmin, async (req, res) => {
  try {
    const { question, options, questionType, correctAnswers, difficulty, category, topic, explanation } = req.body;

    const existingQuestion = await Question.findById(req.params.id);
    if (!existingQuestion) {
      return res.status(404).json({
        success: false,
        message: 'Question not found'
      });
    }

    // Validate category if provided
    if (category && !aptitudeData[category]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid category'
      });
    }

    // Validate topic if provided
    if (topic && category) {
      const validTopics = getTopics(category);
      const topicExists = validTopics.some(t => t.id === topic);
      if (!topicExists) {
        return res.status(400).json({
          success: false,
          message: 'Invalid topic for the selected category'
        });
      }
    }

    // Update fields
    if (question) existingQuestion.question = question;
    if (options) existingQuestion.options = options;
    if (questionType !== undefined) existingQuestion.questionType = questionType;
    if (correctAnswers !== undefined) existingQuestion.correctAnswers = correctAnswers;
    if (difficulty) existingQuestion.difficulty = difficulty;
    if (category) existingQuestion.category = category;
    if (topic) existingQuestion.topic = topic;
    if (explanation !== undefined) existingQuestion.explanation = explanation;
    if (category) existingQuestion.subcategory = category;

    await existingQuestion.save();

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      question: existingQuestion
    });
  } catch (error) {
    console.error('Update aptitude question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating question',
      error: error.message
    });
  }
});

// @desc    Delete aptitude question (Admin)
// @route   DELETE /api/admin/aptitude/question/:id
// @access  Private (Admin)
router.delete('/admin/question/:id', protect, isAdmin, async (req, res) => {
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
    console.error('Delete aptitude question error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting question',
      error: error.message
    });
  }
});

// @desc    Get aptitude questions for admin
// @route   GET /api/admin/aptitude/questions
// @access  Private (Admin)
router.get('/admin/questions', protect, isAdmin, async (req, res) => {
  try {
    const { category, topic, difficulty, search, page = 1, limit = 20 } = req.query;

    const query = {
      category: { $in: Object.keys(aptitudeData) }
    };

    if (category) query.category = category;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { question: { $regex: search, $options: 'i' } }
      ];
    }

    const questions = await Question.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Question.countDocuments(query);

    // Get category counts
    const categoryCounts = await Question.aggregate([
      { $match: { category: { $in: Object.keys(aptitudeData) } } },
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countsMap = {};
    categoryCounts.forEach(c => {
      countsMap[c._id] = c.count;
    });

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      categoryCounts: countsMap,
      questions
    });
  } catch (error) {
    console.error('Get admin aptitude questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching questions',
      error: error.message
    });
  }
});

module.exports = router;
