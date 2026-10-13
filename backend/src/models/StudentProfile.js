const mongoose = require('mongoose');

const skillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    level: {
      type: String,
      required: true,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'UNKNOWN'],
    },
    source: {
      type: String,
      required: true,
      enum: ['SELF_REPORTED', 'ERP_COURSEWORK', 'RESUME_PARSED'],
    },
    verificationStatus: {
      type: String,
      required: true,
      enum: ['VERIFIED', 'UNVERIFIED', 'PENDING_REVIEW'],
      default: 'UNVERIFIED',
    },
    updatedAt: { type: Date, required: true, default: Date.now },
  },
  { _id: false }
);

const interestSchema = new mongoose.Schema(
  {
    domain: { type: String, required: true, trim: true, maxlength: 100 },
    priority: { type: Number, required: true, min: 1, validate: Number.isInteger },
    source: {
      type: String,
      required: true,
      enum: ['STUDENT_SELECTED', 'INFERRED'],
      default: 'STUDENT_SELECTED',
    },
  },
  { _id: false }
);

const preferencesSchema = new mongoose.Schema(
  {
    preferredCareer: { type: String, trim: true, maxlength: 120, default: null },
    preferredDomains: { type: [String], default: [] },
    weeklyStudyHours: {
      type: Number,
      min: 1,
      default: null,
      validate: {
        validator: (value) => value === null || Number.isInteger(value),
        message: 'weeklyStudyHours must be a positive integer',
      },
    },
    learningPace: {
      type: String,
      enum: ['SELF_PACED', 'BALANCED', 'INTENSIVE'],
      default: null,
    },
  },
  { _id: false }
);

const studentProfileSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, trim: true, unique: true },
    displayName: { type: String, required: true, trim: true, maxlength: 100 },
    college: { type: String, required: true, trim: true, maxlength: 160 },
    erpRecordId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ERPRecord',
      default: null,
    },
    skills: { type: [skillSchema], default: [] },
    interests: {
      type: [interestSchema],
      default: [],
      validate: {
        validator(interests) {
          const priorities = interests.map((interest) => interest.priority);
          const domains = interests.map((interest) => (interest.domain || '').toLowerCase());
          return new Set(priorities).size === priorities.length
            && new Set(domains).size === domains.length;
        },
        message: 'Interest priorities and domains must be unique per profile',
      },
    },
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.models.StudentProfile
  || mongoose.model('StudentProfile', studentProfileSchema);