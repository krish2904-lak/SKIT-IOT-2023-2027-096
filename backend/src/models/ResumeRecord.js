const mongoose = require('mongoose');

const extractedSkillSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    confidence: { type: Number, min: 0, max: 1, default: null },
    level: {
      type: String,
      enum: ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'UNKNOWN'],
      default: 'UNKNOWN',
    },
  },
  { _id: false }
);

const resumeRecordSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    fileName: { type: String, required: true, trim: true, maxlength: 180 },
    contentType: {
      type: String,
      required: true,
      enum: [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
    sizeBytes: { type: Number, required: true, min: 1, max: 5 * 1024 * 1024 },
    status: {
      type: String,
      required: true,
      enum: ['UPLOADED', 'PROCESSING', 'PROCESSED', 'FAILED'],
      default: 'PROCESSED',
    },
    extractedSkills: { type: [extractedSkillSchema], default: [] },
    extractedDomains: { type: [String], default: [] },
    projectsCount: { type: Number, min: 0, default: 0 },
    certificationsCount: { type: Number, min: 0, default: 0 },
    uploadedAt: { type: Date, required: true, default: Date.now },
    processedAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

resumeRecordSchema.index({ profileId: 1, uploadedAt: -1 });

module.exports = mongoose.models.ResumeRecord
  || mongoose.model('ResumeRecord', resumeRecordSchema);
