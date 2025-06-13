const mongoose = require('mongoose');

const VoteSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.ObjectId,
        ref: 'Product',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Prevent duplicate votes
VoteSchema.index({ product: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Vote', VoteSchema);