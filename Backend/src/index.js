const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 5001;

// Middleware
app.use(cors()); // Frontend se requests allow karne ke liye
app.use(express.json()); // Request body ko JSON mein parse karne ke liye

// MongoDB se connect karein.
// Zaroori: Aapko is connection string ko apne MongoDB Atlas ya local database URL se replace karna hoga.
const DB_URI = 'mongodb://127.0.0.1:27017/Learnlytics'; // Local MongoDB ke liye

mongoose.connect(DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('MongoDB se safal roop se connect ho gaye.');
}).catch(err => {
    console.error('MongoDB se connect hone mein error:', err);
});

// User ka Schema banayein
const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor'], required: true },
    // Yeh fields sirf instructor ke liye hain
    expertise: { type: String, required: function() { return this.role === 'instructor'; } },
    experience: { type: Number, required: function() { return this.role === 'instructor'; } },
});

const User = mongoose.model('User', userSchema);

// Registration ka endpoint
app.post('/api/register', async (req, res) => {
    try {
        const { name, email, password, role, expertise, experience } = req.body;

        // Dekhein ki user pehle se to maujood nahi hai
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'Is email se account pehle se hi maujood hai.' });
        }

        // Password ko hash karein suraksha ke liye
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Naya user banayein aur save karein
        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            role,
        });

        // Agar role 'instructor' hai, toh expertise aur experience save karein
        if (role === 'instructor') {
            if (!expertise || !experience) {
                return res.status(400).json({ message: 'Instructor ke liye expertise aur experience zaroori hain.' });
            }
            newUser.expertise = expertise;
            newUser.experience = experience;
        }

        await newUser.save();
        
        // Safal response bhejein
        res.status(201).json({ message: 'User safal roop se register ho gaya hai.' });
    } catch (error) {
        console.error('Registration mein error:', error);
        res.status(500).json({ message: 'Server mein kuch gadbad hai. Kripya phir se prayas karein.' });
    }
});

// Server ko shuru karein
app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} par chal raha hai.`);
});
