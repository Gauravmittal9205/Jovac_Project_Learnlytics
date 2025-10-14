const mongoose = require("mongoose");

const ProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
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
    },
    picture: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Profile", ProfileSchema, "profile");
