const express = require('express');
const router = express.Router();
const { getHackathons } = require('../../controllers/hackathonController');

// @route   GET api/hackathons
// @desc    Get upcoming hackathons
// @access  Public
router.get('/', getHackathons);

module.exports = router;
