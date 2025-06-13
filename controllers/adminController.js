const Product = require('../models/Product');
const User = require('../models/User');
const Comment = require('../models/Comment');
const Vote = require('../models/Vote');

// --- ANALYTICS ---
exports.getAnalytics = async (req, res) => {
    try {
        const totalProducts = await Product.countDocuments();
        const totalUsers = await User.countDocuments();
        const totalComments = await Comment.countDocuments();

        const trendingProducts = await Product.find({})
            .sort({ upvotesCount: -1 })
            .limit(5)
            .select('name upvotesCount slug');
        const mostCommentedProducts = await Product.find({})
            .sort({ commentsCount: -1 })
            .limit(5)
            .select('name commentsCount slug');
        const latestProducts = await Product.find({})
            .sort({ createdAt: -1 })
            .limit(5)
            .select('name createdAt slug');

        res.json({
            totalProducts,
            totalUsers,
            totalComments,
            trendingProducts,
            mostCommentedProducts,
            latestProducts
        });
    } catch (err) {
        res.status(500).json({ error: 'Analytics fetch failed', details: err.message });
    }
};

// --- USERS ---
exports.getAllUsers = async (req, res) => {
    const users = await User.find();
    res.json(users);
};
exports.getUser = async (req, res) => {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
};
exports.createUser = async (req, res) => {
    const user = await User.create(req.body);
    res.status(201).json(user);
};
exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!user) return res.status(404).json({ error: "User not found" });
    res.json(user);
};
exports.deleteUser = async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};

// --- PRODUCTS ---
// --- PRODUCTS ---
exports.getAllProducts = async (req, res) => {
    const products = await Product.find();
    res.json(products);
};
exports.getProduct = async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
};
exports.createProduct = async (req, res) => {
    try {
        // Accept all fields from frontend, but require all mandatory fields
        const { name, tagline, description, website, category, logo, user } = req.body;
        if (!name) return res.status(400).json({ error: 'Name is required' });
        if (!tagline) return res.status(400).json({ error: 'Tagline is required' });
        if (!description) return res.status(400).json({ error: 'Description is required' });
        if (!website) return res.status(400).json({ error: 'Website is required' });
        if (!category) return res.status(400).json({ error: 'Category is required' });

        // For admin create, require user field. Otherwise, use req.user._id if exists.
        const productUser = user || (req.user && req.user._id);
        if (!productUser) {
            return res.status(400).json({ error: 'User is required' });
        }

        const product = await Product.create({
            name,
            tagline,
            description,
            website,
            category,
            logo,
            user: productUser
        });
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Product creation failed' });
    }
};
exports.updateProduct = async (req, res) => {
    try {
        const { name, tagline, description, website, category, logo } = req.body;
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        // Only update supplied fields
        if (name) product.name = name;
        if (tagline) product.tagline = tagline;
        if (description) product.description = description;
        if (website) product.website = website;
        if (category) product.category = category;
        if (logo !== undefined) product.logo = logo;

        await product.save();
        res.json(product);
    } catch (err) {
        res.status(400).json({ error: err.message || 'Product update failed' });
    }
};
exports.deleteProduct = async (req, res) => {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};

// --- COMMENTS ---
exports.getAllComments = async (req, res) => {
    const comments = await Comment.find();
    res.json(comments);
};
exports.getComment = async (req, res) => {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
};
exports.createComment = async (req, res) => {
    const comment = await Comment.create(req.body);
    res.status(201).json(comment);
};
exports.updateComment = async (req, res) => {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!comment) return res.status(404).json({ error: "Comment not found" });
    res.json(comment);
};
exports.deleteComment = async (req, res) => {
    await Comment.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};

// --- VOTES ---
exports.getAllVotes = async (req, res) => {
    const votes = await Vote.find();
    res.json(votes);
};
exports.getVote = async (req, res) => {
    const vote = await Vote.findById(req.params.id);
    if (!vote) return res.status(404).json({ error: "Vote not found" });
    res.json(vote);
};
exports.createVote = async (req, res) => {
    const vote = await Vote.create(req.body);
    res.status(201).json(vote);
};
exports.deleteVote = async (req, res) => {
    await Vote.findByIdAndDelete(req.params.id);
    res.json({ success: true });
};