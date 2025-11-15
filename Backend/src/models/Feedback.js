const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  rating: {
    type: Number,
    required: false,
    min: 1,
    max: 5
  },
  feedbackType: {
    type: String,
    required: false,
    enum: ['suggestion', 'bug', 'compliment', 'question']
  },
  message: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  satisfaction: {
    type: Number,
    min: 1,
    max: 5
  },
  difficulty: {
    type: Number,
    min: 1,
    max: 5
  },
  wouldRecommend: {
    type: Boolean
  },
  courseComments: {
    type: String,
    trim: true
  },
  screenshot: {
    type: String // URL or base64 string
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', feedbackSchema);
