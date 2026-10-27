const mongoose = require('mongoose');

const recommendationSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true, index: true },
    profileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudentProfile',
      required: true,
      index: true,
    },
    runId: { type: String, required: true, index: true },
    generatedAt: { type: Date, required: true, default: Date.now },
    semesterSnapshot: { type: Number, min: 1, max: 12, default: null },
    generationMode: { type: String, required: true, enum: ['ML'] },
    model: {
      name: { type: String, required: true },
      version: { type: String, required: true },
      calibrationStatus: { type: String, required: true },
    },
    modelScore: {
      value: { type: Number, required: true, min: 0, max: 100 },
      scale: { type: String, required: true, enum: ['0_TO_100'] },
      calibrationStatus: { type: String, required: true, enum: ['UNCALIBRATED'] },
    },
    stack: {
      title: { type: String, required: true },
      category: { type: String, required: true },
      technologies: {
        type: [{ name: { type: String, required: true }, category: { type: String, required: true } }],
        default: [],
      },
    },
    difficulty: { type: String, default: null },
    estimatedTimeToLearn: { type: String, default: null },
    targetRoles: { type: [String], default: [] },
    confidence: {
      value: { type: Number, default: null },
      status: { type: String, required: true, enum: ['NOT_AVAILABLE', 'UNCALIBRATED'] },
      scale: { type: String, required: true, enum: ['0_TO_1'] },
    },
    ranking: {
      position: { type: Number, required: true, min: 1 },
      total: { type: Number, required: true, min: 1 },
    },
    reasons: {
      type: [{ text: { type: String, required: true }, source: { type: String, required: true, enum: ['ML'] } }],
      default: [],
    },
    skillGaps: { type: [mongoose.Schema.Types.Mixed], default: [] },
    explanationRef: { type: String, default: null },
    roadmapRef: { type: String, default: null },
    explanation: { type: mongoose.Schema.Types.Mixed, default: null },
    roadmap: { type: mongoose.Schema.Types.Mixed, default: null },
  },
  { versionKey: false }
);

recommendationSchema.index({ userId: 1, generatedAt: -1, _id: -1 });
recommendationSchema.index({ userId: 1, runId: 1 });

module.exports = mongoose.models.Recommendation
  || mongoose.model('Recommendation', recommendationSchema);
