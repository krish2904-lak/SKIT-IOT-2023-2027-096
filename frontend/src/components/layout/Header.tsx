import React from 'react';
import type { DashboardTab } from '../../types';

interface HeaderProps {
  activeTab: DashboardTab;
  studentName: string;
  rollNumber: string;
  branch: string;
  lastSync: string;
  isSyncing: boolean;
  onSyncErp: () => void;
  onToggleMobileNav: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  studentName,
  rollNumber,
  branch,
  lastSync,
  isSyncing,
  onSyncErp,
  onToggleMobileNav,
}) => {
  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Student Dashboard Hub',
          desc: 'Academic summary, model readiness, and primary tech-stack match overview.',
        };
      case 'erp-profile':
        return {
          title: 'ERP Academic Records',
          desc: 'Verified institutional grades, laboratory marks, and attendance ingested from college ERP.',
        };
      case 'profile-input':
        return {
          title: 'Skills & Preferences Form',
          desc: 'Student-declared interests, self-assessed skill levels, and resume parsing.',
        };
      case 'recommendations':
        return {
          title: 'AI Tech-Stack Recommendations',
          desc: 'Random Forest model outputs ranked by compatibility score and industry demand.',
        };
      case 'explanation':
        return {
          title: 'SHAP Explainability & Insights',
          desc: 'Mathematical feature contributions (SHAP values) driving model decisions.',
        };
      case 'history':
        return {
          title: 'Saved Recommendations History',
          desc: 'Archived recommendation runs and semester-by-semester career evolution.',
        };
    }
  };

  const { title, desc } = getTabTitle(activeTab);

  return (
    <header className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3.5 sticky top-0 z-20">
      <div className="flex items-center justify-between gap-4">
        {/* Mobile menu button & Title */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleMobileNav}
            className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
            aria-label="Toggle navigation menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                ERP Integrated
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{desc}</p>
          </div>
        </div>

        {/* Right actions: ERP sync status + Student badge */}
        <div className="flex items-center gap-3">
          {/* ERP Sync status with manual re-sync button */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
            <span
              className={`w-2 h-2 rounded-full ${
                isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
              }`}
            />
            <div className="hidden lg:block text-left text-xs">
              <span className="font-semibold text-slate-800 block leading-tight">
                {isSyncing ? 'Syncing ERP...' : 'ERP Live Synced'}
              </span>
              <span className="text-[10px] text-slate-500">
                {isSyncing ? 'Fetching records...' : `Last: ${lastSync}`}
              </span>
            </div>

            <button
              type="button"
              onClick={onSyncErp}
              disabled={isSyncing}
              title="Force re-sync with College ERP"
              className="ml-1 p-1 hover:bg-slate-200 text-slate-600 rounded transition disabled:opacity-50 cursor-pointer"
            >
              <svg
                className={`w-4 h-4 ${isSyncing ? 'animate-spin text-blue-600' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>

          {/* Student Profile Pill */}
          <div className="flex items-center gap-2.5 pl-2 sm:pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0">
              PB
            </div>
            <div className="hidden sm:block text-left text-xs">
              <div className="font-semibold text-slate-800 leading-tight">{studentName}</div>
              <div className="text-[11px] text-slate-500 font-mono">
                {rollNumber} • {branch}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
