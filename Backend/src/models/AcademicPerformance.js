const mongoose = require("mongoose");

const PerformanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  studentId: {
    type: String,
    required: true
  },
  summary: {
    currentGPA: { type: Number, min: 0 },
    predictedGPA: { type: Number, min: 0 },
    attendancePercentage: { type: Number, min: 0, max: 100 },
    currentGrade: { type: String, trim: true },
    riskLevel: { type: String, enum: ['Low', 'Moderate', 'High', ''], default: 'Low' },
    attendanceDrop: { type: Number, min: 0, max: 100 },
    passProbability: { type: Number, min: 0, max: 100 },
    predictionConfidence: { type: Number, min: 0, max: 100 },
    lastUpdated: { type: Date, default: Date.now }
  },
  weeklyScores: [{
    week: String,
    subject: String,
    score: Number,
    maxScore: Number,
    assessmentType: String,
    date: Date,
    notes: String
  }],
  subjectAverages: [{
    subject: String,
    averageScore: Number,
    totalTests: Number,
    lastTestScore: Number,
    lastTestDate: Date
  }],
  assessmentBreakdown: [{
    assessmentType: String,
    count: Number,
    averageScore: Number,
    weight: Number
  }],
  weakTopics: [{
    topic: String,
    subject: String,
    topics: [String],
    averageScore: Number,
    priority: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    lastStudied: Date,
    improvement: String
  }],
  studyLogs: [{
    hours: Number,
    score: Number,
    source: String,
    date: Date
  }],
  studyPlan: {
    dailyHours: Number,
    weeklyGoals: [String],
    focusAreas: [String],
    resources: [String],
    lastUpdated: Date
  }
}, { timestamps: true });

// Create a compound index for faster lookups
PerformanceSchema.index({ userId: 1, studentId: 1 });

module.exports = mongoose.model("AcademicPerformance", PerformanceSchema, "academic_performances");
