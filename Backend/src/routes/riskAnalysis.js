// Backend/routes/riskAnalysis.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const RiskAnalysis = require('../models/RiskAnalysis');

// Save risk analysis
router.post('/', auth, async (req, res) => {
  try {
    const analysisData = {
      ...req.body,
      userId: req.user.id
    };
    const analysis = new RiskAnalysis(analysisData);
    await analysis.save();
    res.status(201).json(analysis);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user's risk analysis history
router.get('/history', auth, async (req, res) => {
  try {
    const analyses = await RiskAnalysis.find({ userId: req.user.id })
      .sort({ analysisDate: -1 });
    res.json(analyses);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;