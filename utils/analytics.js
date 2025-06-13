const Product = require('../models/Product');
const User = require('../models/User');
const Comment = require('../models/Comment');

exports.getBasicAnalytics = async () => {
    const [
        totalProducts,
        totalUsers,
        totalComments,
        productsByCategory,
        topProducts
    ] = await Promise.all([
        Product.countDocuments(),
        User.countDocuments(),
        Comment.countDocuments(),
        Product.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } }
        ]),
        Product.find().sort('-upvotesCount').limit(5).select('name upvotesCount')
    ]);

    return {
        totalProducts,
        totalUsers,
        totalComments,
        productsByCategory,
        topProducts
    };
};