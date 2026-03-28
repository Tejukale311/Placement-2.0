const express = require('express');
const router = express.Router();
const { 
  getCodingQuestions, 
  getCodingQuestion, 
  getDailyChallenge,
  runCode,
  submitCode,
  addCodingQuestion,
  updateCodingQuestion,
  deleteCodingQuestion
} = require('../controllers/codingController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getCodingQuestions);
router.get('/daily', protect, getDailyChallenge);
router.get('/:id', getCodingQuestion);

// Protected routes
router.post('/run', protect, runCode);
router.post('/submit', protect, submitCode);

// Admin routes
router.post('/', protect, isAdmin, addCodingQuestion);
router.put('/:id', protect, isAdmin, updateCodingQuestion);
router.delete('/:id', protect, isAdmin, deleteCodingQuestion);

module.exports = router;

