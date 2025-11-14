const mongoose = require("mongoose");

// Validation functions
const validatePhone = (phone) => {
  if (!phone) return true; // Optional field
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length === 10;
};

const validateEmail = (email) => {
  if (!email) return true; // Optional field
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validateGPA = (gpa) => {
  if (!gpa) return true; // Optional field
  const num = parseFloat(gpa);
  return !isNaN(num) && num >= 0 && num <= 10;
};

const validateName = (name) => {
  if (!name) return true; // Optional field
  return /^[a-zA-Z\s.'-]+$/.test(name);
};

const validateStudentId = (id) => {
  if (!id) return true; // Optional field
  return /^[A-Za-z0-9]{5,20}$/.test(id);
};

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    personal: {
      fullName: {
        type: String,
        validate: {
          validator: validateName,
          message: 'Full name can only contain letters, spaces, and common characters'
        }
      },
      dateOfBirth: String,
      gender: {
        type: String,
        enum: ['Male', 'Female', 'Other', '']
      },
      phone: {
        type: String,
        validate: {
          validator: validatePhone,
          message: 'Phone number must be exactly 10 digits'
        }
      },
      address: String,
      bio: String
    },
    academic: {
      program: String,
      year: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', '']
      },
      semester: String,
      studentId: {
        type: String,
        validate: {
          validator: validateStudentId,
          message: 'Student ID must be 5-20 alphanumeric characters'
        }
      },
      gpa: {
        type: String,
        validate: {
          validator: validateGPA,
          message: 'GPA must be between 0 and 10'
        }
      },
      creditsCompleted: {
        type: String,
        validate: {
          validator: (val) => !val || /^\d+$/.test(val),
          message: 'Credits completed must be a number'
        }
      },
      expectedGraduation: String
    },
    contact: {
      email: String,
      alternateEmail: {
        type: String,
        validate: {
          validator: validateEmail,
          message: 'Please enter a valid email address'
        }
      },
      phone: {
        type: String,
        validate: {
          validator: validatePhone,
          message: 'Phone number must be exactly 10 digits'
        }
      },
      emergencyContact: {
        type: String,
        validate: {
          validator: validatePhone,
          message: 'Emergency contact number must be exactly 10 digits'
        }
      },
      emergencyName: {
        type: String,
        validate: {
          validator: validateName,
          message: 'Emergency contact name can only contain letters, spaces, and common characters'
        }
      },
      emergencyRelation: String
    },
    preferences: {
      emailNotifications: { type: Boolean, default: true },
      smsAlerts: { type: Boolean, default: false },
      pushNotifications: { type: Boolean, default: true },
      language: { type: String, default: 'English' },
      timezone: { type: String, default: 'UTC+5:30' }
    },
    picture: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema, "profile");
