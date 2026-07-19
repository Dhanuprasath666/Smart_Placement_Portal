const mongoose = require('mongoose');

// Connection requests between juniors (students) and verified alumni (mentors)
const mentorRequestSchema = new mongoose.Schema({
  fromStudent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  toMentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestType: {
    type: String,
    enum: ['Resume Review', 'Interview Guidance', 'Career Advice', 'Referral Request'],
    required: true
  },
  message: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('MentorRequest', mentorRequestSchema);
