const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

const User = require('./models/User');

const adminUser = {
  name: 'Admin',
  email: 'admin@placement.com',
  phone: '9876543210',
  userType: 'it-professional',
  password: 'admin123',
  isVerified: true,
  isAdmin: true,
  role: 'admin',
  score: 0,
  testsCompleted: 0
};

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    if (existingAdmin) {
      console.log('Admin user already exists');
      console.log('Email:', existingAdmin.email);
      console.log('Is Admin:', existingAdmin.isAdmin);
    } else {
      const admin = await User.create(adminUser);
      console.log('Admin user created successfully!');
      console.log('Email:', admin.email);
      console.log('Password: admin123');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

createAdmin();

