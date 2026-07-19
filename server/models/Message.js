const mongoose = require('mongoose');

// Chat messages exchanged within an accepted mentor connection
const messageSchema = new mongoose.Schema({
  mentorRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MentorRequest',
    required: true
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Message', messageSchema);
