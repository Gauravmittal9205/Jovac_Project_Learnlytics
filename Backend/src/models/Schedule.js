const mongoose = require('mongoose');

const classSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  instructor: { type: String, required: true },
  room: { type: String, required: true },
  startTime: { type: String, required: true }, // Format: "HH:MM"
  endTime: { type: String, required: true },   // Format: "HH:MM"
  day: { 
    type: String, 
    required: true,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
  },
  color: { type: String, default: '#3b82f6' } // Default blue color
});

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subject: { type: String, required: true },
  dueDate: { type: Date, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Not Started', 'In Progress', 'Completed'], default: 'Not Started' },
  notes: String
});

const studySessionSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  completed: { type: Boolean, default: false },
  notes: String
});

const resourceBookingSchema = new mongoose.Schema({
  resourceType: { type: String, required: true, enum: ['Study Room', 'Lab Equipment', 'Meeting'] },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  startTime: { type: String, required: true },
  endTime: { type: String, required: true },
  location: String,
  participants: [String],
  status: { type: String, enum: ['Pending', 'Approved', 'Rejected'], default: 'Pending' }
});

const scheduleAnalyticsSchema = new mongoose.Schema({
  date: { type: Date, default: Date.now },
  studyHours: { type: Number, default: 0 },
  classesAttended: { type: Number, default: 0 },
  assignmentsCompleted: { type: Number, default: 0 },
  productivityScore: { type: Number, min: 0, max: 10, default: 0 }
});

const scheduleSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  classes: [classSchema],
  assignments: [assignmentSchema],
  studySessions: [studySessionSchema],
  resourceBookings: [resourceBookingSchema],
  analytics: [scheduleAnalyticsSchema],
  lastUpdated: { type: Date, default: Date.now }
});

// Indexes for faster querying
scheduleSchema.index({ userId: 1 });
classSchema.index({ day: 1 });
assignmentSchema.index({ dueDate: 1 });
studySessionSchema.index({ date: 1 });
resourceBookingSchema.index({ date: 1 });

const Schedule = mongoose.model('Schedule', scheduleSchema);
module.exports = Schedule;
