const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    rollNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    batch: {
      type: String,
      required: true,
    },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      max: 10,
    },
    branch: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["student", "admin", "superadmin"],
      default: "student",
    },
    verified: {
      type: Boolean,
      default: false,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    isBlocked: {
      type: Boolean,
      default: false,
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
    notifications: [{
      companyVisit: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CompanyVisit",
        required: true,
      },
      companyName: {
        type: String,
        required: true,
      },
      message: {
        type: String,
        required: true,
      },
      isRead: {
        type: Boolean,
        default: false,
      },
      isDismissed: {
        type: Boolean,
        default: false,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
    }],
    // Verified Alumni Referral & Mentorship Network
    isMentor: {
      type: Boolean,
      default: false,
    },
    mentorProfile: {
      company: { type: String, default: '' },
      jobRole: { type: String, default: '' },
      graduationYear: { type: String, default: '' },
      willingToMentor: { type: Boolean, default: false },
      willingToRefer: { type: Boolean, default: false },
      shortBio: { type: String, default: '' },
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("User", userSchema);
