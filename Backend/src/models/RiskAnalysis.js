// Backend/models/RiskAnalysis.js
const mongoose = require('mongoose');

const riskAnalysisSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  course: { type: String, required: true },
  attendance: { type: Number, required: true },
  assignmentScores: { type: Number, required: true },
  quizScores: { type: Number, required: true },
  classesPerWeek: { type: Number, required: true },
  studyHours: { type: Number, required: true },
  previousRiskScore: { type: Number, required: true },
  riskScore: { type: Number, required: true },
  riskLevel: {
    text: { type: String, required: true },
    color: { type: String, required: true }
  },
  engagementScore: {
    score: { type: Number, required: true },
    level: {
      text: { type: String, required: true },
      color: { type: String, required: true }
    }
  },
  analysisDate: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

module.exports = mongoose.model('RiskAnalysis', riskAnalysisSchema);