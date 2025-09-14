const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
// Define the schema for login
const loginSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

// Method to compare passwords
loginSchema.methods.comparePassword = function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Login', loginSchema);

