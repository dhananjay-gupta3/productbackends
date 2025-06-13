const jwt = require('jsonwebtoken');
const ErrorResponse = require('../utils/errorResponse');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    let token;

    // Check for token in headers
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // Check for token in cookies
    // else if (req.cookies.token) {
    //   token = req.cookies.token;
    // }

    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database and attach to request
        req.user = await User.findById(decoded.id);

        if (!req.user) {
            return next(new ErrorResponse('No user found with this id', 404));
        }

        next();
    } catch (err) {
        return next(new ErrorResponse('Not authorized to access this route', 401));
    }
};

exports.adminOnly = (req, res, next) => {
    if (req.user && req.user.isAdmin) return next();
    return res.status(403).json({ error: 'Admins only' });
};