const mongoose = require('mongoose');
const User = require('./models/User'); // adjust path if needed

async function createAdmin() {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await User.findOne({ email: 'admin@example.com' });
    if (existing) {
        console.log('Admin user already exists:', existing);
        return;
    }

    const admin = new User({
        username: 'admin',
        email: 'admin@example.com',
        password: 'password123', // PLAIN text!
        isAdmin: true
    });

    await admin.save();
    console.log('Admin user created:', admin);
    await mongoose.disconnect();
}
createAdmin();