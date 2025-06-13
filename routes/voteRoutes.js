const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth'); // JWT auth middleware
const { toggleVote, getUpvotes, hasUpvoted } = require('../controllers/voteController');

// Toggle upvote/unvote (must be logged in)
router.post('/toggle', protect, toggleVote);

// Get upvotes count for a product
router.get('/count/:productId', getUpvotes);

// Check if current user has upvoted a product
router.get('/has-upvoted/:productId', protect, hasUpvoted);

module.exports = router;