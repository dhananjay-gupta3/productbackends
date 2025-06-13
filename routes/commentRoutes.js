const express = require('express');
const router = express.Router();
const {
    getComments,
    addComment,
    updateComment,
    deleteComment,
    addReply
} = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

// Public routes
router.get('/products/:productId/comments', getComments);

// Protected routes
router.use(protect);
router.post('/products/:productId/comments', addComment);
router.put('/comments/:id', updateComment);
router.delete('/comments/:id', deleteComment);
router.post('/comments/:id/replies', addReply);

module.exports = router;