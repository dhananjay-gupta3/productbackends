const { validationResult } = require('express-validator');
const ErrorResponse = require('./errorResponse');

exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return next(new ErrorResponse(errorMessages.join(', '), 400));
    }
    next();
};

// Common validation rules
exports.productValidationRules = () => {
    return [
        body('name', 'Name is required').not().isEmpty().trim().escape(),
        body('tagline', 'Tagline is required').not().isEmpty().trim().escape(),
        body('description', 'Description is required').not().isEmpty().trim(),
        body('website', 'Please include a valid URL').isURL(),
        body('category', 'Please select a valid category').isIn([
            'AI', 'SaaS', 'DevTools', 'Mobile', 'Web', 'Other'
        ])
    ];
};

exports.userValidationRules = () => {
    return [
        body('name', 'Name is required').not().isEmpty().trim().escape(),
        body('email', 'Please include a valid email').isEmail().normalizeEmail(),
        body('password', 'Password must be 6 or more characters').isLength({ min: 6 })
    ];
};