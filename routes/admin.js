const express = require('express');
const router = express.Router();
const admin = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
router.use(protect, adminOnly);

// Analytics
router.get('/analytics', admin.getAnalytics);

// User CRUD
router.get('/users', admin.getAllUsers);
router.get('/users/:id', admin.getUser);
router.post('/users', admin.createUser);
router.put('/users/:id', admin.updateUser);
router.delete('/users/:id', admin.deleteUser);

// Product CRUD
router.get('/products', admin.getAllProducts);
router.get('/products/:id', admin.getProduct);
router.post('/products',upload.single('logo'), admin.createProduct);
router.put('/products/:id', upload.single('logo'), admin.updateProduct);
router.delete('/products/:id', admin.deleteProduct);

// Comment CRUD
router.get('/comments', admin.getAllComments);
router.get('/comments/:id', admin.getComment);
router.post('/comments', admin.createComment);
router.put('/comments/:id', admin.updateComment);
router.delete('/comments/:id', admin.deleteComment);

// Vote CRUD
router.get('/votes', admin.getAllVotes);
router.get('/votes/:id', admin.getVote);
router.post('/votes', admin.createVote);
router.delete('/votes/:id', admin.deleteVote);

module.exports = router;