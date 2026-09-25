// Core Data Types for Tech-Stack Recommendation Platform
// Provisional assumptions for Sprints 1–4 contracts

export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type SkillSource = 'ERP_COURSEWORK' | 'SELF_REPORTED' | 'RESUME_PARSED';

export interface StudentSkill {
  name: string;
  level: SkillLevel;
  source: SkillSource;
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
}

export type TechCategory = 'Frontend' | 'Backend' | 'Database' | 'DevOps' | 'AI_ML' | 'IoT';

export interface TechItem {
  name: string;
  category: TechCategory;
  description?: string;
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
}

export interface FeatureImpact {
  featureName: string;
  displayName: string;
  shapValue: number; // positive or negative float
  impactDirection: 'POSITIVE' | 'NEGATIVE';
  category: 'ERP_ACADEMICS' | 'STUDENT_INTEREST' | 'EXISTING_SKILL' | 'INDUSTRY_DEMAND';
  explanationNote: string;
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

export type DashboardTab = 'overview' | 'profile-input' | 'recommendations' | 'explanation';
