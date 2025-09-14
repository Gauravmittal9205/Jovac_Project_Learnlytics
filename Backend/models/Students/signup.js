const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Define the schema for signup
const signupSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});
 
// Hash password before saving
signupSchema.pre('save', async function(next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
module.exports = mongoose.model('Signup', signupSchema);