const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    courseCode: { type: String, required: true, trim: true, maxlength: 40 },
    name: { type: String, required: true, trim: true, maxlength: 160 },
    semester: { type: Number, required: true, min: 1, max: 12, validate: Number.isInteger },
    credits: { type: Number, required: true, min: 0 },
    score: { type: Number, min: 0, max: 100, default: null },
    grade: { type: String, trim: true, maxlength: 10, default: null },
    attendancePercent: { type: Number, min: 0, max: 100, default: null },
  },
  { _id: false }
);

const erpRecordSchema = new mongoose.Schema(
  {
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
    },
    source: { type: String, required: true, trim: true, maxlength: 80 },
    externalStudentId: { type: String, required: true, trim: true, maxlength: 100 },
    branch: { type: String, required: true, trim: true, maxlength: 120 },
    section: { type: String, trim: true, maxlength: 40, default: null },
    semester: { type: Number, required: true, min: 1, max: 12, validate: Number.isInteger },
    academicYear: { type: String, required: true, trim: true, maxlength: 30 },
    cgpa: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator(value) {
          return Number.isFinite(this.cgpaScale) && value <= this.cgpaScale;
        },
        message: 'cgpa must not exceed cgpaScale',
      },
    },
    cgpaScale: { type: Number, required: true, min: 0.01 },
    attendancePercent: { type: Number, min: 0, max: 100, default: null },
    subjects: { type: [subjectSchema], default: [] },
    syncStatus: {
      type: String,
      required: true,
      enum: ['SYNCED', 'FAILED', 'PENDING'],
      default: 'PENDING',
    },
    syncedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

erpRecordSchema.index({ profileId: 1, syncedAt: -1 });
erpRecordSchema.index({ source: 1, externalStudentId: 1 });

module.exports = mongoose.models.ERPRecord
  || mongoose.model('ERPRecord', erpRecordSchema);