const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true
  },
  output: {
    type: String,
    required: true
  },
  isHidden: {
    type: Boolean,
    default: false
  }
});

const codingQuestionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide a title']
  },
  description: {
    type: String,
    required: [true, 'Please provide a description']
  },
  problemStatement: {
    type: String,
    required: [true, 'Please provide problem statement']
  },
  inputFormat: {
    type: String,
    default: ''
  },
  outputFormat: {
    type: String,
    default: ''
  },
  constraints: {
    type: String,
    default: ''
  },
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty'],
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  category: {
    type: String,
    enum: ['arrays', 'strings', 'linked-lists', 'trees', 'graphs', 'dynamic-programming', 'sorting', 'searching', 'mathematics', 'bit-manipulation', 'general'],
    default: 'general'
  },
  tags: [String],
  language: {
    type: [String],
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'sql'],
    default: ['javascript', 'python', 'java', 'cpp']
  },
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    c: String,
    sql: String
  },
  solution: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    c: String,
    sql: String
  },
  timeLimit: {
    type: Number,
    default: 2 // seconds
  },
  memoryLimit: {
    type: Number,
    default: 256 // MB
  },
  points: {
    type: Number,
    default: 10
  },
  isCompanySpecific: {
    type: Boolean,
    default: false
  },
  company: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  totalSubmissions: {
    type: Number,
    default: 0
  },
  acceptanceRate: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for efficient querying
codingQuestionSchema.index({ difficulty: 1, category: 1, isCompanySpecific: 1 });

module.exports = mongoose.model('CodingQuestion', codingQuestionSchema);

