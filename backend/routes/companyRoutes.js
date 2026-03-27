const express = require('express');
const router = express.Router();
const { 
  getCompanies, 
  getCompanyQuestions, 
  addCompanyQuestions, 
  deleteCompany,
  getCompanyById,
  addCompanyQuestion,
  updateCompanyQuestion,
  deleteCompanyQuestion,
  verifyCompanyAnswer
} = require('../controllers/companyController');
const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getCompanies);
router.get('/id/:id', getCompanyById);
router.get('/:name', getCompanyQuestions);

// Admin routes
router.post('/', protect, isAdmin, addCompanyQuestions);
router.delete('/:name', protect, isAdmin, deleteCompany);

// Admin routes for company questions
router.post('/:id/questions', protect, isAdmin, addCompanyQuestion);
router.put('/:id/questions/:questionId', protect, isAdmin, updateCompanyQuestion);
router.delete('/:id/questions/:questionId', protect, isAdmin, deleteCompanyQuestion);

// Public verify answer route (self-study)
router.post('/:name/verify-answer', verifyCompanyAnswer);

module.exports = router;

