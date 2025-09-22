const User = require('../models/User');
const { validationResult } = require('express-validator');

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { 
            personal, 
            contact, 
            academic,
            name,
            email
        } = req.body;

        // Build profile object
        const profileFields = {};
        if (name) profileFields.name = name;
        if (email) profileFields.email = email;
        if (personal) profileFields.personal = personal;
        if (contact) profileFields.contact = contact;
        if (academic) profileFields.academic = academic;

        // Update user
        let user = await User.findByIdAndUpdate(
            req.user.userId,
            { $set: profileFields },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Profile updated successfully',
            user
        });
    } catch (error) {
        console.error('Update profile error:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                message: 'Validation error', 
                errors: Object.values(error.errors).map(err => err.message) 
            });
        }
        res.status(500).json({ message: 'Error updating profile' });
    }
};

// Upload profile picture
exports.uploadProfilePicture = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Please upload a file' });
        }

        const user = await User.findByIdAndUpdate(
            req.user.userId,
            { 'profile.picture': req.file.path },
            { new: true }
        ).select('-password');

        res.json({
            message: 'Profile picture uploaded successfully',
            picture: user.profile.picture
        });
    } catch (error) {
        console.error('Upload profile picture error:', error);
        res.status(500).json({ message: 'Error uploading profile picture' });
    }
};