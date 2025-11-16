const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Schedule = require('../models/Schedule');

// Get user's complete schedule
router.get('/', auth, async (req, res) => {
  try {
    let schedule = await Schedule.findOne({ userId: req.user.id });
    
    if (!schedule) {
      // Create a new schedule if none exists
      schedule = new Schedule({ userId: req.user.id });
      await schedule.save();
    }
    
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Update classes
router.post('/classes', auth, async (req, res) => {
  try {
    const { classes } = req.body;
    
    const schedule = await Schedule.findOneAndUpdate(
      { userId: req.user.id },
      { $set: { classes } },
      { new: true, upsert: true }
    );
    
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add/Update assignment
router.post('/assignments', auth, async (req, res) => {
  try {
    const { assignment } = req.body;
    
    let schedule = await Schedule.findOne({ userId: req.user.id });
    
    if (!schedule) {
      schedule = new Schedule({
        userId: req.user.id,
        assignments: [assignment]
      });
    } else {
      const assignmentIndex = schedule.assignments.findIndex(a => a._id.toString() === assignment._id);
      
      if (assignmentIndex >= 0) {
        schedule.assignments[assignmentIndex] = assignment;
      } else {
        schedule.assignments.push(assignment);
      }
    }
    
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Delete assignment
router.delete('/assignments/:id', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ userId: req.user.id });
    
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found' });
    }
    
    schedule.assignments = schedule.assignments.filter(
      assignment => assignment._id.toString() !== req.params.id
    );
    
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Add/Update study session
router.post('/study-sessions', auth, async (req, res) => {
  try {
    const { session } = req.body;
    
    let schedule = await Schedule.findOne({ userId: req.user.id });
    
    if (!schedule) {
      schedule = new Schedule({
        userId: req.user.id,
        studySessions: [session]
      });
    } else {
      const sessionIndex = schedule.studySessions.findIndex(s => s._id.toString() === session._id);
      
      if (sessionIndex >= 0) {
        schedule.studySessions[sessionIndex] = session;
      } else {
        schedule.studySessions.push(session);
      }
    }
    
    await schedule.save();
    res.json(schedule);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Book a resource
router.post('/book-resource', auth, async (req, res) => {
  try {
    const { booking } = req.body;
    
    // Check for conflicts
    const schedule = await Schedule.findOne({
      userId: req.user.id,
      'resourceBookings.date': booking.date,
      $or: [
        {
          'resourceBookings.startTime': { $lt: booking.endTime },
          'resourceBookings.endTime': { $gt: booking.startTime }
        }
      ]
    });
    
    if (schedule) {
      return res.status(400).json({ msg: 'Time slot already booked' });
    }
    
    await Schedule.findOneAndUpdate(
      { userId: req.user.id },
      { $push: { resourceBookings: booking } },
      { new: true, upsert: true }
    );
    
    res.json({ msg: 'Resource booked successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const schedule = await Schedule.findOne({ userId: req.user.id });
    
    if (!schedule) {
      return res.status(404).json({ msg: 'Schedule not found' });
    }
    
    // Calculate some basic analytics
    const analytics = {
      totalClasses: schedule.classes.length,
      upcomingAssignments: schedule.assignments
        .filter(a => new Date(a.dueDate) > new Date())
        .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
        .slice(0, 5),
      studyTimeThisWeek: schedule.studySessions
        .filter(s => {
          const sessionDate = new Date(s.date);
          const oneWeekAgo = new Date();
          oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
          return sessionDate >= oneWeekAgo;
        })
        .reduce((total, session) => {
          const start = new Date(`1970-01-01T${session.startTime}:00`);
          const end = new Date(`1970-01-01T${session.endTime}:00`);
          return total + (end - start) / (1000 * 60 * 60); // Convert to hours
        }, 0),
      upcomingBookings: schedule.resourceBookings
        .filter(b => new Date(b.date) >= new Date())
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .slice(0, 5)
    };
    
    res.json(analytics);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
