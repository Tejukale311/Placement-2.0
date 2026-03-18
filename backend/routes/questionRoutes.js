const express = require('express');
const router = express.Router();
const { 
  getQuestions, 
  getQuestion, 
  getRandomQuestions, 
  getCategories,
  submitAnswer,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  bulkAddQuestions
} = require('../controllers/questionController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/categories', getCategories);
router.get('/random', protect, getRandomQuestions);
router.get('/', getQuestions);
router.get('/:id', getQuestion);

// Protected routes
router.post('/:id/submit', protect, submitAnswer);

// Admin routes
router.post('/', protect, isAdmin, addQuestion);
router.post('/bulk', protect, isAdmin, bulkAddQuestions);
router.put('/:id', protect, isAdmin, updateQuestion);
router.delete('/:id', protect, isAdmin, deleteQuestion);

module.exports = router;

