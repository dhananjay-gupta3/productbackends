const express = require('express');
const connectDB = require('./config/db');
const { jwtSecret } = require('./config/jwt');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const app = express();

// Serve static files
app.use('/uploads', cors({
  origin: process.env.FRONTEND_URL || 'https://productsfont.vercel.app'
}), express.static(path.join(__dirname, 'public/uploads')));

// Connect to database
connectDB();

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'public/uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Middleware
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/votes', require('./routes/voteRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api', require('./routes/commentRoutes'));

// Health check route for Render or browser test
app.get('/', (req, res) => {
    res.send('API is running 🚀');
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ success: false, message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
