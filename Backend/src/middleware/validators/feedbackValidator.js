const { body } = require('express-validator');

exports.feedbackValidationRules = [
  body('rating')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  
  body('feedbackType')
    .isIn(['suggestion', 'bug', 'compliment', 'question'])
    .withMessage('Invalid feedback type'),
    
  body('message')
    .trim()
    .isLength({ min: 3, max: 5000 })
    .withMessage('Message must be between 3 and 5000 characters'),
    
  body('email')
    .optional({ checkFalsy: true })
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
    
  body('satisfaction')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Satisfaction must be between 1 and 5'),
    
  body('difficulty')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Difficulty must be between 1 and 5'),
    
  body('wouldRecommend')
    .optional({ checkFalsy: true })
    .isBoolean()
    .withMessage('Would recommend must be a boolean value'),
    
  body('courseComments')
    .optional()
    .trim()
    .isLength({ max: 2000 })
    .withMessage('Comments cannot exceed 2000 characters')
];
