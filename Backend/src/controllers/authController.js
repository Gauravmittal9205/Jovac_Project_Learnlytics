const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({
            name,
            email,
            password,
            role: role || 'student'
        });

        // Save user to database
        await user.save();

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Validate input
        if (!email || !password || !role) {
            return res.status(400).json({ message: 'Please provide email, password, and role' });
        }

        // Find user by email with password selected
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Verify user role matches the requested role
        if (user.role !== role) {
            return res.status(403).json({ 
                message: `Access denied. Please log in as ${user.role}` 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, role: user.role },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Get current user
exports.getCurrentUser = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Return user data in the expected format
        res.json({ 
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get user profile by ID
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId).select('-password');
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            name: user.name,
            email: user.email,
            role: user.role,
            profile: user.profile || {}
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { profile } = req.body;

        console.log('=== UPDATE PROFILE REQUEST ===');
        console.log('User ID:', userId);
        console.log('Profile data received:', JSON.stringify(profile, null, 2));

        // Find user first
        const user = await User.findById(userId);
        
        if (!user) {
            console.log('User not found');
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('Current profile before update:', JSON.stringify(user.profile, null, 2));

        // Initialize profile object if it doesn't exist
        if (!user.profile) {
            user.profile = {
                personal: {},
                academic: {},
                contact: {},
                preferences: {}
            };
        }

        // Deep merge each section
        if (profile.personal) {
            user.profile.personal = {
                ...(user.profile.personal || {}),
                ...profile.personal
            };
            console.log('Updated personal:', user.profile.personal);
        }

        if (profile.academic) {
            user.profile.academic = {
                ...(user.profile.academic || {}),
                ...profile.academic
            };
            console.log('Updated academic:', user.profile.academic);
        }

        if (profile.contact) {
            user.profile.contact = {
                ...(user.profile.contact || {}),
                ...profile.contact
            };
            console.log('Updated contact:', user.profile.contact);
        }

        if (profile.preferences) {
            user.profile.preferences = {
                ...(user.profile.preferences || {}),
                ...profile.preferences
            };
            console.log('Updated preferences:', user.profile.preferences);
        }

        // CRITICAL: Mark profile as modified for nested objects
        user.markModified('profile');
        user.markModified('profile.personal');
        user.markModified('profile.academic');
        user.markModified('profile.contact');
        user.markModified('profile.preferences');

        // Save the user
        const savedUser = await user.save();
        
        console.log('Profile saved successfully!');
        console.log('Saved profile:', JSON.stringify(savedUser.profile, null, 2));

        res.json({
            message: 'Profile updated successfully',
            profile: savedUser.profile
        });
    } catch (error) {
        console.error('=== UPDATE PROFILE ERROR ===');
        console.error('Error:', error);
        console.error('Stack:', error.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: error.message 
        });
    }
};
