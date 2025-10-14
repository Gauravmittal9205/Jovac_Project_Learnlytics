const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/profileController');

// Get profile by userId
router.get('/:userId', profileController.getProfile);

// Update profile
router.put('/:userId', profileController.updateProfile);

// Create profile
router.post('/', profileController.createProfile);

module.exports = router;
