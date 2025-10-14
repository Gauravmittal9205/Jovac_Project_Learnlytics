const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'intermediate'
  },
  category: {
    type: String,
    enum: ['algorithms', 'database', 'mathematics', 'programming', 'system-design'],
    required: true
  },
  questions: [{
    question: {
      type: String,
      required: true
    },
    options: [{
      type: String,
      required: true
    }],
    correct: {
      type: Number,
      required: true,
      min: 0,
      max: 3 // Assuming 4 options (0-3)
    },
    explanation: {
      type: String,
      default: ''
    },
    points: {
      type: Number,
      default: 1
    }
  }],
  totalQuestions: {
    type: Number,
    default: function() {
      return this.questions.length;
    }
  },
  timeLimit: {
    type: Number,
    default: 300 // 5 minutes in seconds
  },
  passingScore: {
    type: Number,
    default: 60 // percentage
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  metadata: {
    totalAttempts: {
      type: Number,
      default: 0
    },
    averageScore: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Index for better query performance
quizSchema.index({ topic: 1, isActive: 1 });
quizSchema.index({ category: 1, difficulty: 1 });

module.exports = mongoose.model('Quiz', quizSchema);