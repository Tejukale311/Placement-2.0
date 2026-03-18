const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  updateProfile, 
  getBookmarks, 
  addBookmark, 
  removeBookmark,
  getSubmissions,
  getStats 
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

// All routes are protected
router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/bookmarks', getBookmarks);
router.post('/bookmarks', addBookmark);
router.delete('/bookmarks', removeBookmark);
router.get('/submissions', getSubmissions);
router.get('/stats', getStats);

module.exports = router;

