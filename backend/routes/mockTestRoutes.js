const express = require('express');
const router = express.Router();
const {
  getMockTests,
  getMockTest,
  startMockTest,
  submitMockTest,
  createMockTest,
  updateMockTest,
  deleteMockTest,
  getMyTestResults,
  getTestSubmissions,
  getTestResult
} = require('../controllers/mockTestController');

const { protect, isAdmin } = require('../middleware/auth');

// Public routes
router.get('/', getMockTests);
router.get('/:id', protect, getMockTest);

// Protected routes
router.post('/:id/start', protect, startMockTest);
router.post('/:id/submit', protect, submitMockTest);

// Admin routes
router.post('/', protect, isAdmin, createMockTest);

module.exports = router;

