const express = require('express');
const router = express.Router();
const { register, login, getCurrentUser } = require('../../controllers/authController');
const { authenticate } = require('../../middleware/auth');

// @route   POST api/auth/register
// @desc    Register a new user
// @access  Public
router.post('https://jovacprojectlearnlytics-production.up.railway.app/api/auth/register', register);

// @route   POST api/auth/login
// @desc    Login user and get token
// @access  Public
router.post('https://jovacprojectlearnlytics-production.up.railway.app/api/auth/login', login);

// @route   GET api/auth/me
// @desc    Get current user data
// @access  Private
router.get('https://jovacprojectlearnlytics-production.up.railway.app/api/auth/me', authenticate, getCurrentUser);

module.exports = router;
