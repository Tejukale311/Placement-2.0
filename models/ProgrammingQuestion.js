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

const programmingQuestionSchema = new mongoose.Schema({
  // Core Fields
  title: {
    type: String,
    required: [true, 'Please provide a title']
  },

  description: {
    type: String,
    default: ''
  },
  problemStatement: {
    type: String,
    default: ''
  },
  
  // Task Specific Fields
  section: {

    type: String,
    required: [true, 'Please provide a section'],
    enum: ['exercises', 'technical-mcq', 'dsa', 'interview-questions'],
    default: 'exercises'
  },
  topic: {
    type: String,
    required: [true, 'Please provide a topic']
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty'],
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  

  // Problem Details
  problemStatement: {
    type: String,
    default: ''
  },

  inputFormat: {
    type: String,
    default: ''
  },
  outputFormat: {
    type: String,
    default: ''
  },
  exampleInput: {
    type: String,
    default: ''
  },
  exampleOutput: {
    type: String,
    default: ''
  },
  constraints: {
    type: String,
    default: ''
  },
  
  // Code Related
  examples: [{
    input: String,
    output: String,
    explanation: String
  }],
  testCases: [testCaseSchema],
  starterCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    c: String,
    sql: String
  },
  solutionCode: {
    javascript: String,
    python: String,
    java: String,
    cpp: String,
    c: String,
    sql: String
  },
  
  // Languages
  languages: {
    type: [String],
    enum: ['javascript', 'python', 'java', 'cpp', 'c', 'sql'],
    default: ['javascript', 'python']
  },
  
  // Stats
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
  },
  points: {
    type: Number,
    default: 10
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
programmingQuestionSchema.index({ section: 1, topic: 1, difficulty: 1 });
programmingQuestionSchema.index({ isActive: 1 });

module.exports = mongoose.model('ProgrammingQuestion', programmingQuestionSchema);

