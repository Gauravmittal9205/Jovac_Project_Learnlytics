require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/api/auth');
const profileRoutes = require('./routes/api/profile');
const feedbackRoutes = require('./routes/feedback');
const academicRoutes = require('./routes/api/academicRoutes');
const hackathonRoutes = require('./routes/api/hackathons');


const app = express();
const PORT = process.env.PORT || 5000;
const HOST = "0.0.0.0";

const allowedOrigins = [
  'https://jovac-project-learnlytics-hlml.vercel.app'
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS Not Allowed"), false);
    }
  },
  credentials: true
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));


// Log all incoming requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
  next();
});
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/public', express.static(path.join(__dirname, '../public')));

// Connect to MongoDB
const DB_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/Learnlytics';

mongoose.connect(DB_URI)
.then(() => {
    console.log('MongoDB connected successfully');
}).catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Define routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/hackathons', hackathonRoutes);


// Serve static assets in production
// Serve static assets in production
// if (process.env.NODE_ENV === 'production') {
//     // Set static folder
//     app.use(express.static(path.join(__dirname, '../Frontend/build')));

//     // Fix: wildcard route replaced with regex
//     app.get(/.*/, (req, res) => {
//         res.sendFile(path.join(__dirname, '../Frontend/build/index.html'));
//     });
// }

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(val => val.message);
        return res.status(400).json({
            success: false,
            errors: messages
        });
    }

    // Handle JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }

    // Handle other errors
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

app.get("/", (req, res) => {
  res.send("Backend Running");
});
// Start the server
app.listen(PORT, HOST, () => {
  console.log(`Server running on http://${HOST}:${PORT}`);
});
