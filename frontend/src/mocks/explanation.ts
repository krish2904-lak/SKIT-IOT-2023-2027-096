import type { StackExplanation } from '../types';

export const mockExplanation: StackExplanation = {
  recommendationId: 'rec-001',
  recommendationTitle: 'Modern Full-Stack Cloud Native',
  baseConfidence: 0.94,
  summaryText:
    'The Random Forest recommendation model evaluated your verified ERP transcript, self-reported skills, and project interests. Your high marks in Web Technologies and DBMS provided the highest positive SHAP weights.',
  topPositiveFactors: [
    {
      featureName: 'academic_course_web_tech',
      displayName: 'Grade A in Web Technology (ERP)',
      shapValue: 0.38,
      impactDirection: 'POSITIVE',
      category: 'ERP_ACADEMICS',
      explanationNote: 'Student achieved outstanding marks in college internal and semester exams for Web Dev fundamentals.',
    },
    {
      featureName: 'skill_react_frontend',
      displayName: 'Demonstrated React & JavaScript Experience',
      shapValue: 0.29,
      impactDirection: 'POSITIVE',
      category: 'EXISTING_SKILL',
      explanationNote: 'Existing frontend familiarity drastically reduces ramp-up time for this technology stack.',
    },
    {
      featureName: 'student_interest_fullstack',
      displayName: 'Selected Interest: Full-Stack Web',
      shapValue: 0.21,
      impactDirection: 'POSITIVE',
      category: 'STUDENT_INTEREST',
      explanationNote: 'Matches student-expressed career goals in the input questionnaire.',
    },
    {
      featureName: 'academic_dbms_score',
      displayName: 'Grade A- in DBMS & SQL (ERP)',
      shapValue: 0.16,
      impactDirection: 'POSITIVE',
      category: 'ERP_ACADEMICS',
      explanationNote: 'Database principles carry over directly into MongoDB schema design and query optimization.',
    },
  ],
  topNegativeFactors: [
    {
      featureName: 'skill_devops_containers',
      displayName: 'No Prior Docker / DevOps Exposure',
      shapValue: -0.08,
      impactDirection: 'NEGATIVE',
      category: 'EXISTING_SKILL',
      explanationNote: 'Slight penalty due to lack of containerization coursework; recommended as an early learning module.',
    },
    {
      featureName: 'academic_low_cloud_credits',
      displayName: 'No Cloud Computing Elective Completed Yet',
      shapValue: -0.04,
      impactDirection: 'NEGATIVE',
      category: 'ERP_ACADEMICS',
      explanationNote: 'Course is scheduled for Semester 7 per the academic syllabus.',
    },
  ],
  learningPrerequisites: [
    'Review asynchronous JavaScript & Promises',
    'Understand RESTful API conventions & HTTP status codes',
    'Follow introductory Docker container tutorial',
  ],
};
