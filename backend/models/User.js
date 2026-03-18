const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const otpGenerator = require('otp-generator');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email']
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    unique: true,
    match: [/^[6-9]\d{9}$/, 'Please provide a valid Indian phone number']
  },
  userType: {
    type: String,
    required: [true, 'Please select user type'],
    enum: ['student', 'graduate', 'it-professional', 'non-it-professional']
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isAdmin: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user'
  },
  status: {
    type: String,
    enum: ['active', 'blocked', 'suspended'],
    default: 'active'
  },
  lastLogin: {
    type: Date,
    default: null
  },
  score: {
    type: Number,
    default: 0
  },
  testsCompleted: {
    type: Number,
    default: 0
  },
  rank: {
    type: Number,
    default: 0
  },
  avatar: {
    type: String,
    default: ''
  },
  bookmarkedQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  bookmarkedCodingQuestions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  }],
  otp: {
    type: String,
    select: false
  },
  otpExpiry: {
    type: Date,
    select: false
  },
  loginOTPVerified: {
    type: Boolean,
    default: false
  },
  resetPasswordOTP: {
    type: String,
    select: false
  },
  resetPasswordExpiry: {
    type: Date,
    select: false
  },
  // Resume fields
  education: [{
    institution: String,
    degree: String,
    field: String,
    startYear: String,
    endYear: String,
    percentage: String
  }],
  skills: [String],
  projects: [{
    title: String,
    description: String,
    technologies: [String],
    link: String
  }],
  experience: [{
    company: String,
    position: String,
    startDate: String,
    endDate: String,
    description: String
  }],
  // Activity tracking
  lastActive: {
    type: Date,
    default: Date.now
  },
  dailyStreak: {
    type: Number,
    default: 0
  },
  totalQuestionsSolved: {
    type: Number,
    default: 0
  },
  totalCodingSolved: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Generate OTP
userSchema.methods.generateOTP = async function() {
  const otp = otpGenerator.generate(6, {
    upperCase: true,
    specialChars: false,
    alphabets: true
  });
  this.otp = otp;
  this.otpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes
  await this.save();
  return otp;
};

// Verify OTP
userSchema.methods.verifyOTP = async function(enteredOTP) {
  if (this.otp && this.otp.toUpperCase() === enteredOTP.toUpperCase() && this.otpExpiry > Date.now()) {
    this.otp = undefined;
    this.otpExpiry = undefined;
    this.isVerified = true;
    await this.save();
    return true;
  }
  return false;
};

// Compare password
userSchema.methods.comparePassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT Token
userSchema.methods.getSignedJwtToken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE
  });
};

// Update score
userSchema.methods.updateScore = async function(points) {
  this.score += points;
  this.totalQuestionsSolved += 1;
  await this.save();
};

// Get leaderboard rank
userSchema.statics.getLeaderboardRank = async function(userId) {
  const users = await this.find({}).sort({ score: -1 });
  const rank = users.findIndex(u => u._id.toString() === userId.toString()) + 1;
  return rank;
};

module.exports = mongoose.model('User', userSchema);

