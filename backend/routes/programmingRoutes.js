const express = require('express');
const router = express.Router();

const { 

  getProgrammingQuestions, 
  getProgrammingQuestion,
  getSections, 
  getTopics,
  runCode, 
  submitCode,
  addProgrammingQuestion,
  updateProgrammingQuestion, 
  deleteProgrammingQuestion,
  toggleProgrammingQuestion

} = require('../controllers/programmingController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getProgrammingQuestions);
router.get('/sections', getSections);
router.get('/topics/:section', getTopics);
router.get('/:id', getProgrammingQuestion);

// Protected routes (user)
router.post('/run', protect, runCode);
router.post('/submit', protect, submitCode);

// Admin routes
router.post('/', protect, isAdmin, addProgrammingQuestion);
router.put('/:id', protect, isAdmin, updateProgrammingQuestion);
router.delete('/:id', protect, isAdmin, deleteProgrammingQuestion);
router.patch('/:id/toggle', protect, isAdmin, toggleProgrammingQuestion);

module.exports = router;

