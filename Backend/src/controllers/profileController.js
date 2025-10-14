// controllers/profileController.js
const Profile = require('../models/Profile');

exports.getProfile = async (req, res) => {
    try {
        const profile = await Profile.findOne({ userId: req.params.userId });
        if (!profile) return res.status(404).json({ message: 'Profile not found' });
        res.json(profile);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        let profile = await Profile.findOne({ userId: req.params.userId });

        if (!profile) {
            profile = new Profile({ userId: req.params.userId, ...req.body });
        } else {
            // Update only provided fields
            Object.keys(req.body).forEach(key => {
                profile[key] = req.body[key];
            });
        }

        await profile.save();
        res.json({ message: 'Profile saved', profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.createProfile = async (req, res) => {
    try {
        const existingProfile = await Profile.findOne({ userId: req.body.userId });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists for this user' });
        }

        const profile = new Profile(req.body);
        await profile.save();
        res.status(201).json({ message: 'Profile created', profile });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};
