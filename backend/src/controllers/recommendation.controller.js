const mongoose = require('mongoose');
const { randomUUID } = require('node:crypto');
const StudentProfile = require('../models/StudentProfile');
const ERPRecord = require('../models/ERPRecord');
const ResumeRecord = require('../models/ResumeRecord');
const Recommendation = require('../models/Recommendation');
const { mapCandidate, requestRecommendations } = require('../services/recommendation.service');

function apiError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function plain(document) {
  return document && typeof document.toObject === 'function' ? document.toObject() : document;
}

function parsePagination(query) {
  const page = query.page === undefined ? 1 : Number(query.page);
  const limit = query.limit === undefined ? 20 : Number(query.limit);
  if (
    !Number.isInteger(page) || page < 1
    || !Number.isInteger(limit) || limit < 1 || limit > 100
  ) {
    throw apiError('page must be positive and limit must be between 1 and 100', 400, 'VALIDATION_ERROR');
  }
  return { page, limit, skip: (page - 1) * limit };
}

function publicRecommendation(document) {
  const recommendation = plain(document);
  return {
    id: String(recommendation._id),
    profileId: String(recommendation.profileId),
    runId: recommendation.runId,
    generatedAt: new Date(recommendation.generatedAt).toISOString(),
    generationMode: recommendation.generationMode,
    model: recommendation.model,
    modelScore: recommendation.modelScore,
    stack: recommendation.stack,
    difficulty: recommendation.difficulty || null,
    estimatedTimeToLearn: recommendation.estimatedTimeToLearn || null,
    targetRoles: recommendation.targetRoles || [],
    confidence: recommendation.confidence,
    ranking: recommendation.ranking,
    reasons: recommendation.reasons || [],
    skillGaps: recommendation.skillGaps || [],
    explanationRef: recommendation.explanationRef || null,
    roadmapRef: recommendation.roadmapRef || null,
    roadmap: recommendation.roadmap || null,
  };
}

function validateOptions(body, preferences) {
  if (body && (typeof body !== 'object' || Array.isArray(body))) {
    throw apiError('Request body must be an object', 400, 'VALIDATION_ERROR');
  }
  const options = body?.options ?? {};
  if (!options || typeof options !== 'object' || Array.isArray(options)) {
    throw apiError('options must be an object', 400, 'VALIDATION_ERROR');
  }
  if (
    options.requestedCount !== undefined
    && (!Number.isInteger(options.requestedCount) || options.requestedCount < 1 || options.requestedCount > 5)
  ) {
    throw apiError('requestedCount must be an integer from 1 to 5', 400, 'VALIDATION_ERROR');
  }
  if (
    options.weeklyStudyHours !== undefined
    && (!Number.isInteger(options.weeklyStudyHours) || options.weeklyStudyHours < 1 || options.weeklyStudyHours > 168)
  ) {
    throw apiError('weeklyStudyHours must be an integer from 1 to 168', 400, 'VALIDATION_ERROR');
  }
  if (
    options.preferredDomains !== undefined
    && (!Array.isArray(options.preferredDomains)
      || options.preferredDomains.length > 20
      || options.preferredDomains.some((domain) => typeof domain !== 'string' || domain.length > 100))
  ) {
    throw apiError('preferredDomains must be an array of at most 20 strings', 400, 'VALIDATION_ERROR');
  }
  if (
    options.preferredCareer !== undefined
    && (typeof options.preferredCareer !== 'string' || options.preferredCareer.length > 120)
  ) {
    throw apiError('preferredCareer must be a string of at most 120 characters', 400, 'VALIDATION_ERROR');
  }
  if (
    options.learningPace !== undefined
    && !['SELF_PACED', 'BALANCED', 'INTENSIVE'].includes(options.learningPace)
  ) {
    throw apiError('learningPace is invalid', 400, 'VALIDATION_ERROR');
  }
  return {
    preferredCareer: options.preferredCareer ?? preferences.preferredCareer ?? null,
    preferredDomains: options.preferredDomains ?? preferences.preferredDomains ?? [],
    weeklyStudyHours: options.weeklyStudyHours ?? preferences.weeklyStudyHours ?? null,
    learningPace: options.learningPace ?? preferences.learningPace ?? null,
    requestedCount: options.requestedCount ?? 3,
  };
}

async function generateRecommendations(req, res) {
  const profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile) throw apiError('Profile setup is required', 404, 'NOT_FOUND');
  const profileData = plain(profile);
  const options = validateOptions(req.body, profileData.preferences || {});
  const erpRecord = profileData.erpRecordId
    ? await ERPRecord.findOne({ _id: profileData.erpRecordId, profileId: profileData._id })
    : null;
  if (!erpRecord) {
    throw apiError('A trusted ERP snapshot is required for recommendations', 422, 'VALIDATION_ERROR');
  }
  const resume = profileData.resumeId
    ? await ResumeRecord.findOne({ _id: profileData.resumeId, profileId: profileData._id })
    : null;
  const modelResult = await requestRecommendations(profileData, plain(erpRecord), plain(resume), options);

  const runId = randomUUID();
  const generatedAt = new Date();
  const context = {
    profileId: String(profileData._id),
    generatedAt: generatedAt.toISOString(),
    modelVersion: modelResult.modelVersion,
    newId: () => new mongoose.Types.ObjectId().toString(),
  };
  const items = modelResult.candidates.slice(0, options.requestedCount).map((candidate, index, list) =>
    mapCandidate(candidate, index, list.length, { ...context, runId })
  );
  const records = items.map((item) => ({
    ...item,
    _id: item.id,
    userId: req.userId,
    profileId: profileData._id,
    semesterSnapshot: erpRecord.semester,
  }));
  const saved = await Recommendation.insertMany(records);

  res.status(201).json({
    success: true,
    data: {
      runId,
      generatedAt: generatedAt.toISOString(),
      items: saved.map(publicRecommendation),
    },
  });
}

async function listRecommendations(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const filter = { userId: req.userId };
  if (req.query.category !== undefined) {
    if (typeof req.query.category !== 'string' || req.query.category.length > 80) {
      throw apiError('category must be a string of at most 80 characters', 400, 'VALIDATION_ERROR');
    }
    filter['stack.category'] = req.query.category;
  }
  const [records, total] = await Promise.all([
    Recommendation.find(filter).sort({ generatedAt: -1, _id: -1 }).skip(skip).limit(limit),
    Recommendation.countDocuments(filter),
  ]);
  res.json({
    success: true,
    data: { items: records.map(publicRecommendation) },
    meta: { pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
}

async function findOwnedRecommendation(req) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    throw apiError('Recommendation not found', 404, 'NOT_FOUND');
  }
  const recommendation = await Recommendation.findOne({ _id: req.params.id, userId: req.userId });
  if (!recommendation) throw apiError('Recommendation not found', 404, 'NOT_FOUND');
  return plain(recommendation);
}

async function getRecommendation(req, res) {
  const recommendation = await findOwnedRecommendation(req);
  res.json({ success: true, data: { recommendation: publicRecommendation(recommendation) } });
}

async function getExplanation(req, res) {
  const recommendation = await findOwnedRecommendation(req);
  if (!recommendation.explanation) {
    throw apiError('Explanation is unavailable', 503, 'SERVICE_UNAVAILABLE');
  }
  res.json({ success: true, data: { explanation: recommendation.explanation } });
}

async function getRoadmap(req, res) {
  const recommendation = await findOwnedRecommendation(req);
  if (!recommendation.roadmap) {
    throw apiError('Roadmap is unavailable', 503, 'SERVICE_UNAVAILABLE');
  }
  res.json({ success: true, data: { roadmap: recommendation.roadmap } });
}

async function getHistory(req, res) {
  const { page, limit, skip } = parsePagination(req.query);
  const [result = { items: [], total: [] }] = await Recommendation.aggregate([
    { $match: { userId: req.userId } },
    { $sort: { generatedAt: -1, 'ranking.position': 1, _id: 1 } },
    {
      $group: {
        _id: '$runId',
        recommendation: { $first: '$$ROOT' },
      },
    },
    { $sort: { 'recommendation.generatedAt': -1, 'recommendation._id': -1 } },
    {
      $facet: {
        items: [{ $skip: skip }, { $limit: limit }],
        total: [{ $count: 'count' }],
      },
    },
  ]);
  const total = result.total[0]?.count || 0;
  const items = result.items.map(({ recommendation }) => ({
    id: String(recommendation._id),
    recommendationId: String(recommendation._id),
    runId: recommendation.runId,
    generatedAt: new Date(recommendation.generatedAt).toISOString(),
    semesterSnapshot: recommendation.semesterSnapshot ?? null,
    stackTitle: recommendation.stack.title,
    rankingPosition: recommendation.ranking.position,
    confidence: recommendation.confidence?.value ?? null,
    modelScore: recommendation.modelScore?.value ?? null,
    generationMode: recommendation.generationMode,
    technologies: (recommendation.stack.technologies || []).map((technology) => technology.name),
    targetRole: recommendation.targetRoles?.[0] || null,
    keyFactor: recommendation.reasons?.[0]?.text || null,
  }));
  res.json({
    success: true,
    data: { items },
    meta: { pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } },
  });
}

module.exports = {
  generateRecommendations,
  listRecommendations,
  getRecommendation,
  getExplanation,
  getRoadmap,
  getHistory,
  publicRecommendation,
  parsePagination,
  validateOptions,
};
