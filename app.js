const express = require('express');
const connectDB = require('./config/db');
const { jwtSecret } = require('./config/jwt');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs')

// Import routes
const authRoutes = require('./routes/authRoutes');
const admin = require('./routes/admin');
const voteRoutes = require('./routes/voteRoutes');
const productRoutes = require('./routes/productRoutes');
const userRoutes = require('./routes/userRoutes');
const commentRoutes = require('./routes/commentRoutes');
require('dotenv').config();
const app = express();

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// Connect to database
connectDB();

// Middleware
app.use(cors({
    origin: (process.env.FRONTENT_URL), // Your frontend URL
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', admin)
app.use('/api/products', productRoutes);
app.use('/api/votes', voteRoutes);
app.use('/api/users', userRoutes);
app.use('/api', commentRoutes);

const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Error handling
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));