const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: [true, 'Name is required'] 
    },
    email: { 
        type: String, 
        required: [true, 'Email is required'], 
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: { 
        type: String, 
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long'],
        select: false
    },
    role: { 
        type: String, 
        enum: ['student', 'instructor', 'admin'],
        default: 'student'
    },
    profile: {
        personal: {
            fullName: String,
            dateOfBirth: String,
            gender: String,
            AdhaarNumber: String,
            Category: String
        },
        contact: {
            email: String,
            phone: String,
            address: String,
            emergencyContact: String
        },
        academic: {
            program: String,
            year: String,
            semester: String,
            expectedGraduation: String,
            gpa: String,
            creditsCompleted: String,
            creditsThisSemester: String,
            academicStanding: String,
            deansList: String,
            honorSociety: String
        },
        communication: {
            emailNotifications: Boolean,
            smsAlerts: Boolean,
            pushNotifications: Boolean,
            primaryMethod: String,
            secondaryMethod: String,
            tertiaryMethod: String
        },
        emergency: {
            primaryContact: {
                name: String,
                relation: String,
                phone: String
            },
            secondaryContact: {
                name: String,
                relation: String,
                phone: String
            },
            medical: {
                bloodType: String,
                allergies: String,
                conditions: String,
                insurance: String
            }
        }
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt password using bcrypt
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        next();
    }
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.comparePassword = async function(enteredPassword) {
    if (!enteredPassword) {
        throw new Error('No password provided for comparison');
    }
    if (!this.password) {
        throw new Error('No stored password to compare with');
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
