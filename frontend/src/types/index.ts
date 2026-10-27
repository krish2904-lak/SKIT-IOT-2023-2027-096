export type SkillLevel = 'Beginner' | 'Intermediate' | 'Advanced' | 'Unknown';
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
  grade?: string | null;
  attendancePercent?: number | null;
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
  erpStudentId: string | null;
  name: string;
  email: string | null;
  college: string;
  branch: string | null;
  section: string | null;
  semester: number | null;
  cgpa: number | null;
  academicYear: string | null;
  interests: string[];
  skills: StudentSkill[];
  resumeUploaded: boolean;
  resumeFileName?: string;
  lastErpSync: string | null;
  erpCourses?: ErpCourseRecord[];
  sgpaHistory?: SemesterSgpaRecord[];
  projectsCompleted?: number;
  certificationsCount?: number;
  academicScores?: AcademicScoresData;
  preferredCareer?: string | null;
  weeklyStudyHours?: number | null;
  learningPace?: string | null;
}

export interface AcademicScoresData {
  web_technologies?: number;
  dbms?: number;
  dsa?: number;
  iot_embedded?: number;
  ml_math?: number;
  cloud_computing?: number;
  operating_systems?: number;
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
  modelScore: number; // Uncalibrated model ranking score on a 0-100 scale.
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | 'Unknown';
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
  shapValue: number | null;
  impactDirection: 'POSITIVE' | 'NEGATIVE';
  category: 'ERP_ACADEMICS' | 'STUDENT_INTEREST' | 'EXISTING_SKILL' | 'INDUSTRY_DEMAND' | 'UNKNOWN';
  explanationNote: string;
  remedyElective?: string;
  potentialBoost?: number;
}

export interface StackExplanation {
  recommendationId: string;
  recommendationTitle: string;
  baseConfidence: number | null;
  summaryText: string;
  topPositiveFactors: FeatureImpact[];
  topNegativeFactors: FeatureImpact[];
  learningPrerequisites: string[];
}

export interface SavedRecommendationHistoryItem {
  id: string;
  runDate: string;
  semesterRecorded: number | null;
  topStackTitle: string;
  modelScore: number | null;
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
  projectsCompleted?: number;
  certificationsCount?: number;
  academicScores?: AcademicScoresData;
}

export type DashboardTab =
  | 'overview'
  | 'erp-profile'
  | 'profile-input'
  | 'recommendations'
  | 'explanation'
  | 'history'
  | 'compare';
