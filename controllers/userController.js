const User = require('../models/User');
const Product = require('../models/Product');
const ErrorResponse = require('../utils/errorResponse');
const asyncHandler = require('../utils/async');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults);
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Get user profile (submitted and upvoted products)
// @route   GET /api/users/me/profile
// @access  Private
exports.getUserProfile = asyncHandler(async (req, res, next) => {
    const [submittedProducts, upvotedProducts] = await Promise.all([
        Product.find({ user: req.user.id }),
        Product.find({ upvotes: req.user.id })
    ]);

    res.status(200).json({
        success: true,
        data: {
            submittedProducts,
            upvotedProducts
        }
    });
});

// @desc    Create user
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);

    res.status(201).json({
        success: true,
        data: user
    });
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
});

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
        success: true,
        data: {}
    });
});

// @desc    Upload user avatar
// @route   PUT /api/users/me/avatar
// @access  Private
exports.uploadUserAvatar = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.user.id);

    if (!req.file) {
        return next(new ErrorResponse(`Please upload a file`, 400));
    }

    user.avatar = req.file.filename;
    await user.save();

    res.status(200).json({
        success: true,
        data: user.avatar
    });
});
