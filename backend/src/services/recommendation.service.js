const env = require('../config/env');

const academicCourseMatchers = {
  web_technologies: /\b(web|frontend|front end|html|css|javascript)\b/i,
  dbms: /\b(database|dbms|sql)\b/i,
  dsa: /\b(data structures?|algorithms?|dsa)\b/i,
  iot_embedded: /\b(iot|embedded|microcontroller|sensor)\b/i,
  ml_math: /\b(machine learning|artificial intelligence|ai|math|statistics)\b/i,
  cloud_computing: /\b(cloud|aws|azure|gcp)\b/i,
  operating_systems: /\b(operating systems?|os)\b/i,
};

function createError(message, statusCode, code) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  return error;
}

function buildModelRequest(profile, erpRecord, resume, options) {
  const scores = {};
  for (const [field, matcher] of Object.entries(academicCourseMatchers)) {
    const values = erpRecord.subjects
      .filter((subject) => Number.isFinite(subject.score)
        && matcher.test(`${subject.courseCode} ${subject.name}`))
      .map((subject) => subject.score);
    if (values.length > 0) {
      scores[field] = values.reduce((sum, score) => sum + score, 0) / values.length;
    }
  }

  const preferences = profile.preferences || {};
  const skills = [
    ...(profile.skills || []),
    ...((resume && resume.extractedSkills) || []).map((skill) => ({
      name: skill.name,
      level: skill.level,
      source: 'RESUME_PARSED',
    })),
  ];

  return {
    student_id: 'anonymous',
    branch: erpRecord.branch,
    semester: erpRecord.semester,
    cgpa: (erpRecord.cgpa / erpRecord.cgpaScale) * 10,
    academic_scores: scores,
    skills: skills.map((skill) => ({
      name: skill.name,
      level: String(skill.level || 'UNKNOWN').toLowerCase(),
      source: skill.source,
    })),
    interests: (options.preferredDomains || preferences.preferredDomains || [])
      .filter((domain) => typeof domain === 'string'),
    projects_completed: Math.min(20, Math.max(profile.projectsCompleted || 0, resume ? resume.projectsCount : 0)),
    certifications_count: Math.min(10, Math.max(profile.certificationsCount || 0, resume ? resume.certificationsCount : 0)),
    top_k: options.requestedCount || 3,
    resume_uploaded: Boolean(resume),
  };
}

function durationFromLabel(label) {
  const match = /^\s*(\d+)\s+(day|week|month)s?\b/i.exec(label || '');
  if (!match) return null;
  const unit = match[2].toLowerCase();
  return {
    value: Number(match[1]),
    unit: unit === 'day' ? 'DAYS' : unit === 'month' ? 'MONTHS' : 'WEEKS',
  };
}

function mapRoadmap(candidate, recommendationId, now, newId) {
  const steps = Array.isArray(candidate.roadmap) ? candidate.roadmap : [];
  const explanation = candidate.explanation || {};
  return {
    id: newId(),
    recommendationId,
    status: steps.length > 0 ? 'AVAILABLE' : 'UNAVAILABLE',
    recommendedStack: {
      title: candidate.title,
      technologies: (candidate.technologies || []).map((technology) => technology.name),
    },
    prerequisites: Array.isArray(explanation.learning_prerequisites)
      ? explanation.learning_prerequisites.filter((item) => typeof item === 'string').slice(0, 30)
      : [],
    phases: steps.map((step, index) => {
      const duration = durationFromLabel(step.duration);
      const resource = step.recommendedResource;
      let resourceUrl = null;
      if (/^https?:\/\//i.test(resource || '')) {
        try {
          const parsed = new URL(resource);
          const allowedHosts = new Set([
            'developer.mozilla.org',
            'docs.python.org',
            'react.dev',
            'nodejs.org',
            'kubernetes.io',
            'docs.aws.amazon.com',
            'cloud.google.com',
          ]);
          if (parsed.protocol === 'https:' && allowedHosts.has(parsed.hostname)) {
            resourceUrl = parsed.toString();
          }
        } catch (_error) {
          resourceUrl = null;
        }
      }
      return {
        order: index + 1,
        title: step.title,
        estimatedDuration: duration,
        topics: step.topics || [],
        projects: [],
        resources: resourceUrl
          ? [{ title: resource, url: resourceUrl }]
          : [],
        milestones: [],
      };
    }),
    estimatedDuration: null,
    source: 'ML',
    createdAt: now,
  };
}

function mapExplanation(candidate, recommendationId, now, newId) {
  const explanation = candidate.explanation;
  if (!explanation) return null;
  const factors = (explanation.top_features || []).map((feature) => ({
    name: feature.label || feature.feature,
    direction: feature.shap_value >= 0 ? 'POSITIVE' : 'NEGATIVE',
    description: feature.explanation_note || feature.direction || '',
    source: 'ML',
    contribution: {
      method: 'SHAP',
      value: feature.shap_value,
      outputScale: 'probability',
    },
  }));
  return {
    id: newId(),
    recommendationId,
    status: 'AVAILABLE',
    summary: explanation.summary || null,
    source: 'ML',
    importantFactors: factors,
    learningPrerequisites: Array.isArray(explanation.learning_prerequisites)
      ? explanation.learning_prerequisites.filter((item) => typeof item === 'string').slice(0, 30)
      : [],
    createdAt: now,
  };
}

function mapCandidate(candidate, index, total, context) {
  if (
    !candidate
    || typeof candidate.title !== 'string'
    || typeof candidate.category !== 'string'
    || !Number.isFinite(candidate.matchScore)
    || candidate.matchScore < 0
    || candidate.matchScore > 100
    || !Array.isArray(candidate.technologies)
    || candidate.technologies.some((technology) =>
      !technology || typeof technology.name !== 'string' || typeof technology.category !== 'string')
  ) {
    throw createError('Recommendation service returned an invalid response', 502, 'UPSTREAM_SERVICE_ERROR');
  }

  const now = context.generatedAt;
  const id = context.newId();
  const publicRecommendation = {
    id,
    profileId: context.profileId,
    runId: context.runId,
    generatedAt: now,
    generationMode: 'ML',
    model: {
      name: 'F-096 tech-stack classifier',
      version: String(context.modelVersion || 'unknown'),
      calibrationStatus: 'UNCALIBRATED',
    },
    modelScore: {
      value: candidate.matchScore,
      scale: '0_TO_100',
      calibrationStatus: 'UNCALIBRATED',
    },
    stack: {
      title: candidate.title,
      category: candidate.category,
      technologies: candidate.technologies.map((technology) => ({
        name: technology.name,
        category: technology.category || 'General',
      })),
    },
    difficulty: typeof candidate.difficulty === 'string' ? candidate.difficulty : null,
    estimatedTimeToLearn: typeof candidate.estimatedTimeToLearn === 'string'
      ? candidate.estimatedTimeToLearn
      : null,
    targetRoles: Array.isArray(candidate.targetRoles)
      ? candidate.targetRoles.filter((role) => typeof role === 'string').slice(0, 20)
      : [],
    confidence: { value: null, status: 'UNCALIBRATED', scale: '0_TO_1' },
    ranking: { position: index + 1, total },
    reasons: typeof candidate.whyRecommendedSnippet === 'string'
      ? [{ text: candidate.whyRecommendedSnippet, source: 'ML' }]
      : [],
    skillGaps: [],
    explanationRef: null,
    roadmapRef: null,
  };

  publicRecommendation.explanation = mapExplanation(candidate, id, now, context.newId);
  publicRecommendation.roadmap = mapRoadmap(candidate, id, now, context.newId);
  publicRecommendation.explanationRef = publicRecommendation.explanation
    ? publicRecommendation.explanation.id
    : null;
  publicRecommendation.roadmapRef = publicRecommendation.roadmap.status === 'AVAILABLE'
    ? publicRecommendation.roadmap.id
    : null;
  return publicRecommendation;
}

async function requestRecommendations(profile, erpRecord, resume, options, fetchImpl = fetch) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), env.aiServiceTimeoutMs);

  try {
    const response = await fetchImpl(`${env.aiServiceUrl}/api/v1/recommend?explain=true`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(buildModelRequest(profile, erpRecord, resume, options)),
      signal: controller.signal,
    });

    if (!response.ok) {
      if (response.status === 422) {
        throw createError('Recommendation inputs were rejected by the model service', 422, 'VALIDATION_ERROR');
      }
      if (response.status === 503) {
        throw createError('Recommendation model is unavailable', 503, 'SERVICE_UNAVAILABLE');
      }
      throw createError('Recommendation service failed', 502, 'UPSTREAM_SERVICE_ERROR');
    }

    let result;
    try {
      result = await response.json();
    } catch (_error) {
      throw createError('Recommendation service returned invalid JSON', 502, 'UPSTREAM_SERVICE_ERROR');
    }

    const candidates = result.all_ranked_stacks || result.recommendations;
    if (!Array.isArray(candidates) || candidates.length === 0 || !result.model_version) {
      throw createError('Recommendation service returned no usable recommendations', 502, 'UPSTREAM_SERVICE_ERROR');
    }
    return { candidates, modelVersion: result.model_version };
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createError('Recommendation service timed out', 503, 'SERVICE_UNAVAILABLE');
    }
    if (error.statusCode) throw error;
    throw createError('Recommendation service is unavailable', 503, 'SERVICE_UNAVAILABLE');
  } finally {
    clearTimeout(timeout);
  }
}

module.exports = {
  buildModelRequest,
  mapCandidate,
  requestRecommendations,
};
