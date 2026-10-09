import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type {
  StudentProfile,
  RecommendationItem,
  StackExplanation,
  SavedRecommendationHistoryItem,
  StudentInputFormData,
  DashboardTab,
} from '../types';
import { studentApi, recommendationApi } from '../api/mockApi';

interface DashboardContextType {
  activeTab: DashboardTab;
  setActiveTab: (tab: DashboardTab) => void;
  student: StudentProfile | null;
  recommendations: RecommendationItem[];
  explanation: StackExplanation | null;
  history: SavedRecommendationHistoryItem[];
  selectedStackId: string;
  isSyncingErp: boolean;
  isSubmittingInput: boolean;
  isLoadingRecs: boolean;
  syncNotification: string | null;
  handleSyncErp: () => Promise<void>;
  handleSubmitInputs: (data: StudentInputFormData) => Promise<boolean>;
  handleSelectStackForExplanation: (stackId: string) => void;
  handleSaveToHistory: (stack: RecommendationItem) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [student, setStudent] = useState<StudentProfile | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendationItem[]>([]);
  const [explanation, setExplanation] = useState<StackExplanation | null>(null);
  const [history, setHistory] = useState<SavedRecommendationHistoryItem[]>([]);
  const [selectedStackId, setSelectedStackId] = useState<string>('rec-001');
  const [isSyncingErp, setIsSyncingErp] = useState(false);
  const [isSubmittingInput, setIsSubmittingInput] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(false);
  const [syncNotification, setSyncNotification] = useState<string | null>(null);

  // Initialize data on mount
  useEffect(() => {
    let isMounted = true;
    async function loadInitialData() {
      try {
        const [profileData, recsData, historyData, expData] = await Promise.all([
          studentApi.getProfile(),
          recommendationApi.getRecommendations(),
          recommendationApi.getHistory(),
          recommendationApi.getExplanation('rec-001'),
        ]);

        if (isMounted) {
          setStudent(profileData);
          setRecommendations(recsData);
          setHistory(historyData);
          setExplanation(expData);
        }
      } catch (err) {
        console.error('Failed to load initial dashboard state', err);
      }
    }
    loadInitialData();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handler: ERP Sync Trigger
  const handleSyncErp = useCallback(async () => {
    setIsSyncingErp(true);
    setSyncNotification(null);
    try {
      const res = await studentApi.syncErpRecords();
      if (res.success) {
        setStudent(res.profile);
        setSyncNotification(res.message);
        setTimeout(() => setSyncNotification(null), 4000);
      }
    } catch (err) {
      console.error('ERP sync error', err);
      setSyncNotification('ERP sync failed. Showing cached university records.');
    } finally {
      setIsSyncingErp(false);
    }
  }, []);

  // Handler: Submit student inputs & trigger ML model
  const handleSubmitInputs = useCallback(
    async (data: StudentInputFormData): Promise<boolean> => {
      setIsSubmittingInput(true);
      try {
        await studentApi.submitInputs(data);
        if (student) {
          setStudent({
            ...student,
            interests: data.selectedDomains,
            skills: data.skills,
            resumeUploaded: data.resumeUploaded,
            resumeFileName: data.resumeFileName,
          });
        }
        setIsLoadingRecs(true);
        const updatedRecs = await recommendationApi.getRecommendations();
        setRecommendations(updatedRecs);
        setIsLoadingRecs(false);
        setActiveTab('recommendations');
        return true;
      } catch (err) {
        console.error('Error submitting student inputs', err);
        return false;
      } finally {
        setIsSubmittingInput(false);
      }
    },
    [student]
  );

  // Handler: Switch target stack for SHAP explanation
  const handleSelectStackForExplanation = useCallback(async (stackId: string) => {
    setSelectedStackId(stackId);
    try {
      const exp = await recommendationApi.getExplanation(stackId);
      setExplanation(exp);
      setActiveTab('explanation');
    } catch (err) {
      console.error('Failed to fetch explanation for stack', stackId, err);
    }
  }, []);

  // Handler: Save active recommendation to History
  const handleSaveToHistory = useCallback(
    async (stack: RecommendationItem) => {
      const newItem: SavedRecommendationHistoryItem = {
        id: `rec_run_${Date.now()}`,
        runDate: new Date().toISOString().split('T')[0],
        semesterRecorded: student?.semester ?? 6,
        topStackTitle: stack.title,
        matchScore: stack.matchScore,
        technologiesSummary: stack.technologies.map((t) => t.name),
        keyFactor: stack.whyRecommendedSnippet,
        targetRole: stack.targetRoles[0] || 'Software Engineer',
      };

      await recommendationApi.saveRecommendation(newItem);
      setHistory((prev) => [newItem, ...prev]);
    },
    [student?.semester]
  );

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
        isSyncingErp,
        isSubmittingInput,
        isLoadingRecs,
        syncNotification,
        handleSyncErp,
        handleSubmitInputs,
        handleSelectStackForExplanation,
        handleSaveToHistory,
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
