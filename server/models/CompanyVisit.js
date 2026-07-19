const mongoose = require('mongoose');

const companyVisitSchema = new mongoose.Schema({
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  location:{
    type: String,
    required: true,
    trim: true
  },
  rolesOffered: [{
    type: String,
    required: true
  }],
  packageRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  eligibilityCriteria: {
    type: String,
    required: true
  },
  jobDescription: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  minCgpa: {
    type: Number,
    required: true,
    min: 0,
    max: 10
  },
  eligibleBranches: [{
    type: String,
    required: true
  }],
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('CompanyVisit', companyVisitSchema);
