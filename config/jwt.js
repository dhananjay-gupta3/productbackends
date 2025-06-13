const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtSecret = process.env.JWT_SECRET;
const jwtExpire = process.env.JWT_EXPIRE;

const generateToken = (id) => {
    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpire
    });
};

const verifyToken = (token) => {
    return jwt.verify(token, jwtSecret);
};

module.exports = {
    jwtSecret,
    jwtExpire,
    generateToken,
    verifyToken
};