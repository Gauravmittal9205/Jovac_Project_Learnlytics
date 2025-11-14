const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/profileController');
const { authenticate } = require('../../middleware/auth');
const upload = require('../../middleware/upload');

// Get profile by userId
router.get('/:userId', authenticate, profileController.getProfile);

// Update profile by userId
router.put('/:userId', authenticate, profileController.updateProfile);

// Upload profile photo
router.post('/:userId/photo', authenticate, (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) {
            console.error('Upload error:', err);
            return res.status(400).json({ message: err.message || 'File upload failed' });
        }
        next();
    });
}, profileController.uploadPhoto);

// Create profile (optional endpoint)
router.post('/', authenticate, profileController.createProfile);

module.exports = router;
