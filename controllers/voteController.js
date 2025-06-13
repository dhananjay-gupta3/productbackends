const Vote = require('../models/Vote');
const Product = require('../models/Product');

// Toggle upvote/unvote
exports.toggleVote = async (req, res) => {
    const userId = req.user.id; // set by auth middleware
    const { productId } = req.body;

    if (!productId) return res.status(400).json({ error: "Product ID required" });

    try {
        // Try to find existing vote
        const existing = await Vote.findOne({ product: productId, user: userId });

        if (existing) {
            // Unvote
            await existing.deleteOne();
            // Decrement upvote count on Product
            await Product.findByIdAndUpdate(productId, { $inc: { upvotesCount: -1 } });
            // Count after removal
            const count = await Vote.countDocuments({ product: productId });
            return res.json({ upvoted: false, upvotesCount: count });
        } else {
            // Upvote
            await Vote.create({ product: productId, user: userId });
            await Product.findByIdAndUpdate(productId, { $inc: { upvotesCount: 1 } });
            // Count after addition
            const count = await Vote.countDocuments({ product: productId });
            return res.json({ upvoted: true, upvotesCount: count });
        }
    } catch (err) {
        // Duplicate key error means double vote attempt, just return upvoted: true
        if (err.code === 11000) {
            const count = await Vote.countDocuments({ product: productId });
            return res.json({ upvoted: true, upvotesCount: count });
        }
        return res.status(500).json({ error: "Vote toggle failed", details: err.message });
    }
};

// Get upvotes count for a product
exports.getUpvotes = async (req, res) => {
    const { productId } = req.params;
    try {
        const count = await Vote.countDocuments({ product: productId });
        res.json({ upvotesCount: count });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch upvotes" });
    }
};

// Get if current user has upvoted a product
exports.hasUpvoted = async (req, res) => {
    const userId = req.user.id;
    const { productId } = req.params;
    try {
        const existing = await Vote.findOne({ product: productId, user: userId });
        res.json({ upvoted: !!existing });
    } catch (err) {
        res.status(500).json({ error: "Failed to check upvote" });
    }
};