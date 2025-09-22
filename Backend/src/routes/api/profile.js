const express = require('express');
const router = express.Router();
const { check } = require('express-validator');
const { authenticate: auth } = require('../../middleware/auth');
const profileController = require('../../controllers/profileController');
const upload = require('../../middleware/upload');

// @route   GET api/profile/me
// @desc    Get current user's profile
// @access  Private
router.get('/me', auth, (req, res) => profileController.getProfile(req, res));

// @route   PUT api/profile
// @desc    Update user profile
// @access  Private
router.put(
  '/',
  [
    auth,
    [
      check('name', 'Name is required').not().isEmpty(),
      check('email', 'Please include a valid email').isEmail(),
    ],
  ],
  (req, res) => profileController.updateProfile(req, res)
);

// @route   POST api/profile/picture
// @desc    Upload profile picture
// @access  Private
router.post(
  '/picture',
  auth,
  upload.single('picture'),
  (req, res) => profileController.uploadProfilePicture(req, res)
);

module.exports = router;