const mongoose = require('mongoose');

const companyApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  companyVisit: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CompanyVisit',
    required: true,
  },
  companyName: {
    type: String,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  rollNumber: {
    type: String,
    required: true,
  },
  batch: {
    type: String,
    required: true,
  },
  cgpa: {
    type: Number,
    required: true,
  },
  branch: {
    type: String,
    required: true,
  },
  profilePhoto: {
    type: String,
    default: null,
  },
  linkedin: {
    type: String,
    default: '',
  },
  github: {
    type: String,
    default: '',
  },
  portfolio: {
    type: String,
    default: '',
  },
  skills: {
    type: String,
    default: '',
  },
  bio: {
    type: String,
    default: '',
  },
  status: {
    type: String,
    enum: ['applied'],
    default: 'applied',
  },
}, {
  timestamps: true,
});

companyApplicationSchema.index({ user: 1, companyVisit: 1 }, { unique: true });

module.exports = mongoose.model('CompanyApplication', companyApplicationSchema);
