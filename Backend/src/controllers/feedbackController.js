const Feedback = require('../models/Feedback');
const { validationResult } = require('express-validator');

// @desc    Submit feedback
// @route   POST /api/feedback
// @access  Private
exports.submitFeedback = async (req, res) => {
  console.log('Incoming feedback payload:', req.body);
  console.log('Authenticated user:', req.user);

  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Feedback validation errors:', errors.array());
      return res.status(400).json({
        success: false,
        message: errors.array()[0]?.msg || 'Validation failed',
        errors: errors.array()
      });
    }

    const {
      rating,
      feedbackType,
      message,
      email,
      satisfaction,
      difficulty,
      wouldRecommend,
      courseComments,
      screenshot
    } = req.body;

    const newFeedback = new Feedback({
      userId: req.user.id,
      rating,
      feedbackType,
      message,
      email: email || req.user.email,
      satisfaction,
      difficulty,
      wouldRecommend,
      courseComments,
      screenshot
    });

    const feedback = await newFeedback.save();
    console.log('Feedback saved with id:', feedback._id);

    return res.status(201).json({
      success: true,
      message: 'Feedback saved successfully',
      data: feedback
    });
  } catch (err) {
    console.error('Error submitting feedback:', err);
    return res.status(500).json({
      success: false,
      message: 'Server error while saving feedback'
    });
  }
};

// @desc    Get user's feedback
// @route   GET /api/feedback
// @access  Private
exports.getUserFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.find({ userId: req.user.id })
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all feedback (admin only)
// @route   GET /api/feedback/all
// @access  Private/Admin
exports.getAllFeedback = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const feedback = await Feedback.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(feedback);
  } catch (err) {
    console.error('Error fetching all feedback:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
