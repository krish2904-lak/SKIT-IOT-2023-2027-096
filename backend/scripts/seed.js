const env = require('../src/config/env');
const { connectToDatabase, disconnectFromDatabase } = require('../src/config/database');
const StudentProfile = require('../src/models/StudentProfile');
const ERPRecord = require('../src/models/ERPRecord');

const seedUserId = 'user_seed_demo_001';
const seedSource = 'SYNTHETIC_DEMO';
const seedExternalStudentId = 'SYNTHETIC-ERP-001';

async function seedDevelopmentData() {
  if (env.nodeEnv !== 'development') {
    throw new Error('Seed data is restricted to NODE_ENV=development');
  }

  await connectToDatabase();

  const profile = await StudentProfile.findOneAndUpdate(
    { userId: seedUserId },
    {
      $setOnInsert: {
        userId: seedUserId,
        displayName: 'Demo Student',
        college: 'Example Technical Institute',
        skills: [
          {
            name: 'C++',
            level: 'INTERMEDIATE',
            source: 'SELF_REPORTED',
            verificationStatus: 'UNVERIFIED',
          },
          {
            name: 'JavaScript',
            level: 'INTERMEDIATE',
            source: 'SELF_REPORTED',
            verificationStatus: 'UNVERIFIED',
          },
          {
            name: 'SQL',
            level: 'BEGINNER',
            source: 'SELF_REPORTED',
            verificationStatus: 'UNVERIFIED',
          },
        ],
        interests: [
          { domain: 'Web Development', priority: 1, source: 'STUDENT_SELECTED' },
          { domain: 'AI', priority: 2, source: 'STUDENT_SELECTED' },
        ],
        preferences: {
          preferredCareer: 'Software Developer',
          preferredDomains: ['Web Development', 'AI'],
          weeklyStudyHours: 8,
          learningPace: 'BALANCED',
        },
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  const erpRecord = await ERPRecord.findOneAndUpdate(
    {
      profileId: profile._id,
      source: seedSource,
      externalStudentId: seedExternalStudentId,
    },
    {
      $setOnInsert: {
        profileId: profile._id,
        source: seedSource,
        externalStudentId: seedExternalStudentId,
        branch: 'Computer Science',
        section: 'DEMO',
        semester: 6,
        academicYear: '2023-2027',
        cgpa: 8.2,
        cgpaScale: 10,
        attendancePercent: 89,
        subjects: [
          {
            courseCode: 'DEMO-CS301',
            name: 'Synthetic Web Systems',
            semester: 5,
            credits: 4,
            score: 84,
            grade: 'A',
            attendancePercent: 90,
          },
        ],
        syncStatus: 'SYNCED',
        syncedAt: new Date('2026-10-01T00:00:00.000Z'),
      },
    },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  );

  if (!profile.erpRecordId || !profile.erpRecordId.equals(erpRecord._id)) {
    await StudentProfile.updateOne(
      { _id: profile._id },
      { $set: { erpRecordId: erpRecord._id } }
    );
  }

  console.log(`Synthetic development profile ready: ${profile._id}`);
  console.log(`Synthetic development ERP record ready: ${erpRecord._id}`);
}

seedDevelopmentData()
  .catch((error) => {
    console.error(`Development seed failed: ${error.message}`);
    process.exitCode = 1;
  })
  .finally(async () => {
    await disconnectFromDatabase().catch((error) => {
      console.error(`MongoDB disconnect failed (${error.name})`);
      process.exitCode = 1;
    });
  });