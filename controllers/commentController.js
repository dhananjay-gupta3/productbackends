const Comment = require('../models/Comment');
const Product = require('../models/Product');
const User = require('../models/User'); // <-- Add this line!
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/asyncHandler');

// @desc    Get comments for a product
// @route   GET /api/products/:productId/comments
// @access  Public
exports.getComments = asyncHandler(async (req, res, next) => {
    const comments = await Comment.find({ product: req.params.productId, parentComment: null })
        .populate({
            path: 'replies',
            populate: {
                path: 'user',
                select: 'avatar'
            }
        })
        .sort('-createdAt');
    res.status(200).json({
        success: true,
        count: comments.length,
        data: comments
    });
});

// @desc    Add comment to product
// @route   POST /api/products/:productId/comments
// @access  Private
exports.addComment = asyncHandler(async (req, res, next) => {
    req.body.product = req.params.productId;
    req.body.user = req.user.id;

    // Get username from User model
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorResponse('User not found', 404));

    req.body.username = user.username; // Store username at time of comment

    const product = await Product.findById(req.params.productId);
    if (!product) return next(new ErrorResponse(`No product with id ${req.params.productId}`, 404));
    if (!req.body.content || req.body.content.trim() === '') {
        return next(new ErrorResponse(`Comment content is required`, 400));
    }

    const comment = await Comment.create({
        content: req.body.content.trim(),
        product: req.body.product,
        user: req.body.user,
        username: req.body.username
    });

    // Update comment count in product
    product.commentsCount = await Comment.countDocuments({ product: req.params.productId });
    await product.save();

    res.status(201).json({
        success: true,
        data: comment
    });
});

// @desc    Update comment
// @route   PUT /api/comments/:id
// @access  Private
exports.updateComment = asyncHandler(async (req, res, next) => {
    let comment = await Comment.findById(req.params.id);

    if (!comment) {
        return next(new ErrorResponse(`No comment with id ${req.params.id}`, 404));
    }

    // Check owner
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to update this comment`, 403));
    }

    if (!req.body.content || req.body.content.trim() === '') {
        return next(new ErrorResponse(`Comment content is required`, 400));
    }

    // Optionally update username in case user changed their name (optional)
    const user = await User.findById(req.user.id);
    comment = await Comment.findByIdAndUpdate(req.params.id, {
        content: req.body.content.trim(),
        username: user.username // update username if user changed it (optional)
    }, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: comment
    });
});

// @desc    Delete comment
// @route   DELETE /api/comments/:id
// @access  Private
exports.deleteComment = asyncHandler(async (req, res, next) => {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
        return next(new ErrorResponse(`No comment with id ${req.params.id}`, 404));
    }

    // Check owner
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Not authorized to delete this comment`, 403));
    }

    await comment.deleteOne();

    // Update product comment count
    const product = await Product.findById(comment.product);
    if (product) {
        product.commentsCount = await Comment.countDocuments({ product: product._id });
        await product.save();
    }

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Add reply to comment
// @route   POST /api/comments/:id/replies
// @access  Private
exports.addReply = asyncHandler(async (req, res, next) => {
    const parentComment = await Comment.findById(req.params.id);

    if (!parentComment) {
        return next(new ErrorResponse(`No comment with id ${req.params.id}`, 404));
    }

    // Validate content
    if (!req.body.content || req.body.content.trim() === '') {
        return next(new ErrorResponse(`Reply content is required`, 400));
    }

    // Get username from User model
    const user = await User.findById(req.user.id);
    if (!user) return next(new ErrorResponse('User not found', 404));

    const reply = await Comment.create({
        content: req.body.content.trim(),
        product: parentComment.product,
        user: req.user.id,
        username: user.username,
        parentComment: req.params.id
    });

    // Add reply reference
    parentComment.replies.push(reply._id);
    await parentComment.save();

    // Update product comment count
    const product = await Product.findById(parentComment.product);
    if (product) {
        product.commentsCount = await Comment.countDocuments({ product: product._id });
        await product.save();
    }

    res.status(201).json({
        success: true,
        data: reply
    });
});