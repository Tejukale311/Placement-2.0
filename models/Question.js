const mongoose = require('mongoose');

// All valid aptitude categories and topics
const aptitudeCategories = [
  'quantitative',
  'verbal-ability',
  'logical-reasoning',
  'verbal-reasoning',
  'non-verbal-reasoning',
  'data-interpretation'
];

const questionSchema = new mongoose.Schema({
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: {
      values: ['aptitude', 'programming', 'reasoning', 'verbal', ...aptitudeCategories],
      message: 'Invalid category'
    }
  },
  subcategory: {
    type: String,
    required: [true, 'Please specify subcategory'],
    enum: {
      values: [
        'quantitative',
        'data-interpretation',
        'logical-reasoning',
        'verbal-reasoning',
        'non-verbal-reasoning',
        'verbal-ability',
        'technical-mcq',
        'dsa',
        'interview',
        'aptitude'
      ],
      message: 'Invalid subcategory'
    }
  },
  // Topic field for aptitude questions (e.g., "time-and-work", "percentage", etc.)
  topic: {
    type: String,
    default: null,
    index: true
  },
  question: {
    type: String,
    required: [true, 'Please provide a question']
  },
  options: {
    type: [String],
    required: [true, 'Please provide options'],
    validate: {
      validator: function(v) {
        return v.length >= 2 && v.length <= 6;
      },
      message: 'Please provide 2-6 options'
    }
  },
  questionType: {
    type: String,
    enum: ['single', 'multi'],
    default: 'single',
    required: true
  },
  correctAnswers: {
    type: [Number],
    required: [true, 'Please specify correct answer indices']
  },
  explanation: {
    type: String,
    default: ''
  },
  difficulty: {
    type: String,
    required: [true, 'Please specify difficulty'],
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  marks: {
    type: Number,
    default: 1
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
  }
}, {
  timestamps: true
});

// Compound indexes for efficient querying
questionSchema.index({ category: 1, subcategory: 1, topic: 1, difficulty: 1 });
questionSchema.index({ topic: 1 });
questionSchema.index({ category: 1, topic: 1 });

module.exports = mongoose.model('Question', questionSchema);
