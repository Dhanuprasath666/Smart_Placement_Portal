const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  studentName: {
    type: String,
    required: true
  },
  company: {
    type: String,
    required: true,
    trim: true
  },
  package: {
    type: Number,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  offerLetterUrl: {
    type: String,
    required: true
  },
  idCardUrl: {
    type: String,
    required: true
  },
  interviewExperience: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  isAnonymous: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Placement', placementSchema);