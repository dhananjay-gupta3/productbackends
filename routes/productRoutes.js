const express = require('express');
const router = express.Router();
const {
    getProducts,
    getProduct,
    createProduct,
    updateProduct,
    deleteProduct,
    upvoteProduct
} = require('../controllers/productController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public routes
router.get('/', getProducts);
router.get('/:id', getProduct);

// Protected routes


router.post('/',protect, upload.single('logo'), createProduct);
router.put('/:id',protect, upload.single('logo'), updateProduct);

// Delete product
router.delete('/:id',protect, deleteProduct);


module.exports = router;