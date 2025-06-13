const Product = require('../models/Product');
const User = require('../models/User');
const Comment = require('../models/Comment');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// Helper function to handle population
const populateProduct = (query) => {
    return query
        .populate('user', 'name email avatar')
        .populate('upvotes', 'name email avatar')
        .populate({
            path: 'comments',
            populate: {
                path: 'user',
                select: 'name email avatar'
            }
        });
};

// @desc    Get all products
// @route   GET /api/products
// @access  Public
exports.getProducts = asyncHandler(async (req, res, next) => {
    // Basic filtering
    let query = Product.find();

    // Search by name or tagline
    if (req.query.search) {
        query = query.find({
            $or: [
                { name: { $regex: req.query.search, $options: 'i' } },
                { tagline: { $regex: req.query.search, $options: 'i' } }
            ]
        });
    }

    // Filter by category
    if (req.query.category) {
        query = query.where('category').equals(req.query.category);
    }

    // Sorting
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const total = await Product.countDocuments(query);

    query = query.skip(startIndex).limit(limit);

    // Execute query with population
    const products = await populateProduct(query);

    res.status(200).json({
        success: true,
        count: products.length,
        pagination: {
            currentPage: page,
            totalPages: Math.ceil(total / limit)
        },
        data: products
    });
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = asyncHandler(async (req, res, next) => {
    const product = await Product.findById(req.params.id)
        .populate('user', 'username email')
        .populate('comments');

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private
// In your productController.js
exports.createProduct = asyncHandler(async (req, res, next) => {
    console.log('Request User:', req.user); // Debugging

    if (!req.user) {
        return next(new ErrorResponse('User not authenticated', 401));
    }

    // Create product
    const product = await Product.create({
        ...req.body,
        user: req.user._id,
        logo: req.file ? req.file.filename : undefined
    });

    // Populate response
    const populatedProduct = await Product.findById(product._id)
        .populate('user', 'name email');

    res.status(201).json({
        success: true,
        data: populatedProduct
    });
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
const mongoose = require('mongoose');
const slugify = require('slugify'); // Add this at the top
const fs = require('fs');
const path = require('path');

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private
exports.updateProduct = asyncHandler(async (req, res, next) => {
    // Verify user exists
    if (!req.user) {
        return next(new ErrorResponse('User not authenticated', 401));
    }

    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Verify ownership
    if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to update this product`, 403));
    }

    // Handle file upload
    if (req.file) {
        req.body.logo = req.file.filename;
        // Delete old file if exists
        if (product.logo && product.logo !== 'no-photo.jpg') {
            const oldFilePath = path.join(__dirname, '../public/uploads', product.logo);
            if (fs.existsSync(oldFilePath)) {
                fs.unlinkSync(oldFilePath);
            }
        }
    }

    // Update slug if name changed
    if (req.body.name) {
        req.body.slug = slugify(req.body.name, { lower: true });
    }

    product = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate('user', 'name email');

    res.status(200).json({
        success: true,
        data: product
    });
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private
exports.deleteProduct = asyncHandler(async (req, res, next) => {
    // Verify user exists
    if (!req.user) {
        return next(new ErrorResponse('User not authenticated', 401));
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
        return next(new ErrorResponse(`Product not found with id of ${req.params.id}`, 404));
    }

    // Verify ownership
    if (product.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User not authorized to delete this product`, 403));
    }

    // Delete associated logo file
    if (product.logo && product.logo !== 'no-photo.jpg') {
        const filePath = path.join(__dirname, '../public/uploads', product.logo);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    }

    // Delete the product
    await product.deleteOne();

    // Optionally delete associated comments
    await Comment.deleteMany({ product: req.params.id });

    res.status(200).json({
        success: true,
        data: {}
    });
});
