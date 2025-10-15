const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');

// Get profile by userId
router.get('/:userId', authController.getProfile);

// Update profile
router.put('/:userId', authController.updateProfile);


module.exports = router;
