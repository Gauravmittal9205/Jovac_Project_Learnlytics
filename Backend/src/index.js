require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

// Import routes
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 5001;

// Configure CORS with credentials support
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

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

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    app.use(express.static(path.join(__dirname, '../frontend/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../frontend', 'build', 'index.html'));
    });
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
