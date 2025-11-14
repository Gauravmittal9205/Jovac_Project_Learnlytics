// controllers/profileController.js
const Profile = require('../models/Profile');
const User = require('../models/User');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

// Get profile by userId
exports.getProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        console.log('=== GET PROFILE REQUEST ===');
        console.log('User ID received:', userId);
        console.log('User ID type:', typeof userId);
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }
        
        // Find or create profile
        let profile = await Profile.findOne({ userId: userId });
        
        if (!profile) {
            // If profile doesn't exist, create a new one with default values
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: 'User not found' });
            }
            
            profile = new Profile({
                userId: userId,
                personal: {
                    fullName: user.name || '',
                    dateOfBirth: '',
                    gender: '',
                    phone: '',
                    address: '',
                    bio: ''
                },
                academic: {
                    program: 'Computer Science',
                    year: '3rd Year',
                    semester: 'Fall 2024',
                    studentId: '',
                    gpa: '',
                    creditsCompleted: '',
                    expectedGraduation: ''
                },
                contact: {
                    email: user.email || '',
                    alternateEmail: '',
                    phone: '',
                    emergencyContact: '',
                    emergencyName: '',
                    emergencyRelation: ''
                },
                preferences: {
                    emailNotifications: true,
                    smsAlerts: false,
                    pushNotifications: true,
                    language: 'English',
                    timezone: 'UTC+5:30'
                }
            });
            await profile.save();
        }
        
        const responseData = { 
            message: 'Profile retrieved successfully',
            profile: {
                personal: profile.personal || {},
                academic: profile.academic || {},
                contact: profile.contact || {},
                preferences: profile.preferences || {},
                picture: profile.picture || null
            }
        };
        
        console.log('Sending profile response:', JSON.stringify(responseData, null, 2));
        res.json(responseData);
    } catch (err) {
        console.error('Get profile error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Validation functions
const validatePhone = (phone) => {
  if (!phone) return { valid: true }; // Optional field
  const digitsOnly = phone.replace(/\D/g, '');
  if (digitsOnly.length !== 10) {
    return { valid: false, message: 'Phone number must be exactly 10 digits' };
  }
  return { valid: true };
};

const validateEmail = (email) => {
  if (!email) return { valid: true }; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  return { valid: true };
};

const validateGPA = (gpa) => {
  if (!gpa) return { valid: true }; // Optional field
  const num = parseFloat(gpa);
  if (isNaN(num) || num < 0 || num > 10) {
    return { valid: false, message: 'GPA must be between 0 and 10' };
  }
  return { valid: true };
};

const validateName = (name) => {
  if (!name) return { valid: true }; // Optional field
  if (!/^[a-zA-Z\s.'-]+$/.test(name)) {
    return { valid: false, message: 'Name can only contain letters, spaces, and common characters' };
  }
  return { valid: true };
};

const validateStudentId = (id) => {
  if (!id) return { valid: true }; // Optional field
  if (!/^[A-Za-z0-9]{5,20}$/.test(id)) {
    return { valid: false, message: 'Student ID must be 5-20 alphanumeric characters' };
  }
  return { valid: true };
};

// Update profile by userId
exports.updateProfile = async (req, res) => {
    try {
        const userId = req.params.userId;
        const { profile: profileData } = req.body;

        console.log('=== UPDATE PROFILE REQUEST ===');
        console.log('User ID:', userId);
        console.log('User ID type:', typeof userId);
        console.log('Profile data received:', JSON.stringify(profileData, null, 2));
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Validate profile data
        const validationErrors = [];

        // Validate phone numbers
        if (profileData.personal?.phone) {
          const phoneValidation = validatePhone(profileData.personal.phone);
          if (!phoneValidation.valid) {
            validationErrors.push(phoneValidation.message);
          }
        }

        if (profileData.contact?.phone) {
          const phoneValidation = validatePhone(profileData.contact.phone);
          if (!phoneValidation.valid) {
            validationErrors.push(phoneValidation.message);
          }
        }

        if (profileData.contact?.emergencyContact) {
          const phoneValidation = validatePhone(profileData.contact.emergencyContact);
          if (!phoneValidation.valid) {
            validationErrors.push(phoneValidation.message);
          }
        }

        // Validate email
        if (profileData.contact?.alternateEmail) {
          const emailValidation = validateEmail(profileData.contact.alternateEmail);
          if (!emailValidation.valid) {
            validationErrors.push(emailValidation.message);
          }
        }

        // Validate GPA
        if (profileData.academic?.gpa) {
          const gpaValidation = validateGPA(profileData.academic.gpa);
          if (!gpaValidation.valid) {
            validationErrors.push(gpaValidation.message);
          }
        }

        // Validate Student ID
        if (profileData.academic?.studentId) {
          const studentIdValidation = validateStudentId(profileData.academic.studentId);
          if (!studentIdValidation.valid) {
            validationErrors.push(studentIdValidation.message);
          }
        }

        // Validate names
        if (profileData.personal?.fullName) {
          const nameValidation = validateName(profileData.personal.fullName);
          if (!nameValidation.valid) {
            validationErrors.push(nameValidation.message);
          }
        }

        if (profileData.contact?.emergencyName) {
          const nameValidation = validateName(profileData.contact.emergencyName);
          if (!nameValidation.valid) {
            validationErrors.push(nameValidation.message);
          }
        }

        // Validate credits
        if (profileData.academic?.creditsCompleted) {
          if (!/^\d+$/.test(profileData.academic.creditsCompleted)) {
            validationErrors.push('Credits completed must be a number');
          }
        }

        // If validation errors exist, return them
        if (validationErrors.length > 0) {
          console.error('Validation errors:', validationErrors);
          return res.status(400).json({ 
            message: 'Validation failed', 
            errors: validationErrors 
          });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find existing profile or create new one
        let profile = await Profile.findOne({ userId: userId });

        if (!profile) {
            // Create new profile
            profile = new Profile({
                userId: userId,
                personal: profileData.personal || {},
                academic: profileData.academic || {},
                contact: profileData.contact || {},
                preferences: profileData.preferences || {}
            });
        } else {
            // Update existing profile - deep merge each section
            if (profileData.personal) {
                profile.personal = {
                    ...(profile.personal || {}),
                    ...profileData.personal
                };
            }

            if (profileData.academic) {
                profile.academic = {
                    ...(profile.academic || {}),
                    ...profileData.academic
                };
            }

            if (profileData.contact) {
                profile.contact = {
                    ...(profile.contact || {}),
                    ...profileData.contact
                };
                // Ensure email matches user email
                if (user.email) {
                    profile.contact.email = user.email;
                }
            }

            if (profileData.preferences) {
                profile.preferences = {
                    ...(profile.preferences || {}),
                    ...profileData.preferences
                };
            }
        }

        // Mark nested objects as modified
        profile.markModified('personal');
        profile.markModified('academic');
        profile.markModified('contact');
        profile.markModified('preferences');

        // Save to MongoDB
        const savedProfile = await profile.save();
        
        console.log('Profile saved successfully to MongoDB!');
        console.log('Saved profile:', JSON.stringify(savedProfile, null, 2));

        res.json({
            message: 'Profile updated successfully',
            profile: {
                personal: savedProfile.personal,
                academic: savedProfile.academic,
                contact: savedProfile.contact,
                preferences: savedProfile.preferences
            }
        });
    } catch (err) {
        console.error('=== UPDATE PROFILE ERROR ===');
        console.error('Error:', err);
        console.error('Stack:', err.stack);
        res.status(500).json({ 
            message: 'Server error', 
            error: err.message 
        });
    }
};

// Create profile (optional, can be used for initial setup)
exports.createProfile = async (req, res) => {
    try {
        const { userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ message: 'User ID is required' });
        }

        const existingProfile = await Profile.findOne({ userId: userId });
        if (existingProfile) {
            return res.status(400).json({ message: 'Profile already exists for this user' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const profile = new Profile({
            userId: userId,
            personal: {
                fullName: user.name || '',
                dateOfBirth: '',
                gender: '',
                phone: '',
                address: '',
                bio: ''
            },
            academic: {
                program: 'Computer Science',
                year: '3rd Year',
                semester: 'Fall 2024',
                studentId: '',
                gpa: '',
                creditsCompleted: '',
                expectedGraduation: ''
            },
            contact: {
                email: user.email || '',
                alternateEmail: '',
                phone: '',
                emergencyContact: '',
                emergencyName: '',
                emergencyRelation: ''
            },
            preferences: {
                emailNotifications: true,
                smsAlerts: false,
                pushNotifications: true,
                language: 'English',
                timezone: 'UTC+5:30'
            }
        });
        
        await profile.save();
        res.status(201).json({ message: 'Profile created successfully', profile });
    } catch (err) {
        console.error('Create profile error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Upload profile photo
exports.uploadPhoto = async (req, res) => {
    try {
        const userId = req.params.userId;
        
        console.log('=== UPLOAD PHOTO REQUEST ===');
        console.log('User ID:', userId);
        console.log('Request file:', req.file);
        console.log('Request body:', req.body);
        
        // Validate userId format
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            console.error('Invalid user ID format:', userId);
            return res.status(400).json({ message: 'Invalid user ID format' });
        }

        // Check if file was uploaded
        if (!req.file) {
            console.error('No file in request');
            return res.status(400).json({ message: 'No file uploaded. Please select an image file.' });
        }

        console.log('File received:', {
            filename: req.file.filename,
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find or create profile
        let profile = await Profile.findOne({ userId: userId });
        
        if (!profile) {
            // Create new profile if doesn't exist
            profile = new Profile({
                userId: userId,
                personal: {
                    fullName: user.name || '',
                    dateOfBirth: '',
                    gender: '',
                    phone: '',
                    address: '',
                    bio: ''
                },
                academic: {
                    program: 'Computer Science',
                    year: '3rd Year',
                    semester: 'Fall 2024',
                    studentId: '',
                    gpa: '',
                    creditsCompleted: '',
                    expectedGraduation: ''
                },
                contact: {
                    email: user.email || '',
                    alternateEmail: '',
                    phone: '',
                    emergencyContact: '',
                    emergencyName: '',
                    emergencyRelation: ''
                },
                preferences: {
                    emailNotifications: true,
                    smsAlerts: false,
                    pushNotifications: true,
                    language: 'English',
                    timezone: 'UTC+5:30'
                }
            });
        }

        // Delete old photo if exists
        if (profile.picture) {
            try {
                const oldPhotoPath = path.join(__dirname, '../../public/uploads', profile.picture.split('/').pop());
                if (fs.existsSync(oldPhotoPath)) {
                    fs.unlinkSync(oldPhotoPath);
                    console.log('Old photo deleted:', oldPhotoPath);
                }
            } catch (deleteError) {
                console.error('Error deleting old photo:', deleteError);
                // Continue even if old photo deletion fails
            }
        }

        // Update profile with new photo path
        profile.picture = `/public/uploads/${req.file.filename}`;
        await profile.save();

        console.log('Photo uploaded successfully:', profile.picture);

        res.json({
            message: 'Photo uploaded successfully',
            picture: profile.picture
        });
    } catch (err) {
        console.error('Upload photo error:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};
