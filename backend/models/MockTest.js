const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  questions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question'
  }],
  timeLimit: {
    type: Number,
    required: true
  },
  marks: {
    type: Number,
    default: 0
  }
});

const mockTestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide test title']
  },
  description: {
    type: String,
    default: ''
  },
  company: {
    type: String,
    default: 'General'
  },
  category: {
    type: String,
    enum: ['placement', 'campus', 'competitive', 'company-specific'],
    default: 'placement'
  },
  duration: {
    type: Number,
    required: [true, 'Please specify duration in minutes'],
    default: 60
  },
  sections: [sectionSchema],
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  passingMarks: {
    type: Number,
    default: 0
  },
  passingPercentage: {
    type: Number,
    default: 35
  },
  isActive: {
    type: Boolean,
    default: true
  },
  scheduledDate: {
    type: Date
  },
  isScheduled: {
    type: Boolean,
    default: false
  },
  instructions: [String],
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard', 'mixed'],
    default: 'mixed'
  },
  isPremium: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attempts: {
    type: Number,
    default: 0
  },
  averageScore: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Calculate totals before saving
mockTestSchema.pre('save', function(next) {
  let totalQuestions = 0;
  let totalMarks = 0;
  
  this.sections.forEach(section => {
    totalQuestions += section.questions.length;
    totalMarks += section.marks;
  });
  
  this.totalQuestions = totalQuestions;
  this.totalMarks = totalMarks;
  this.passingMarks = Math.floor(totalMarks * (this.passingPercentage / 100));
  
  next();
});

module.exports = mongoose.model('MockTest', mockTestSchema);

