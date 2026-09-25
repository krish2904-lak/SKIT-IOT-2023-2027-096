import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { ProfileErpPage } from './pages/ProfileErpPage';
import { InputFormPage } from './pages/InputFormPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { HistoryPage } from './pages/HistoryPage';
import { ExplanationView } from './views/ExplanationView';
import { mockExplanation } from './mocks/explanation';

function DashboardContent() {
  const {
    activeTab,
    setActiveTab,
    student,
    recommendations,
    explanation,
    history,
    isSyncingErp,
    isSubmittingInput,
    isLoadingRecs,
    syncNotification,
    handleSyncErp,
    handleSubmitInputs,
    handleSelectStackForExplanation,
    handleSaveToHistory,
  } = useDashboard();

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      student={student}
      isSyncingErp={isSyncingErp}
      onSyncErp={handleSyncErp}
      syncNotification={syncNotification}
      onTriggerRec={() => setActiveTab('recommendations')}
    >
      {activeTab === 'overview' && (
        <OverviewPage
          student={student}
          topRecommendation={recommendations[0]}
          onNavigate={setActiveTab}
          onTriggerRec={() => setActiveTab('recommendations')}
          isLoadingRecs={isLoadingRecs}
        />
      )}

      {activeTab === 'erp-profile' && (
        <ProfileErpPage
          student={student}
          onRefreshSync={handleSyncErp}
          isSyncing={isSyncingErp}
        />
      )}

      {activeTab === 'profile-input' && (
        <InputFormPage
          student={student}
          onSubmit={handleSubmitInputs}
          isSubmitting={isSubmittingInput}
        />
      )}

      {activeTab === 'recommendations' && (
        <RecommendationsPage
          recommendations={recommendations}
          explanation={explanation}
          onSelectStackForExplanation={handleSelectStackForExplanation}
          onSaveToHistory={handleSaveToHistory}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'explanation' && (
        <ExplanationView
          explanation={explanation ?? mockExplanation}
          onNavigate={setActiveTab}
        />
      )}

      {activeTab === 'history' && (
        <HistoryPage
          history={history}
          onNavigate={setActiveTab}
          onTriggerRec={() => setActiveTab('recommendations')}
        />
      )}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <DashboardProvider>
      <DashboardContent />
    </DashboardProvider>
  );
}
