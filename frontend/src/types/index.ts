// Core Data Types for Tech-Stack Recommendation Platform
// Bridges College ERP Records, Student Inputs, and AI/SHAP Predictions

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillSource = 'ERP_COURSEWORK' | 'SELF_REPORTED' | 'RESUME_PARSED';

export interface StudentSkill {
  name: string;
  level: SkillLevel;
  source: SkillSource;
}

export interface ErpCourseRecord {
  code: string;
  name: string;
  semester: number;
  credits: number;
  theoryScore?: number; // out of 100
  practicalScore?: number; // out of 100
  grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'P' | 'F';
  attendancePercent: number;
}

export interface SemesterSgpaRecord {
  semester: number;
  sgpa: number;
  creditsCompleted: number;
  backlogs: number;
  highlightCourse: string;
}

export interface StudentProfile {
  id: string;
  erpStudentId: string;
  name: string;
  email: string;
  college: string;
  branch: string;
  section: string;
  semester: number;
  cgpa: number;
  academicYear: string;
  interests: string[];
  skills: StudentSkill[];
  resumeUploaded: boolean;
  resumeFileName?: string;
  lastErpSync: string;
  erpCourses?: ErpCourseRecord[];
  sgpaHistory?: SemesterSgpaRecord[];
}

export type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI_ML' | 'IoT';

export interface TechItem {
  name: string;
  category: TechCategory;
  description?: string;
}

export interface RoadmapStep {
  phase: string;
  duration: string;
  title: string;
  topics: string[];
  recommendedResource: string;
}

export interface RecommendationItem {
  id: string;
  title: string;
  category: string;
  matchScore: number; // 0-100%
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTimeToLearn: string;
  targetRoles: string[];
  technologies: TechItem[];
  whyRecommendedSnippet: string;
  rank: number;
  roadmap?: RoadmapStep[];
}

export interface FeatureImpact {
  featureName: string;
  displayName: string;
  shapValue: number; // positive or negative float (-1.0 to +1.0 or percentage)
  impactDirection: 'POSITIVE' | 'NEGATIVE';
  category: 'ERP_ACADEMICS' | 'STUDENT_INTEREST' | 'EXISTING_SKILL' | 'INDUSTRY_DEMAND';
  explanationNote: string;
  remedyElective?: string;
  potentialBoost?: number;
}

export interface StackExplanation {
  recommendationId: string;
  recommendationTitle: string;
  baseConfidence: number;
  summaryText: string;
  topPositiveFactors: FeatureImpact[];
  topNegativeFactors: FeatureImpact[];
  learningPrerequisites: string[];
}

export interface SavedRecommendationHistoryItem {
  id: string;
  runDate: string;
  semesterRecorded: number;
  topStackTitle: string;
  matchScore: number;
  technologiesSummary: string[];
  keyFactor: string;
  targetRole: string;
}

export interface StudentInputFormData {
  selectedDomains: string[];
  skills: StudentSkill[];
  preferredRole: string;
  weeklyCommitmentHours: number;
  learningPace: 'Self-Paced' | 'Intensive' | 'Balanced';
  resumeUploaded: boolean;
  resumeFileName?: string;
}

export type DashboardTab =
  | 'overview'
  | 'erp-profile'
  | 'profile-input'
  | 'recommendations'
  | 'explanation'
  | 'history'
  | 'compare';
