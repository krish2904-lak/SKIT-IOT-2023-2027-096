import type {
  AcademicScoresData,
  RecommendationItem,
  SavedRecommendationHistoryItem,
  StackExplanation,
  StudentInputFormData,
  StudentProfile,
} from '../types';

type ApiEnvelope<T> = {
  success: true;
  data: T;
};

type ApiErrorEnvelope = {
  success: false;
  error?: { code?: string; message?: string; requestId?: string };
};

type ApiProfile = {
  id: string;
  userId: string;
  displayName: string;
  college: string;
  skills: Array<{ name: string; level: string; source: string }>;
  interests: Array<{ domain: string; priority: number }>;
  projectsCompleted?: number;
  certificationsCount?: number;
  preferences: {
    preferredCareer?: string | null;
    preferredDomains?: string[];
    weeklyStudyHours?: number | null;
    learningPace?: string | null;
  };
};

type ApiErpData = {
  branch: string;
  section: string | null;
  semester: number;
  academicYear: string;
  cgpa: number;
  cgpaScale: number;
  syncedAt: string | null;
  subjects: Array<{
    courseCode: string;
    name: string;
    semester: number;
    credits: number;
    score: number | null;
    grade: string | null;
    attendancePercent: number | null;
  }>;
} | null;

type ApiResume = {
  fileName: string;
  extractedSkills: Array<{ name: string; level: string; confidence: number | null }>;
} | null;

type ApiRecommendation = {
  id: string;
  modelScore: { value: number; scale: string; calibrationStatus: string };
  stack: { title: string; category: string; technologies: Array<{ name: string; category: string }> };
  ranking: { position: number; total: number };
  reasons: Array<{ text: string; source: string }>;
  runId: string;
  roadmap?: {
    status: string;
    phases: Array<{
      order: number;
      title: string;
      estimatedDuration: { value: number; unit: string } | null;
      topics: string[];
      resources: Array<{ title: string; url: string }>;
    }>;
  } | null;
  explanationRef: string | null;
  difficulty: string | null;
  estimatedTimeToLearn: string | null;
  targetRoles: string[];
};

export class ApiError extends Error {
  readonly status: number;
  readonly code: string;
  readonly requestId?: string;

  constructor(status: number, message: string, code = 'API_ERROR', requestId?: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

let accessToken: string | null = null;
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');

export function setAccessToken(token: string | null) {
  accessToken = token?.trim() || null;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);
  if (init.body && !(init.body instanceof FormData) && !headers.has('content-type')) {
    headers.set('content-type', 'application/json');
  }
  const response = await fetch(`${apiBaseUrl}${path}`, { ...init, headers });
  let payload: ApiEnvelope<T> | ApiErrorEnvelope;
  try {
    payload = await response.json() as ApiEnvelope<T> | ApiErrorEnvelope;
  } catch {
    throw new ApiError(response.status, 'The API returned an unreadable response');
  }
  if (!response.ok || !payload.success) {
    const failure = payload as ApiErrorEnvelope;
    throw new ApiError(
      response.status,
      failure.error?.message || `Request failed (${response.status})`,
      failure.error?.code,
      failure.error?.requestId,
    );
  }
  return payload.data;
}

function mapAcademicScores(erpData: ApiErpData): AcademicScoresData | undefined {
  if (!erpData) return undefined;
  const fields: Record<string, RegExp> = {
    web_technologies: /\b(web|frontend|front end|html|css|javascript)\b/i,
    dbms: /\b(database|dbms|sql)\b/i,
    dsa: /\b(data structures?|algorithms?|dsa)\b/i,
    iot_embedded: /\b(iot|embedded|microcontroller|sensor)\b/i,
    ml_math: /\b(machine learning|artificial intelligence|ai|math|statistics)\b/i,
    cloud_computing: /\b(cloud|aws|azure|gcp)\b/i,
    operating_systems: /\b(operating systems?|os)\b/i,
  };
  const result: AcademicScoresData = {};
  for (const [field, matcher] of Object.entries(fields)) {
    const scores = erpData.subjects
      .filter((subject) => subject.score !== null && matcher.test(`${subject.courseCode} ${subject.name}`))
      .map((subject) => subject.score as number);
    if (scores.length > 0) {
      result[field as keyof AcademicScoresData] = scores.reduce((sum, score) => sum + score, 0) / scores.length;
    }
  }
  return result;
}

function mapSkillLevel(level: string): StudentProfile['skills'][number]['level'] {
  return ({
    beginner: 'Beginner',
    intermediate: 'Intermediate',
    advanced: 'Advanced',
  }[level.toLowerCase()] || 'Unknown') as StudentProfile['skills'][number]['level'];
}

function mapProfile(
  profile: ApiProfile,
  erpData: ApiErpData = null,
  resume: ApiResume = null,
  previous?: StudentProfile,
): StudentProfile {
  const resumeSkills = resume?.extractedSkills
    ?? previous?.skills.filter((skill) => skill.source === 'RESUME_PARSED')
      .map((skill) => ({ name: skill.name, level: skill.level, confidence: null }))
    ?? [];
  return {
    id: profile.id,
    erpStudentId: null,
    name: profile.displayName,
    email: null,
    college: profile.college,
    branch: erpData?.branch ?? previous?.branch ?? null,
    section: erpData?.section ?? previous?.section ?? null,
    semester: erpData?.semester ?? previous?.semester ?? null,
    cgpa: erpData ? erpData.cgpa : previous?.cgpa ?? null,
    academicYear: erpData?.academicYear ?? previous?.academicYear ?? null,
    interests: profile.interests.map((interest) => interest.domain),
    skills: [
      ...profile.skills.map((skill) => ({
        name: skill.name,
        level: mapSkillLevel(skill.level),
        source: skill.source as StudentProfile['skills'][number]['source'],
      })),
      ...resumeSkills
        .filter((skill) => !profile.skills.some((profileSkill) =>
          profileSkill.name.toLowerCase() === skill.name.toLowerCase()
        ))
        .map((skill) => ({
          name: skill.name,
          level: mapSkillLevel(skill.level),
          source: 'RESUME_PARSED' as const,
        })),
    ],
    resumeUploaded: Boolean(resume) || Boolean(previous?.resumeUploaded),
    resumeFileName: resume?.fileName ?? previous?.resumeFileName,
    lastErpSync: erpData?.syncedAt ?? previous?.lastErpSync ?? null,
    erpCourses: erpData
      ? erpData.subjects.map((subject) => ({
      code: subject.courseCode,
      name: subject.name,
      semester: subject.semester,
      credits: subject.credits,
      theoryScore: subject.score ?? undefined,
      grade: subject.grade,
      attendancePercent: subject.attendancePercent,
    }))
      : previous?.erpCourses,
    projectsCompleted: profile.projectsCompleted ?? previous?.projectsCompleted ?? 0,
    certificationsCount: profile.certificationsCount ?? previous?.certificationsCount ?? 0,
    academicScores: mapAcademicScores(erpData) ?? previous?.academicScores,
    preferredCareer: profile.preferences.preferredCareer ?? null,
    weeklyStudyHours: profile.preferences.weeklyStudyHours ?? null,
    learningPace: ({
      SELF_PACED: 'Self-Paced',
      BALANCED: 'Balanced',
      INTENSIVE: 'Intensive',
    }[profile.preferences.learningPace || ''] || null),
    ...(previous ? {
      sgpaHistory: previous.sgpaHistory,
    } : {}),
  };
}

function mapRecommendation(item: ApiRecommendation): RecommendationItem {
  return {
    id: item.id,
    title: item.stack.title,
    category: item.stack.category,
    modelScore: item.modelScore.value,
    difficulty: (item.difficulty || 'Unknown') as RecommendationItem['difficulty'],
    estimatedTimeToLearn: item.estimatedTimeToLearn || 'Not specified',
    targetRoles: item.targetRoles || [],
    technologies: item.stack.technologies.map((technology) => ({
      name: technology.name,
      category: technology.category as RecommendationItem['technologies'][number]['category'],
    })),
    whyRecommendedSnippet: item.reasons[0]?.text || 'No explanation was provided.',
    rank: item.ranking.position,
    roadmap: item.roadmap?.phases.map((phase) => ({
      phase: `Phase ${phase.order}`,
      duration: phase.estimatedDuration
        ? `${phase.estimatedDuration.value} ${phase.estimatedDuration.unit.toLowerCase()}`
        : 'Not specified',
      title: phase.title,
      topics: phase.topics,
      recommendedResource: phase.resources[0]?.url || '',
    })),
  };
}

function mapExplanation(value: {
  recommendationId: string;
  summary: string | null;
  importantFactors: Array<{
    name: string;
    direction: 'POSITIVE' | 'NEGATIVE';
    description: string;
    contribution: { value: number } | null;
  }>;
  learningPrerequisites?: string[];
}): StackExplanation {
  const factors = value.importantFactors.map((factor, index) => ({
    featureName: `${factor.name}-${index}`,
    displayName: factor.name,
    shapValue: factor.contribution?.value ?? null,
    impactDirection: factor.direction,
    category: 'UNKNOWN' as const,
    explanationNote: factor.description,
  }));
  return {
    recommendationId: value.recommendationId,
    recommendationTitle: '',
    baseConfidence: null,
    summaryText: value.summary || 'No summary is available.',
    topPositiveFactors: factors.filter((factor) => factor.impactDirection === 'POSITIVE'),
    topNegativeFactors: factors.filter((factor) => factor.impactDirection === 'NEGATIVE'),
    learningPrerequisites: value.learningPrerequisites || [],
  };
}

export const studentApi = {
  async getProfileData() {
    const data = await request<{ profile: ApiProfile; erpData: ApiErpData; resume: ApiResume }>('/profile');
    return {
      profile: mapProfile(data.profile, data.erpData, data.resume),
      erpData: data.erpData,
    };
  },

  async createProfile(displayName: string, college: string) {
    const data = await request<{ profile: ApiProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        displayName,
        college,
        skills: [],
        interests: [],
        projectsCompleted: 0,
        certificationsCount: 0,
        preferences: {},
      }),
    });
    return mapProfile(data.profile);
  },

  async submitInputs(data: StudentInputFormData, previous: StudentProfile): Promise<StudentProfile> {
    const response = await request<{ profile: ApiProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify({
        displayName: previous.name,
        college: previous.college,
        skills: data.skills.map((skill) => ({
          name: skill.name,
          level: skill.level.toUpperCase(),
          source: 'SELF_REPORTED',
          verificationStatus: 'UNVERIFIED',
        })),
        interests: data.selectedDomains.map((domain, index) => ({
          domain,
          priority: index + 1,
          source: 'STUDENT_SELECTED',
        })),
        projectsCompleted: data.projectsCompleted ?? previous.projectsCompleted ?? 0,
        certificationsCount: data.certificationsCount ?? previous.certificationsCount ?? 0,
        preferences: {
          preferredCareer: data.preferredRole,
          preferredDomains: data.selectedDomains,
          weeklyStudyHours: data.weeklyCommitmentHours,
          learningPace: data.learningPace.replace('-', '_').toUpperCase(),
        },
      }),
    });
    return mapProfile(response.profile, null, null, previous);
  },

  async syncErpRecords() {
    return request<{ erpData: ApiErpData }>('/profile/erp', {
      method: 'POST',
      body: JSON.stringify({ syncMode: 'REFRESH' }),
    });
  },

  async uploadResume(file: File) {
    const form = new FormData();
    form.append('file', file);
    return request<{ resume: ApiResume }>('/profile/resume', { method: 'POST', body: form });
  },
};

export const recommendationApi = {
  async getRecommendations(): Promise<RecommendationItem[]> {
    const data = await request<{ items: ApiRecommendation[] }>('/recommendations');
    const latestRunId = data.items[0]?.runId;
    return data.items
      .filter((item) => item.runId === latestRunId)
      .map(mapRecommendation);
  },

  async generateRecommendations(options: {
    preferredCareer?: string | null;
    preferredDomains?: string[];
    weeklyStudyHours?: number | null;
    learningPace?: string | null;
  }): Promise<RecommendationItem[]> {
    const data = await request<{ items: ApiRecommendation[] }>('/recommendations', {
      method: 'POST',
      body: JSON.stringify({ options }),
    });
    return data.items.map(mapRecommendation);
  },

  async getExplanation(recommendationId: string): Promise<StackExplanation> {
    const data = await request<{ explanation: Parameters<typeof mapExplanation>[0] }>(
      `/recommendations/${encodeURIComponent(recommendationId)}/explanation`
    );
    return mapExplanation(data.explanation);
  },

  async getHistory(): Promise<SavedRecommendationHistoryItem[]> {
    const data = await request<{
      items: Array<{
        id: string;
        recommendationId: string;
        runId: string;
        generatedAt: string;
        semesterSnapshot: number | null;
        stackTitle: string;
        rankingPosition: number;
        modelScore: number | null;
        technologies: string[];
        targetRole: string | null;
        keyFactor: string | null;
      }>;
    }>('/history');
    return data.items.map((item) => ({
      id: item.id,
      runDate: item.generatedAt,
      semesterRecorded: item.semesterSnapshot,
      topStackTitle: item.stackTitle,
      modelScore: item.modelScore,
      technologiesSummary: item.technologies,
      keyFactor: item.keyFactor || 'Not provided',
      targetRole: item.targetRole || 'Not provided',
    }));
  },
};
