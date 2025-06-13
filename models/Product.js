const mongoose = require('mongoose');
const slugify = require('slugify');

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    slug: String,
    tagline: {
        type: String,
        required: [true, 'Please add a tagline'],
        maxlength: [100, 'Tagline cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    website: {
        type: String,
        required: [true, 'Please add a website URL'],
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    logo: {
        type: String,
        default: 'no-photo.jpg'
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        enum: [
            'AI',
            'SaaS',
            'DevTools',
            'Mobile',
            'Web',
            'Other'
        ]
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    upvotes: {
        type: [mongoose.Schema.ObjectId],
        ref: 'User',
        default: []
    },
    upvotesCount: {
        type: Number,
        default: 0
    },
    comments: [{  // Add this comments array to your schema
        type: mongoose.Schema.ObjectId,
        ref: 'Comment'
    }],
    commentsCount: {
        type: Number,
        default: 0
    },
    analytics: {
        views: { type: Number, default: 0 }
    }
}, { strictPopulate: false });  // Add this option to prevent strict populate errors

// Create product slug from the name
ProductSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true });
    next();
});

module.exports = mongoose.model('Product', ProductSchema);