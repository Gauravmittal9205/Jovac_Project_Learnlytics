const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const feedbackController = require('../controllers/feedbackController');
const { feedbackValidationRules } = require('../middleware/validators/feedbackValidator');

// @route   POST /api/feedback
// @desc    Submit feedback
// @access  Private
router.post(
  '/',
  [
    authenticate,
    ...feedbackValidationRules
  ],
  feedbackController.submitFeedback
);

// @route   GET /api/feedback
// @desc    Get user's feedback
// @access  Private
router.get(
  '/',
  authenticate,
  feedbackController.getUserFeedback
);

// @route   GET /api/feedback/all
// @desc    Get all feedback (admin only)
// @access  Private/Admin
router.get(
  '/all',
  authenticate,
  feedbackController.getAllFeedback
);

module.exports = router;
