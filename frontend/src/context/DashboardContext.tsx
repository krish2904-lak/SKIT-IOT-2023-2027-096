import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import type {
  DashboardTab,
  RecommendationItem,
  SavedRecommendationHistoryItem,
  StackExplanation,
  StudentInputFormData,
  StudentProfile,
} from '../types';
import { ApiError, recommendationApi, studentApi } from '../api/client';

interface DashboardContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  student: StudentProfile | null;
  recommendations: RecommendationItem[];
  explanation: StackExplanation | null;
  history: SavedRecommendationHistoryItem[];
  selectedStackId: string | null;
  isLoading: boolean;
  isSyncingErp: boolean;
  isSubmittingInput: boolean;
  isLoadingRecs: boolean;
  profileSetupRequired: boolean;
  dashboardError: string | null;
  syncNotification: string | null;
  handleCreateProfile: (displayName: string, college: string) => Promise<boolean>;
  handleSyncErp: () => Promise<void>;
  handleUploadResume: (file: File) => Promise<boolean>;
  handleSubmitInputs: (data: StudentInputFormData) => Promise<boolean>;
  handleSelectStackForExplanation: (stackId: string) => Promise<void>;
  clearDashboardError: () => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [explanation, setExplanation] = useState<StackExplanation | null>(null);
  const [history, setHistory] = useState<SavedRecommendationHistoryItem[]>([]);
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSyncingErp, setIsSyncingErp] = useState(false);
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [profileSetupRequired, setProfileSetupRequired] = useState(false);
  const [dashboardError, setDashboardError] = useState<string | null>(null);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  const loadOwnedData = useCallback(async () => {
    const data = await studentApi.getProfileData();
    const [recs, historyItems] = await Promise.all([
      recommendationApi.getRecommendations(),
      recommendationApi.getHistory(),
    ]);
    setStudent(data.profile);
    setRecommendations(recs);
    setHistory(historyItems);
    setProfileSetupRequired(false);
  }, []);

  useEffect(() => {
    let active = true;
    async function initialize() {
      try {
        await loadOwnedData();
      } catch (error) {
        if (!active) return;
        if (error instanceof ApiError && error.status === 404) {
          setProfileSetupRequired(true);
        } else {
          setDashboardError(error instanceof Error ? error.message : 'Unable to load account data.');
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }
    initialize();
    return () => {
      active = false;
    };
  }, [loadOwnedData]);

  const handleCreateProfile = useCallback(async (displayName: string, college: string) => {
    setDashboardError(null);
    try {
      const profile = await studentApi.createProfile(displayName, college);
      setStudent(profile);
      setProfileSetupRequired(false);
      return true;
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Unable to create profile.');
      return false;
    }
  }, []);

  const handleSyncErp = useCallback(async () => {
    setIsSyncingErp(true);
    setSyncNotification(null);
    setDashboardError(null);
    try {
      await studentApi.syncErpRecords();
      await loadOwnedData();
      setSyncNotification('ERP records refreshed.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ERP synchronization failed.';
      setSyncNotification(message);
      setDashboardError(message);
    } finally {
      setIsSyncingErp(false);
    }
  }, [loadOwnedData]);

  const handleUploadResume = useCallback(async (file: File) => {
    setDashboardError(null);
    try {
      await studentApi.uploadResume(file);
      await loadOwnedData();
      return true;
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Resume upload failed.');
      return false;
    }
  }, [loadOwnedData]);

  const handleSubmitInputs = useCallback(async (data: StudentInputFormData): Promise<boolean> => {
    if (!student) return false;
    setIsSubmittingInput(true);
    setDashboardError(null);
    try {
      const updatedProfile = await studentApi.submitInputs(data, student);
      setStudent(updatedProfile);
      setIsLoadingRecs(true);
      const generated = await recommendationApi.generateRecommendations({
        preferredCareer: data.preferredRole,
        preferredDomains: data.selectedDomains,
        weeklyStudyHours: data.weeklyCommitmentHours,
        learningPace: data.learningPace.replace('-', '_').toUpperCase(),
      });
      setRecommendations(generated);
      setHistory(await recommendationApi.getHistory());
      if (generated[0]) {
        setSelectedStackId(generated[0].id);
        const loaded = await recommendationApi.getExplanation(generated[0].id);
        setExplanation({ ...loaded, recommendationTitle: generated[0].title });
      } else {
        setExplanation(null);
      }
      setActiveTab('recommendations');
      return true;
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Unable to save profile or generate recommendations.');
      return false;
    } finally {
      setIsLoadingRecs(false);
      setIsSubmittingInput(false);
    }
  }, [student]);

  const handleSelectStackForExplanation = useCallback(async (stackId: string) => {
    setSelectedStackId(stackId);
    setDashboardError(null);
    setExplanation(null);
    try {
      const loaded = await recommendationApi.getExplanation(stackId);
      setExplanation({
        ...loaded,
        recommendationTitle: recommendations.find((item) => item.id === stackId)?.title || '',
      });
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : 'Unable to load the explanation.');
    }
  }, [recommendations]);

  const clearDashboardError = useCallback(() => setDashboardError(null), []);

  return (
    <DashboardContext.Provider
      value={{
        activeTab,
        setActiveTab,
        student,
        recommendations,
        explanation,
        history,
        selectedStackId,
        isLoading,
        isSyncingErp,
        isSubmittingInput,
        isLoadingRecs,
        profileSetupRequired,
        dashboardError,
        syncNotification,
        handleCreateProfile,
        handleSyncErp,
        handleUploadResume,
        handleSubmitInputs,
        handleSelectStackForExplanation,
        clearDashboardError,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};
