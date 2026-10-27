import { useState, type FormEvent } from 'react';
import { setAccessToken } from './api/client';
import { DashboardProvider, useDashboard } from './context/DashboardContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { OverviewPage } from './pages/OverviewPage';
import { ProfileErpPage } from './pages/ProfileErpPage';
import { InputFormPage } from './pages/InputFormPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ComparePage } from './pages/ComparePage';
import { HistoryPage } from './pages/HistoryPage';
import { ExplanationView } from './views/ExplanationView';

function AccessTokenGate({ onConnect }: { onConnect: (token: string) => void }) {
  const [token, setToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!token.trim()) {
      setError('Enter an access token from your configured identity provider.');
      return;
    }
    setAccessToken(token);
    onConnect(token.trim());
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Connect to F-096</h1>
        <p className="mt-2 text-sm text-slate-600">
          Paste a short-lived HS256 bearer token from your identity provider. The token stays in memory
          for this page session and is not stored in browser storage.
        </p>
        <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="access-token">
          Access token
        </label>
        <textarea
          id="access-token"
          value={token}
          onChange={(event) => setToken(event.target.value)}
          autoComplete="off"
          spellCheck={false}
          rows={4}
          className="mt-1 w-full rounded-lg border border-slate-300 p-3 font-mono text-xs focus:border-blue-500 focus:outline-none"
        />
        {error && <p role="alert" className="mt-2 text-sm text-rose-700">{error}</p>}
        <button type="submit" className="mt-4 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white">
          Connect
        </button>
      </form>
    </main>
  );
}

function ProfileSetup() {
  const { dashboardError, handleCreateProfile } = useDashboard();
  const [displayName, setDisplayName] = useState('');
  const [college, setCollege] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setIsSaving(true);
    await handleCreateProfile(displayName, college);
    setIsSaving(false);
  };

  return (
    <main className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <form onSubmit={submit} className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Set up your profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          This creates editable profile data only. Academic and ERP records are loaded only from a trusted connector.
        </p>
        <label className="mt-5 block text-sm font-medium text-slate-700" htmlFor="display-name">Display name</label>
        <input
          id="display-name"
          required
          maxLength={100}
          value={displayName}
          onChange={(event) => setDisplayName(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 p-3"
        />
        <label className="mt-4 block text-sm font-medium text-slate-700" htmlFor="college">College</label>
        <input
          id="college"
          required
          maxLength={160}
          value={college}
          onChange={(event) => setCollege(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 p-3"
        />
        {dashboardError && <p role="alert" className="mt-3 text-sm text-rose-700">{dashboardError}</p>}
        <button
          type="submit"
          disabled={isSaving}
          className="mt-5 rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSaving ? 'Saving…' : 'Create profile'}
        </button>
      </form>
    </main>
  );
}

function DashboardContent({ onDisconnect }: { onDisconnect: () => void }) {
  const {
    activeTab,
    setActiveTab,
    student,
    recommendations,
    explanation,
    history,
    isLoading,
    isSyncingErp,
    isSubmittingInput,
    isLoadingRecs,
    profileSetupRequired,
    dashboardError,
    syncNotification,
    handleSyncErp,
    handleUploadResume,
    handleSubmitInputs,
    handleSelectStackForExplanation,
    clearDashboardError,
  } = useDashboard();

  if (isLoading) {
    return <main className="min-h-screen bg-slate-50 p-8 text-slate-600">Loading account data…</main>;
  }
  if (profileSetupRequired) return <ProfileSetup />;
  if (!student) {
    return <main role="alert" className="min-h-screen bg-slate-50 p-8 text-rose-700">
      {dashboardError || 'Profile data is unavailable.'}
    </main>;
  }

  return (
    <DashboardLayout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      student={student}
      isSyncingErp={isSyncingErp}
      onSyncErp={handleSyncErp}
      syncNotification={syncNotification}
      onTriggerRec={() => setActiveTab('profile-input')}
      topRecommendation={recommendations[0]}
      explanation={explanation}
    >
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={onDisconnect}
          className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700"
        >
          Disconnect
        </button>
      </div>
      {dashboardError && (
        <div role="alert" className="mb-4 flex items-start justify-between gap-3 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <span>{dashboardError}</span>
          <button type="button" onClick={clearDashboardError} aria-label="Dismiss error">×</button>
        </div>
      )}
      {activeTab === 'overview' && (
        <OverviewPage
          student={student}
          topRecommendation={recommendations[0]}
          onNavigate={setActiveTab}
          onTriggerRec={() => setActiveTab('profile-input')}
          isLoadingRecs={isLoadingRecs}
        />
      )}
      {activeTab === 'erp-profile' && (
        <ProfileErpPage student={student} onRefreshSync={handleSyncErp} isSyncing={isSyncingErp} />
      )}
      {activeTab === 'profile-input' && (
        <InputFormPage
          student={student}
          onSubmit={handleSubmitInputs}
          onUploadResume={handleUploadResume}
          isSubmitting={isSubmittingInput}
        />
      )}
      {activeTab === 'recommendations' && (
        <RecommendationsPage
          recommendations={recommendations}
          explanation={explanation}
          onSelectStackForExplanation={handleSelectStackForExplanation}
          onNavigate={setActiveTab}
        />
      )}
      {activeTab === 'compare' && (
        <ComparePage
          recommendations={recommendations}
          onNavigate={setActiveTab}
          onSelectStackForExplanation={handleSelectStackForExplanation}
        />
      )}
      {activeTab === 'explanation' && (explanation
        ? <ExplanationView explanation={explanation} onNavigate={setActiveTab} />
        : <p className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600">
          Select a recommendation to load its explanation.
        </p>)}
      {activeTab === 'history' && (
        <HistoryPage
          history={history}
          onNavigate={setActiveTab}
          onTriggerRec={() => setActiveTab('profile-input')}
        />
      )}
    </DashboardLayout>
  );
}

export default function App() {
  const [token, setToken] = useState<string | null>(null);
  if (!token) {
    return <AccessTokenGate onConnect={setToken} />;
  }
  return (
    <DashboardProvider key={token}>
      <DashboardContent onDisconnect={() => {
        setAccessToken(null);
        setToken(null);
      }} />
    </DashboardProvider>
  );
}
