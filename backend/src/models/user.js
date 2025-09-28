const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  monthlyBudget: {
    type: Number,
    default: 15000
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);