const StudentProfile = require('../models/StudentProfile');
const ERPRecord = require('../models/ERPRecord');
const ResumeRecord = require('../models/ResumeRecord');
const { parseResume } = require('../services/resume.service');

function apiError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function plain(document) {
  return document && typeof document.toObject === 'function' ? document.toObject() : document;
}

function iso(value) {
  return value ? new Date(value).toISOString() : null;
}

function publicResume(document) {
  if (!document) return null;
  const resume = plain(document);
  return {
    id: String(resume._id),
    profileId: String(resume.profileId),
    fileName: resume.fileName,
    contentType: resume.contentType,
    sizeBytes: resume.sizeBytes,
    status: resume.status,
    extractedSkills: (resume.extractedSkills || []).map((skill) => ({
      name: skill.name,
      level: skill.level || 'UNKNOWN',
      confidence: Number.isFinite(skill.confidence) ? skill.confidence : null,
    })),
    uploadedAt: iso(resume.uploadedAt),
    processedAt: iso(resume.processedAt),
  };
}

function publicErpRecord(document) {
  if (!document) return null;
  const record = plain(document);
  return {
    id: String(record._id),
    profileId: String(record.profileId),
    source: record.source,
    externalStudentId: record.externalStudentId,
    branch: record.branch,
    section: record.section || null,
    semester: record.semester,
    academicYear: record.academicYear,
    cgpa: record.cgpa,
    cgpaScale: record.cgpaScale,
    attendancePercent: record.attendancePercent ?? null,
    subjects: record.subjects || [],
    syncStatus: record.syncStatus,
    syncedAt: iso(record.syncedAt),
    createdAt: iso(record.createdAt),
  };
}

function publicProfile(document) {
  const profile = plain(document);
  return {
    id: String(profile._id),
    userId: profile.userId,
    displayName: profile.displayName,
    college: profile.college,
    erpRecordId: profile.erpRecordId ? String(profile.erpRecordId) : null,
    resumeId: profile.resumeId ? String(profile.resumeId) : null,
    skills: profile.skills || [],
    interests: profile.interests || [],
    projectsCompleted: profile.projectsCompleted || 0,
    certificationsCount: profile.certificationsCount || 0,
    preferences: profile.preferences || {},
    createdAt: iso(profile.createdAt),
    updatedAt: iso(profile.updatedAt),
  };
}

function validateProfileBody(body) {
  if (
    !body
    || typeof body !== 'object'
    || Array.isArray(body)
    || typeof body.displayName !== 'string'
    || !body.displayName.trim()
    || body.displayName.length > 100
    || typeof body.college !== 'string'
    || !body.college.trim()
    || body.college.length > 160
    || !Array.isArray(body.skills)
    || body.skills.length > 50
    || !Array.isArray(body.interests)
    || body.interests.length > 20
    || !body.preferences
    || typeof body.preferences !== 'object'
    || Array.isArray(body.preferences)
    || (body.projectsCompleted !== undefined
      && (!Number.isInteger(body.projectsCompleted) || body.projectsCompleted < 0 || body.projectsCompleted > 20))
    || (body.certificationsCount !== undefined
      && (!Number.isInteger(body.certificationsCount) || body.certificationsCount < 0 || body.certificationsCount > 10))
  ) {
    throw apiError('Profile body does not match the editable profile schema', 400, 'VALIDATION_ERROR');
  }

  const skills = body.skills.map((skill) => {
    if (!skill || typeof skill.name !== 'string' || !skill.name.trim() || skill.name.length > 100) {
      throw apiError('Each skill must have a valid name', 400, 'VALIDATION_ERROR');
    }
    return {
      name: skill.name.trim(),
      level: skill.level || 'UNKNOWN',
      source: 'SELF_REPORTED',
      verificationStatus: 'UNVERIFIED',
      updatedAt: new Date(),
    };
  });

  const interests = body.interests.map((interest, index) => {
    if (!interest || typeof interest.domain !== 'string' || !interest.domain.trim()) {
      throw apiError('Each interest must have a valid domain', 400, 'VALIDATION_ERROR');
    }
    return {
      domain: interest.domain.trim(),
      priority: interest.priority ?? index + 1,
      source: 'STUDENT_SELECTED',
    };
  });

  const preferences = body.preferences;
  if (
    (preferences.preferredCareer != null
      && (typeof preferences.preferredCareer !== 'string' || preferences.preferredCareer.length > 120))
    || !Array.isArray(preferences.preferredDomains || [])
    || (preferences.preferredDomains || []).some((domain) => typeof domain !== 'string' || domain.length > 100)
    || (preferences.weeklyStudyHours != null
      && (!Number.isInteger(preferences.weeklyStudyHours) || preferences.weeklyStudyHours < 1))
    || (preferences.learningPace != null
      && !['SELF_PACED', 'BALANCED', 'INTENSIVE'].includes(preferences.learningPace))
  ) {
    throw apiError('Profile preferences are invalid', 400, 'VALIDATION_ERROR');
  }

  return {
    displayName: body.displayName.trim(),
    college: body.college.trim(),
    skills,
    interests,
    projectsCompleted: body.projectsCompleted ?? 0,
    certificationsCount: body.certificationsCount ?? 0,
    preferences: {
      preferredCareer: preferences.preferredCareer || null,
      preferredDomains: preferences.preferredDomains || [],
      weeklyStudyHours: preferences.weeklyStudyHours ?? null,
      learningPace: preferences.learningPace || null,
    },
  };
}

async function getProfile(req, res) {
  const profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile) throw apiError('Profile setup is required', 404, 'NOT_FOUND');

  const profileObject = plain(profile);
  const [erpData, resume] = await Promise.all([
    profileObject.erpRecordId
      ? ERPRecord.findOne({ _id: profileObject.erpRecordId, profileId: profileObject._id })
      : null,
    profileObject.resumeId
      ? ResumeRecord.findOne({ _id: profileObject.resumeId, profileId: profileObject._id })
      : null,
  ]);
  res.json({
    success: true,
    data: {
      profile: publicProfile(profile),
      erpData: publicErpRecord(erpData),
      resume: publicResume(resume),
    },
  });
}

async function updateProfile(req, res) {
  const editable = validateProfileBody(req.body);
  const existingProfile = await StudentProfile.findOne({ userId: req.userId }).select('skills');
  const preservedSkills = (existingProfile?.skills || [])
    .filter((skill) => skill.source !== 'SELF_REPORTED');
  const preservedNames = new Set(preservedSkills.map((skill) => skill.name.toLowerCase()));
  editable.skills = [
    ...preservedSkills,
    ...editable.skills.filter((skill) => !preservedNames.has(skill.name.toLowerCase())),
  ];
  const profile = await StudentProfile.findOneAndUpdate(
    { userId: req.userId },
    { $set: editable, $setOnInsert: { userId: req.userId } },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );
  res.json({ success: true, data: { profile: publicProfile(profile) } });
}

function requestErpRefresh(_req, _res, next) {
  const error = apiError('No trusted ERP connector is configured', 503, 'SERVICE_UNAVAILABLE');
  return next(error);
}

async function uploadResume(req, res) {
  if (!req.file) {
    throw apiError('A PDF or DOCX file is required', 400, 'VALIDATION_ERROR');
  }

  const profile = await StudentProfile.findOne({ userId: req.userId });
  if (!profile) throw apiError('Profile setup is required', 404, 'NOT_FOUND');
  const profileData = plain(profile);
  const parsed = await parseResume(req.file);
  const uploadedAt = new Date();
  const safeName = req.file.originalname.replace(/[\r\n]/g, '').slice(0, 180);
  const extractedSkills = (parsed.extracted_skills || []).map((skill) => ({
    name: String(skill.name).trim().slice(0, 100),
    confidence: null,
    level: ['beginner', 'intermediate', 'advanced'].includes(String(skill.level).toLowerCase())
      ? String(skill.level).toUpperCase()
      : 'UNKNOWN',
  })).filter((skill) => skill.name);

  const resume = await ResumeRecord.create({
    profileId: profileData._id,
    fileName: safeName,
    contentType: req.file.mimetype,
    sizeBytes: req.file.size,
    status: 'PROCESSED',
    extractedSkills,
    extractedDomains: (parsed.extracted_domains || []).filter((value) => typeof value === 'string').slice(0, 30),
    projectsCount: parsed.projects_count,
    certificationsCount: parsed.certifications_count,
    uploadedAt,
    processedAt: new Date(),
  });

  try {
    await StudentProfile.updateOne(
      { _id: profileData._id, userId: req.userId },
      { $set: { resumeId: resume._id } }
    );
  } catch (error) {
    await ResumeRecord.deleteOne({ _id: resume._id }).catch((cleanupError) => {
      console.error(`Resume metadata cleanup failed (${cleanupError.name})`);
    });
    throw error;
  }

  res.status(201).json({ success: true, data: { resume: publicResume(resume) } });
}

module.exports = {
  getProfile,
  updateProfile,
  requestErpRefresh,
  uploadResume,
  publicProfile,
  publicErpRecord,
  publicResume,
  validateProfileBody,
};
