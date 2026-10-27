process.env.JWT_SECRET = 'test-secret-with-at-least-thirty-two-bytes';

const assert = require('node:assert/strict');
const http = require('node:http');
const test = require('node:test');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const app = require('../src/app');
const authenticate = require('../src/middleware/authenticate');
const StudentProfile = require('../src/models/StudentProfile');
const ERPRecord = require('../src/models/ERPRecord');
const ResumeRecord = require('../src/models/ResumeRecord');
const Recommendation = require('../src/models/Recommendation');
const {
  validateProfileBody,
  updateProfile,
} = require('../src/controllers/profile.controller');
const {
  getHistory,
} = require('../src/controllers/recommendation.controller');
const {
  buildModelRequest,
  mapCandidate,
  requestRecommendations,
} = require('../src/services/recommendation.service');
const { parseResume } = require('../src/services/resume.service');
const { validateOptions } = require('../src/controllers/recommendation.controller');
const realFetch = global.fetch;

const secret = process.env.JWT_SECRET;
const makeToken = (sub = 'user-42', extra = {}) => jwt.sign(
  { sub, iat: Math.floor(Date.now() / 1000), ...extra },
  secret,
  { algorithm: 'HS256', expiresIn: '10m' }
);

test('bearer authentication rejects missing, expired, and malformed claims', async () => {
  const invoke = (token) => new Promise((resolve) => {
    const req = { get: () => token ? `Bearer ${token}` : undefined };
    authenticate(req, {}, (error) => resolve({ error, userId: req.userId }));
  });

  assert.equal((await invoke(null)).error.statusCode, 401);
  assert.equal((await invoke('not-a-token')).error.statusCode, 401);
  assert.equal((await invoke(jwt.sign({ sub: 'user-42' }, secret, {
    algorithm: 'HS256',
    expiresIn: -1,
  }))).error.statusCode, 401);
  assert.equal((await invoke(makeToken())).userId, 'user-42');
});

test('profile updates cannot assert ERP or resume provenance', () => {
  const profile = validateProfileBody({
    userId: 'attacker-chosen',
    erpRecordId: 'attacker-chosen',
    displayName: 'Demo Student',
    college: 'Example Institute',
    skills: [{
      name: 'Python',
      level: 'ADVANCED',
      source: 'ERP_COURSEWORK',
      verificationStatus: 'VERIFIED',
    }],
    interests: [{ domain: 'AI', priority: 1, source: 'INFERRED' }],
    projectsCompleted: 2,
    certificationsCount: 1,
    preferences: {},
  });

  assert.equal(profile.userId, undefined);
  assert.equal(profile.erpRecordId, undefined);
  assert.equal(profile.skills[0].source, 'SELF_REPORTED');
  assert.equal(profile.skills[0].verificationStatus, 'UNVERIFIED');
  assert.equal(profile.interests[0].source, 'STUDENT_SELECTED');
});

test('profile updates preserve trusted skills while replacing self-reported skills', async (t) => {
  const originals = {
    findOne: StudentProfile.findOne,
    findOneAndUpdate: StudentProfile.findOneAndUpdate,
  };
  const trustedSkill = {
    name: 'Database Systems',
    level: 'INTERMEDIATE',
    source: 'ERP_COURSEWORK',
    verificationStatus: 'VERIFIED',
  };
  StudentProfile.findOne = () => ({
    select: async () => ({ skills: [trustedSkill] }),
  });
  let updated;
  StudentProfile.findOneAndUpdate = async (_filter, update) => {
    updated = update.$set;
    return { _id: 'profile-1', ...update.$set };
  };
  t.after(() => {
    StudentProfile.findOne = originals.findOne;
    StudentProfile.findOneAndUpdate = originals.findOneAndUpdate;
  });

  const response = { json(body) { this.body = body; } };
  await updateProfile({
    userId: 'user-42',
    body: {
      displayName: 'Example Student',
      college: 'Example Institute',
      skills: [{ name: 'React', level: 'INTERMEDIATE' }],
      interests: [],
      preferences: {},
    },
  }, response);

  assert.deepEqual(updated.skills.map((skill) => skill.name), ['Database Systems', 'React']);
  assert.equal(response.body.data.profile.skills[0].verificationStatus, 'VERIFIED');
  assert.equal(response.body.data.profile.skills[1].source, 'SELF_REPORTED');
});

test('recommendation request contains canonical ERP data but no account identifiers', () => {
  const payload = buildModelRequest(
    {
      userId: 'private-account-id',
      displayName: 'Private Name',
      skills: [{ name: 'Python', level: 'ADVANCED', source: 'SELF_REPORTED' }],
      interests: [{ domain: 'AI', priority: 1 }],
      preferences: {},
    },
    {
      externalStudentId: 'private-erp-id',
      branch: 'Computer Science',
      semester: 6,
      cgpa: 8,
      cgpaScale: 10,
      subjects: [{ courseCode: 'CS101', name: 'Web Technologies', score: 90 }],
    },
    null,
    { requestedCount: 2 }
  );

  assert.equal(payload.student_id, 'anonymous');
  assert.equal(payload.cgpa, 8);
  assert.equal(payload.academic_scores.web_technologies, 90);
  assert.equal(payload.top_k, 2);
  assert.equal(JSON.stringify(payload).includes('private-account-id'), false);
  assert.equal(JSON.stringify(payload).includes('private-erp-id'), false);
  assert.equal(JSON.stringify(payload).includes('Private Name'), false);

  const boundedPayload = buildModelRequest(
    { preferences: {}, projectsCompleted: 2, certificationsCount: 1 },
    { branch: 'Computer Science', semester: 6, cgpa: 8, cgpaScale: 10, subjects: [] },
    { extractedSkills: [], projectsCount: 80, certificationsCount: 40 },
    {}
  );
  assert.equal(boundedPayload.projects_completed, 20);
  assert.equal(boundedPayload.certifications_count, 10);
});

test('recommendation mapping retains roadmap durations and model explanation metadata', () => {
  const item = mapCandidate({
    title: 'Web Stack',
    category: 'WEB',
    matchScore: 80,
    technologies: [{ name: 'React', category: 'Frontend' }],
    roadmap: [{
      title: 'Build foundations',
      duration: '8 weeks',
      topics: ['JavaScript'],
      recommendedResource: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript',
    }],
    explanation: {
      summary: 'The available profile evidence supports this stack.',
      learning_prerequisites: ['JavaScript fundamentals'],
      top_features: [{
        feature: 'skill_javascript',
        label: 'JavaScript',
        shap_value: 0.12,
        direction: 'supports',
        explanation_note: 'JavaScript contributed positively to this stack model score.',
      }],
    },
  }, 0, 1, {
    profileId: 'profile-1',
    runId: 'run-1',
    generatedAt: '2026-10-01T00:00:00.000Z',
    modelVersion: 'model-test-v1',
    newId: () => 'generated-id',
  });

  assert.deepEqual(item.roadmap.phases[0].estimatedDuration, { value: 8, unit: 'WEEKS' });
  assert.deepEqual(item.roadmap.prerequisites, ['JavaScript fundamentals']);
  assert.deepEqual(item.explanation.learningPrerequisites, ['JavaScript fundamentals']);
  assert.equal(
    item.explanation.importantFactors[0].description,
    'JavaScript contributed positively to this stack model score.'
  );
});

test('recommendation service calls the configured FastAPI contract and validates its response', async () => {
  let requestUrl;
  let requestBody;
  const result = await requestRecommendations(
    { preferences: {} },
    { branch: 'Computer Science', semester: 6, cgpa: 8, cgpaScale: 10, subjects: [] },
    null,
    {},
    async (url, init) => {
      requestUrl = url;
      requestBody = JSON.parse(init.body);
      return Response.json({
        model_version: 'test-model',
        all_ranked_stacks: [{ id: 'ai-id', title: 'AI Stack', category: 'AI', matchScore: 80, technologies: [] }],
      });
    }
  );

  assert.match(requestUrl, /\/api\/v1\/recommend\?explain=true$/);
  assert.equal(requestBody.student_id, 'anonymous');
  assert.equal(result.modelVersion, 'test-model');
  await assert.rejects(
    requestRecommendations(
      { preferences: {} },
      { branch: 'Computer Science', semester: 6, cgpa: 8, cgpaScale: 10, subjects: [] },
      null,
      {},
      async () => Response.json({ detail: 'unavailable' }, { status: 503 })
    ),
    { statusCode: 503 }
  );
});

test('resume parser proxy forwards bounded multipart bytes without storing the file', async () => {
  let capturedName;
  const parsed = await parseResume({
    originalname: 'sample_resume.pdf',
    mimetype: 'application/pdf',
    size: 12,
    buffer: Buffer.from('%PDF synthetic'),
  }, async (_url, init) => {
    capturedName = init.body.get('file').name;
    return Response.json({
      extracted_skills: [{ name: 'Python', level: 'intermediate' }],
      extracted_domains: ['AI'],
      projects_count: 1,
      certifications_count: 0,
    });
  });

  assert.equal(capturedName, 'sample_resume.pdf');
  assert.equal(parsed.extracted_skills[0].name, 'Python');
  await assert.rejects(
    parseResume({
      originalname: 'resume.exe',
      mimetype: 'application/octet-stream',
      size: 12,
      buffer: Buffer.from('data'),
    }),
    { statusCode: 415 }
  );
  await assert.rejects(
    parseResume({
      originalname: 'empty.pdf',
      mimetype: 'application/pdf',
      size: 0,
      buffer: Buffer.alloc(0),
    }),
    { statusCode: 400 }
  );
  await assert.rejects(
    parseResume({
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 4,
      buffer: Buffer.from('data'),
    }, async () => Response.json({
      extracted_skills: [],
      extracted_domains: [],
      projects_count: -1,
      certifications_count: 0,
    })),
    { statusCode: 502 }
  );
});

test('resume upload authenticates, stores parsed metadata, and links it to the caller profile', async (t) => {
  const originals = {
    profileFindOne: StudentProfile.findOne,
    profileUpdateOne: StudentProfile.updateOne,
    resumeCreate: ResumeRecord.create,
    resumeDeleteOne: ResumeRecord.deleteOne,
    globalFetch: global.fetch,
  };
  const profileId = new mongoose.Types.ObjectId();
  const resumeId = new mongoose.Types.ObjectId();
  let insertedResume;
  let linkedResumeId;
  let profileExists = true;
  let cleanupCount = 0;
  StudentProfile.findOne = async () => ({
    _id: profileId,
    userId: 'user-42',
    toObject() {
      return { _id: profileId, userId: 'user-42' };
    },
  });
  StudentProfile.updateOne = async (filter, update) => {
    assert.equal(String(filter._id), String(profileId));
    assert.equal(filter.userId, 'user-42');
    linkedResumeId = update.$set.resumeId;
    return { matchedCount: profileExists ? 1 : 0, modifiedCount: profileExists ? 1 : 0 };
  };
  ResumeRecord.create = async (record) => {
    insertedResume = record;
    return { _id: resumeId, ...record };
  };
  ResumeRecord.deleteOne = async () => {
    cleanupCount += 1;
    return { deletedCount: 1 };
  };
  global.fetch = async (_url, init) => {
    const uploaded = init.body.get('file');
    assert.equal(uploaded.name, 'portfolio.pdf');
    assert.equal(uploaded.type, 'application/pdf');
    return Response.json({
      extracted_skills: [
        { name: 'Python', level: 'advanced' },
        { name: 'React', level: 'intermediate' },
      ],
      extracted_domains: ['AI', 'Web Development'],
      projects_count: 2,
      certifications_count: 1,
    });
  };
  t.after(() => {
    StudentProfile.findOne = originals.profileFindOne;
    StudentProfile.updateOne = originals.profileUpdateOne;
    ResumeRecord.create = originals.resumeCreate;
    ResumeRecord.deleteOne = originals.resumeDeleteOne;
    global.fetch = originals.globalFetch;
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => {
    server.close(resolve);
    server.closeAllConnections();
  }));
  const address = server.address();
  const form = new FormData();
  form.append('file', new Blob(['%PDF synthetic resume'], { type: 'application/pdf' }), 'portfolio.pdf');
  const response = await realFetch(`http://127.0.0.1:${address.port}/api/profile/resume`, {
    method: 'POST',
    headers: { authorization: `Bearer ${makeToken()}` },
    body: form,
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.resume.id, String(resumeId));
  assert.equal(body.data.resume.fileName, 'portfolio.pdf');
  assert.deepEqual(body.data.resume.extractedSkills.map((skill) => skill.name), ['Python', 'React']);
  assert.deepEqual(insertedResume.extractedSkills.map((skill) => skill.level), ['ADVANCED', 'INTERMEDIATE']);
  assert.equal(insertedResume.projectsCount, 2);
  assert.equal(insertedResume.certificationsCount, 1);
  assert.equal(Object.hasOwn(insertedResume, 'buffer'), false);
  assert.equal(linkedResumeId, resumeId);

  profileExists = false;
  const orphanedForm = new FormData();
  orphanedForm.append('file', new Blob(['%PDF synthetic resume'], { type: 'application/pdf' }), 'portfolio.pdf');
  const orphanedResponse = await realFetch(`http://127.0.0.1:${address.port}/api/profile/resume`, {
    method: 'POST',
    headers: { authorization: `Bearer ${makeToken()}` },
    body: orphanedForm,
  });
  assert.equal(orphanedResponse.status, 404);
  assert.equal(cleanupCount, 1);
});

test('profile recommendation endpoint is authenticated and persists FastAPI results', async (t) => {
  const originals = {
    profileFindOne: StudentProfile.findOne,
    erpFindOne: ERPRecord.findOne,
    resumeFindOne: ResumeRecord.findOne,
    insertMany: Recommendation.insertMany,
    globalFetch: global.fetch,
  };
  const profileId = new mongoose.Types.ObjectId();
  StudentProfile.findOne = async () => ({
    _id: profileId,
    userId: 'user-42',
    preferences: { preferredDomains: ['Web Development'] },
    skills: [{ name: 'JavaScript', level: 'INTERMEDIATE', source: 'SELF_REPORTED' }],
    interests: [],
    projectsCompleted: 0,
    certificationsCount: 0,
    erpRecordId: new mongoose.Types.ObjectId(),
    resumeId: null,
  });
  ERPRecord.findOne = async () => ({
    _id: new mongoose.Types.ObjectId(),
    profileId,
    branch: 'Computer Science',
    semester: 6,
    cgpa: 8.2,
    cgpaScale: 10,
    subjects: [{ courseCode: 'DEMO-CS301', name: 'Synthetic Web Systems', score: 84 }],
  });
  ResumeRecord.findOne = async () => null;
  let inserted;
  Recommendation.insertMany = async (records) => {
    inserted = records;
    return records;
  };
  global.fetch = async (_url, init) => {
    const payload = JSON.parse(init.body);
    assert.equal(payload.student_id, 'anonymous');
    assert.equal(payload.cgpa, 8.2);
    return Response.json({
      model_version: 'model-test-v1',
      all_ranked_stacks: [{
        id: 'catalog-result-id',
        title: 'Web Stack',
        category: 'WEB',
        matchScore: 83.5,
        difficulty: 'INTERMEDIATE',
        estimatedTimeToLearn: '8 weeks',
        targetRoles: ['Frontend Developer'],
        technologies: [{ name: 'React', category: 'Frontend' }],
        whyRecommendedSnippet: 'The current interests align with web development.',
        rank: 1,
        roadmap: [],
        explanation: null,
      }],
    });
  };

  t.after(() => {
    StudentProfile.findOne = originals.profileFindOne;
    ERPRecord.findOne = originals.erpFindOne;
    ResumeRecord.findOne = originals.resumeFindOne;
    Recommendation.insertMany = originals.insertMany;
    global.fetch = originals.globalFetch;
  });

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve) => server.close(resolve)));
  const address = server.address();
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const denied = await realFetch(`${baseUrl}/api/recommendations`, { method: 'POST' });
  assert.equal(denied.status, 401);

  const response = await realFetch(`${baseUrl}/api/recommendations`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${makeToken()}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({ options: { requestedCount: 1 } }),
  });
  const body = await response.json();

  assert.equal(response.status, 201);
  assert.equal(body.data.items[0].generationMode, 'ML');
  assert.equal(body.data.items[0].confidence.value, null);
  assert.equal(body.data.items[0].modelScore.value, 83.5);
  assert.equal(body.data.items[0].runId, body.data.runId);
  assert.equal(inserted.length, 1);
  assert.equal(inserted[0].userId, 'user-42');
  assert.equal(inserted[0].stack.title, 'Web Stack');
});

test('recommendation options and pagination reject invalid values', () => {
  assert.equal(validateOptions({ options: { requestedCount: 5 } }, {}).requestedCount, 5);
  assert.throws(() => validateOptions({ options: { requestedCount: 6 } }, {}), {
    statusCode: 400,
  });
});

test('recommendation history returns uncalibrated model scores without confidence claims', async (t) => {
  const originalAggregate = Recommendation.aggregate;
  Recommendation.aggregate = async () => [{
    items: [{
      recommendation: {
        _id: new mongoose.Types.ObjectId(),
        runId: 'run-1',
        generatedAt: new Date('2026-10-01T00:00:00.000Z'),
        semesterSnapshot: 6,
        stack: { title: 'Web Stack', technologies: [{ name: 'React' }] },
        ranking: { position: 1 },
        confidence: { value: null },
        modelScore: { value: 83.5 },
        generationMode: 'ML',
        targetRoles: ['Frontend Developer'],
        reasons: [{ text: 'Selected interest aligns with this stack.' }],
      },
    }],
    total: [{ count: 1 }],
  }];
  t.after(() => { Recommendation.aggregate = originalAggregate; });

  const response = { json(body) { this.body = body; } };
  await getHistory({ userId: 'user-42', query: {} }, response);
  const historyItem = response.body.data.items[0];
  assert.equal(historyItem.modelScore, 83.5);
  assert.equal(historyItem.confidence, null);
});
