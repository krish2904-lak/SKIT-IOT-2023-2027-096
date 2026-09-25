// API Service Layer (Mock REST Endpoints)
// Connects to Node.js/Express Gateway & FastAPI ML Microservice

import type {
  StudentProfile,
  RecommendationItem,
  StackExplanation,
  SavedRecommendationHistoryItem,
  StudentInputFormData,
} from '../types';
import { mockStudentProfile } from '../mocks/student';
import { mockRecommendations } from '../mocks/recommendation';
import { mockExplanation } from '../mocks/explanation';
import { mockRecommendationHistory } from '../mocks/history';

// Helper to simulate network latency
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const studentApi = {
  // GET /api/student/profile
  async getProfile(): Promise<StudentProfile> {
    await delay(300);
    return { ...mockStudentProfile };
  },

  // POST /api/erp/sync
  async syncErpRecords(): Promise<{ success: boolean; profile: StudentProfile; message: string }> {
    await delay(800);
    const updated: StudentProfile = {
      ...mockStudentProfile,
      lastErpSync: new Date().toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    return {
      success: true,
      profile: updated,
      message: 'Successfully re-synced academic records from SKIT ERP portal.',
    };
  },

  // POST /api/student/inputs
  async submitInputs(data: StudentInputFormData): Promise<{ success: boolean; message: string }> {
    await delay(600);
    return {
      success: true,
      message: `Saved ${data.skills.length} skills and ${data.selectedDomains.length} domains to database.`,
    };
  },
};

export const recommendationApi = {
  // GET /api/recommendations
  async getRecommendations(): Promise<RecommendationItem[]> {
    await delay(400);
    return [...mockRecommendations];
  },

  // GET /api/recommendations/explanation/:id
  async getExplanation(stackId: string): Promise<StackExplanation> {
    await delay(350);
    return {
      ...mockExplanation,
      recommendationId: stackId,
    };
  },

  // GET /api/recommendations/history
  async getHistory(): Promise<SavedRecommendationHistoryItem[]> {
    await delay(300);
    return [...mockRecommendationHistory];
  },

  // POST /api/recommendations/save
  async saveRecommendation(item: SavedRecommendationHistoryItem): Promise<{ success: boolean }> {
    await delay(400);
    mockRecommendationHistory.unshift(item);
    return { success: true };
  },
};
