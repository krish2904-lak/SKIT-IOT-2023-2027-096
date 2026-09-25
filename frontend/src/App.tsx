import { useState } from 'react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewView } from './views/OverviewView';
import { ProfileInputView } from './views/ProfileInputView';
import { RecommendationsView } from './views/RecommendationsView';
import { ExplanationView } from './views/ExplanationView';
import { mockStudentProfile } from './mocks/student';
import { mockRecommendations } from './mocks/recommendation';
import { mockExplanation } from './mocks/explanation';
import type { DashboardTab } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      student={mockStudentProfile}
    >
      {activeTab === 'overview' && (
        <OverviewView
          student={mockStudentProfile}
          topRecommendation={mockRecommendations[0]}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'profile-input' && (
        <ProfileInputView student={mockStudentProfile} />
      )}

      {activeTab === 'recommendations' && (
        <RecommendationsView
          recommendations={mockRecommendations}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'explanation' && (
        <ExplanationView
          explanation={mockExplanation}
          onNavigate={setActiveTab}
        />
      )}
    </DashboardLayout>
  );
}
