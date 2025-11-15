const express = require('express');
const router = express.Router();
const AcademicPerformance = require('../../models/AcademicPerformance');
const { authenticate } = require('../../middleware/auth');

// @route   POST /summary/:studentId
// @desc    Save or update academic summary
// @access  Private
router.post('/summary/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    
    // Extract and validate required fields
    const {
      currentGPA,
      predictedGPA,
      attendancePercentage,
      currentGrade,
      riskLevel,
      attendanceDrop,
      passProbability,
      predictionConfidence,
      lastUpdated
    } = req.body;
    
    // Basic validation
    if (currentGPA === undefined || attendancePercentage === undefined) {
      return res.status(400).json({ 
        success: false,
        message: 'Current GPA and attendance percentage are required' 
      });
    }

    // Prepare the summary data
    const summaryData = {
      currentGPA: parseFloat(currentGPA) || 0,
      predictedGPA: parseFloat(predictedGPA) || 0,
      attendancePercentage: parseFloat(attendancePercentage) || 0,
      currentGrade: currentGrade || '',
      riskLevel: riskLevel || 'Low',
      attendanceDrop: parseFloat(attendanceDrop) || 0,
      passProbability: parseFloat(passProbability) || 0,
      predictionConfidence: parseFloat(predictionConfidence) || 0,
      lastUpdated: lastUpdated || new Date().toISOString()
    };

    // Find and update or create the academic performance record
    let performance = await AcademicPerformance.findOneAndUpdate(
      { userId, studentId },
      { 
        $set: { 
          'summary': summaryData,
          userId,
          studentId
        },
        $setOnInsert: {
          weeklyScores: [],
          subjectAverages: [],
          assessmentBreakdown: [],
          weakTopics: []
        }
      },
      { 
        new: true, 
        upsert: true, 
        setDefaultsOnInsert: true 
      }
    );

    res.json({
      success: true,
      message: 'Academic summary saved successfully',
      summary: performance.summary
    });
    
  } catch (err) {
    console.error('Error saving academic summary:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while saving academic summary',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// @route   GET /subject-performance/:studentId
// @desc    Get subject averages simplified list [{subject, score}]
// @access  Private
router.get('/subject-performance/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;

    const performance = await AcademicPerformance.findOne(
      { userId, studentId },
      { subjectAverages: 1, _id: 0 }
    );

    const list = (performance?.subjectAverages || []).map(item => ({
      subject: item.subject,
      score: item.averageScore
    }));

    res.json(list);
  } catch (err) {
    console.error('Error fetching subject performance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /subject-performance/:studentId
// @desc    Append/update subject average with a {subject, score}
// @access  Private
router.post('/subject-performance/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    const { subject, score } = req.body;

    if (!subject || score === undefined) {
      return res.status(400).json({ error: 'subject and score are required' });
    }

    // Upsert subject average: if subject exists, update averageScore; else push new
    let performance = await AcademicPerformance.findOne({ userId, studentId });
    if (!performance) {
      performance = new AcademicPerformance({ userId, studentId, subjectAverages: [] });
    }
    // Ensure array exists on legacy docs
    if (!Array.isArray(performance.subjectAverages)) {
      performance.subjectAverages = [];
    }

    const idx = performance.subjectAverages.findIndex(s => s.subject === subject);
    const numericScore = Number(score);
    if (idx >= 0) {
      performance.subjectAverages[idx].averageScore = numericScore;
      performance.subjectAverages[idx].lastTestScore = numericScore;
      performance.subjectAverages[idx].lastTestDate = new Date();
      performance.subjectAverages[idx].totalTests = (performance.subjectAverages[idx].totalTests || 0) + 1;
    } else {
      performance.subjectAverages.push({
        subject,
        averageScore: numericScore,
        totalTests: 1,
        lastTestScore: numericScore,
        lastTestDate: new Date()
      });
    }

    await performance.save();
    res.json({ success: true, subject, score: numericScore });
  } catch (err) {
    console.error('Error saving subject performance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /summary/:studentId
// @desc    Get academic summary
// @access  Private
router.get('/summary/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    
    const performance = await AcademicPerformance.findOne({ userId, studentId });
    
    if (!performance) {
      return res.status(200).json({}); // Return empty object if not found
    }
    
    res.json(performance.summary || {});
  } catch (err) {
    console.error('Error fetching academic summary:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /weekly
// @desc    Add or update weekly score
// @access  Private
router.post('/weekly', authenticate, async (req, res) => {
  try {
    const { studentId, week, subject, score, maxScore, assessmentType, notes } = req.body;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    
    if (!studentId || !week || !subject || score === undefined || !maxScore) {
      return res.status(400).json({ error: 'Please provide all required fields' });
    }
    
    const update = {
      $push: {
        weeklyScores: {
          week,
          subject,
          score: Number(score),
          maxScore: Number(maxScore),
          assessmentType: assessmentType || 'quiz',
          date: new Date(),
          notes: notes || ''
        }
      }
    };
    
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    
    const performance = await AcademicPerformance.findOneAndUpdate(
      { userId, studentId },
      update,
      options
    );
    
    res.json(performance);
  } catch (err) {
    console.error('Error saving weekly score:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /performance-trend/:studentId
// @desc    Get simplified weekly performance trend [{week, score}]
// @access  Private
router.get('/performance-trend/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;

    const performance = await AcademicPerformance.findOne(
      { userId, studentId },
      { weeklyScores: 1, _id: 0 }
    );

    const trend = (performance?.weeklyScores || []).map(item => ({
      week: item.week,
      score: item.score
    }));

    res.json(trend);
  } catch (err) {
    console.error('Error fetching performance trend:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /performance-trend/:studentId
// @desc    Append a weekly trend entry {week, score}
// @access  Private
router.post('/performance-trend/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    const { week, score } = req.body;

    if (!week || score === undefined) {
      return res.status(400).json({ error: 'week and score are required' });
    }

    const update = {
      $push: {
        weeklyScores: {
          week,
          subject: '-',
          score: Number(score),
          maxScore: 100,
          assessmentType: 'weekly',
          date: new Date(),
          notes: ''
        }
      }
    };

    const options = { new: true, upsert: true, setDefaultsOnInsert: true };

    const performance = await AcademicPerformance.findOneAndUpdate(
      { userId, studentId },
      update,
      options
    );

    res.json({ success: true, entry: { week, score: Number(score) }, count: performance.weeklyScores.length });
  } catch (err) {
    console.error('Error saving performance trend:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /assessment-performance/:studentId
// @desc    Get assessment breakdown mapped to [{ name, score }]
// @access  Private
router.get('/assessment-performance/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;

    const performance = await AcademicPerformance.findOne(
      { userId, studentId },
      { assessmentBreakdown: 1, _id: 0 }
    );

    const list = (performance?.assessmentBreakdown || []).map(item => ({
      name: item.assessmentType,
      score: item.averageScore
    }));

    res.json(list);
  } catch (err) {
    console.error('Error fetching assessment performance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /assessment-performance/:studentId
// @desc    Upsert assessment average; recompute averageScore and count
// @access  Private
router.post('/assessment-performance/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    const { name, score } = req.body;

    if (!name || score === undefined) {
      return res.status(400).json({ error: 'name and score are required' });
    }

    let performance = await AcademicPerformance.findOne({ userId, studentId });
    if (!performance) performance = new AcademicPerformance({ userId, studentId, assessmentBreakdown: [] });
    if (!Array.isArray(performance.assessmentBreakdown)) performance.assessmentBreakdown = [];

    const idx = performance.assessmentBreakdown.findIndex(a => a.assessmentType === name);
    const s = Number(score);
    if (idx >= 0) {
      const prevCount = performance.assessmentBreakdown[idx].count || 0;
      const prevAvg = performance.assessmentBreakdown[idx].averageScore || 0;
      const newCount = prevCount + 1;
      const newAvg = ((prevAvg * prevCount) + s) / newCount;
      performance.assessmentBreakdown[idx].count = newCount;
      performance.assessmentBreakdown[idx].averageScore = Math.round(newAvg * 100) / 100;
    } else {
      performance.assessmentBreakdown.push({ assessmentType: name, count: 1, averageScore: s, weight: 1 });
    }

    await performance.save();
    res.json({ success: true, name, score: s });
  } catch (err) {
    console.error('Error saving assessment performance:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /weak-topics/:studentId
// @desc    Get weak topics list
// @access  Private
router.get('/weak-topics/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;

    const performance = await AcademicPerformance.findOne(
      { userId, studentId },
      { weakTopics: 1, _id: 0 }
    );

    res.json(performance?.weakTopics || []);
  } catch (err) {
    console.error('Error fetching weak topics:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /weak-topics/:studentId
// @desc    Upsert weak topic by subject (merge topics)
// @access  Private
router.post('/weak-topics/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    const { subject, topics = [], averageScore } = req.body;

    if (!subject) return res.status(400).json({ error: 'subject is required' });

    let performance = await AcademicPerformance.findOne({ userId, studentId });
    if (!performance) performance = new AcademicPerformance({ userId, studentId, weakTopics: [] });
    if (!Array.isArray(performance.weakTopics)) performance.weakTopics = [];

    const idx = performance.weakTopics.findIndex(t => t.subject === subject);
    if (idx >= 0) {
      const existing = new Set(performance.weakTopics[idx].topics || []);
      for (const t of topics) existing.add(t);
      performance.weakTopics[idx].topics = Array.from(existing);
      if (averageScore !== undefined && averageScore !== null) performance.weakTopics[idx].averageScore = Number(averageScore);
      performance.weakTopics[idx].lastStudied = new Date();
    } else {
      performance.weakTopics.push({ subject, topics, averageScore: averageScore !== undefined ? Number(averageScore) : undefined, lastStudied: new Date() });
    }

    await performance.save();
    res.json({ success: true, subject, topics, averageScore: averageScore !== undefined ? Number(averageScore) : undefined });
  } catch (err) {
    console.error('Error saving weak topic:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   GET /study-logs/:studentId
// @desc    Get study logs
// @access  Private
router.get('/study-logs/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    const performance = await AcademicPerformance.findOne(
      { userId, studentId },
      { studyLogs: 1, _id: 0 }
    );
    res.json(performance?.studyLogs || []);
  } catch (err) {
    console.error('Error fetching study logs:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// @route   POST /study-logs/:studentId
// @desc    Append a study log {hours, score, source}
// @access  Private
router.post('/study-logs/:studentId', authenticate, async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = (req.user && (req.user.id || req.user.userId || req.user._id)) || null;
    const { hours, score, source } = req.body;

    if (hours === undefined || score === undefined) return res.status(400).json({ error: 'hours and score are required' });

    const log = { hours: Number(hours), score: Number(score), source: source || 'Manual Log', date: new Date() };
    const update = { $push: { studyLogs: log } };
    const options = { new: true, upsert: true, setDefaultsOnInsert: true };
    const performance = await AcademicPerformance.findOneAndUpdate({ userId, studentId }, update, options);

    res.json({ success: true, log, count: (performance.studyLogs || []).length });
  } catch (err) {
    console.error('Error saving study log:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
