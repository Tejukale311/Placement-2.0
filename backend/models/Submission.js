const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  },
  codingQuestion: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CodingQuestion'
  },
  mockTest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MockTest'
  },
  type: {
    type: String,
    enum: ['aptitude', 'programming', 'mocktest', 'daily'],
    required: true
  },
  answer: mongoose.Schema.Types.Mixed,
  code: {
    language: String,
    sourceCode: String,
    stdin: String
  },
  isCorrect: {
    type: Boolean,
    default: false
  },
  score: {
    type: Number,
    default: 0
  },
  maxScore: {
    type: Number,
    default: 0
  },
  timeTaken: {
    type: Number, // in seconds
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'wrong_answer', 'time_limit', 'runtime_error', 'compilation_error'],
    default: 'pending'
  },
  testCasesPassed: {
    type: Number,
    default: 0
  },
  totalTestCases: {
    type: Number,
    default: 0
  },
  output: {
    type: String,
    default: ''
  },
  error: {
    type: String,
    default: ''
  },
  executionTime: {
    type: Number,
    default: 0
  },
  memoryUsed: {
    type: Number,
    default: 0
  },
  // For mock test submissions
  sectionAnswers: [{
    sectionName: String,
    answers: mongoose.Schema.Types.Mixed,
    score: Number,
    timeTaken: Number
  }],
  // Daily challenge specific
  isDailyChallenge: {
    type: Boolean,
    default: false
  },
  challengeDate: {
    type: Date
  },
  pointsEarned: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
submissionSchema.index({ user: 1, type: 1 });
submissionSchema.index({ user: 1, createdAt: -1 });
submissionSchema.index({ codingQuestion: 1, status: 1 });

module.exports = mongoose.model('Submission', submissionSchema);

