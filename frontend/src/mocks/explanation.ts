import type { StackExplanation } from '../types';

export const mockExplanation: StackExplanation = {
  recommendationId: 'rec-001',
  recommendationTitle: 'Modern Full-Stack Cloud Native',
  baseConfidence: 0.52,
  summaryText:
    'The Random Forest recommendation model evaluated your verified ERP transcript, self-reported skills, and project interests. Your high marks in Web Technologies (95%) and DBMS (84%) provided the highest positive SHAP weights, while missing containerization experience represents the primary bridgeable gap.',
  topPositiveFactors: [
    {
      featureName: 'academic_course_web_tech',
      displayName: 'Grade A+ in Web Development Lab (ERP: 95/100)',
      shapValue: 0.22,
      impactDirection: 'POSITIVE',
      category: 'ERP_ACADEMICS',
      explanationNote: 'Institutional coursework directly maps to modern frontend JavaScript & responsive layout architectures.',
    },
    {
      featureName: 'student_interest_cloud',
      displayName: 'Declared Career Interest: Cloud Architecture',
      shapValue: 0.16,
      impactDirection: 'POSITIVE',
      category: 'STUDENT_INTEREST',
      explanationNote: 'Student-expressed career objective matches target industry demand for Full-Stack Cloud engineers.',
    },
    {
      featureName: 'skill_react_frontend',
      displayName: 'Self-Assessed Skill: React.js (Intermediate)',
      shapValue: 0.12,
      impactDirection: 'POSITIVE',
      category: 'EXISTING_SKILL',
      explanationNote: 'Existing React component familiarity drastically shortens the development ramp-up time.',
    },
    {
      featureName: 'academic_dbms_score',
      displayName: 'Grade A in DBMS & Relational SQL (ERP: 84/100)',
      shapValue: 0.08,
      impactDirection: 'POSITIVE',
      category: 'ERP_ACADEMICS',
      explanationNote: 'Relational data modeling foundations carry over directly into MongoDB schema design and query optimization.',
    },
  ],
  topNegativeFactors: [
    {
      featureName: 'skill_devops_containers',
      displayName: 'No Prior Docker / Containerization Experience',
      shapValue: -0.06,
      impactDirection: 'NEGATIVE',
      category: 'EXISTING_SKILL',
      explanationNote: 'Model applied penalty for missing DevOps tools. Bridging this skill boosts employment readiness.',
      remedyElective: 'Docker for Developers Free Workshop (SKIT IoT Lab)',
      potentialBoost: 4.8,
    },
    {
      featureName: 'academic_low_cloud_credits',
      displayName: 'Cloud Computing Department Elective Pending',
      shapValue: -0.04,
      impactDirection: 'NEGATIVE',
      category: 'ERP_ACADEMICS',
      explanationNote: 'Elective 6CS5-11 (Cloud Computing) is queued for Semester 6/7 registration.',
      remedyElective: 'Enrol in upcoming elective: 6CS5-11 Cloud Computing',
      potentialBoost: 3.2,
    },
  ],
  learningPrerequisites: [
    'Review asynchronous JavaScript & Promises (ES6+)',
    'Understand RESTful API conventions & HTTP status codes',
    'Follow introductory Docker container tutorial (Dockerfile, docker-compose)',
  ],
};
