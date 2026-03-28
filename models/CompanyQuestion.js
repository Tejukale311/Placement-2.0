const mongoose = require('mongoose');

const companyQuestionItemSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true,
    enum: ['mcq', 'coding', 'interview']
  },
  question: {
    type: String,
    required: true
  },
  options: [String],
  answer: mongoose.Schema.Types.Mixed,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  topic: String,
  year: Number
});

const companyQuestionSchema = new mongoose.Schema({
  company: {
    type: String,
    required: [true, 'Please specify company name'],
    unique: true
  },
  logo: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  questions: [companyQuestionItemSchema],
  interviewQuestions: [{
    question: String,
    difficulty: String,
    category: String,
    frequency: Number
  }],
  codingProblems: [{
    title: String,
    difficulty: String,
    topics: [String],
    year: Number
  }],
  placementProcess: [{
    round: String,
    description: String
  }],
  totalQuestions: {
    type: Number,
    default: 0
  },
  totalCoding: {
    type: Number,
    default: 0
  },
  totalInterview: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Static method to update counts
companyQuestionSchema.statics.updateCounts = async function(companyName) {
  const company = await this.findOne({ company: companyName });
  if (company) {
    company.totalQuestions = company.questions.filter(q => q.type === 'mcq').length;
    company.totalCoding = company.codingProblems.length;
    company.totalInterview = company.interviewQuestions.length;
    await company.save();
  }
};

module.exports = mongoose.model('CompanyQuestion', companyQuestionSchema);

