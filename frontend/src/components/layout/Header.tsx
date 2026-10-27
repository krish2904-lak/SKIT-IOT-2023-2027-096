import React, { useState, useEffect } from 'react';
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
  onOpenReportModal?: () => void;
  onTabChange?: (tab: DashboardTab) => void;
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
  onOpenReportModal,
  onTabChange,
}) => {
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Keyboard shortcut ⌘K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isCommandOpen) {
        setIsCommandOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandOpen]);

  const navOptions: Array<{ id: DashboardTab; label: string; desc: string; category: string }> = [
    { id: 'overview', label: 'Overview Hub', desc: 'Cumulative GPA, model status & top tech stack match', category: 'Pages' },
    { id: 'erp-profile', label: 'ERP Academic Records', desc: 'Semester 1-5 grades, SGPA trajectory & attendance', category: 'Pages' },
    { id: 'profile-input', label: 'Skills & Preferences', desc: 'Self-assessed skills, desired roles & resume parsing', category: 'Pages' },
    { id: 'recommendations', label: 'AI Tech-Stack Recommendations', desc: 'Random Forest rankings, compatibility & roadmaps', category: 'Pages' },
    { id: 'compare', label: 'Stack Comparison Matrix', desc: 'Side-by-side trade-offs between top career paths', category: 'Pages' },
    { id: 'explanation', label: 'SHAP Explainability & Simulator', desc: 'Feature importance breakdown & elective simulation', category: 'Pages' },
    { id: 'history', label: 'Saved History', desc: 'Archived model runs and career path iterations', category: 'Pages' },
  ];

  const filteredNav = navOptions.filter(
    (item) =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Student Dashboard Hub',
          desc: 'Academic summary, model readiness, and primary tech-stack match overview.',
        };
      case 'erp-profile':
        return {
          title: 'ERP Academic Records & Performance Trends',
          desc: 'Verified institutional grades, laboratory marks, attendance, and semester SGPA history.',
        };
      case 'profile-input':
        return {
          title: 'Skills & Preferences Form',
          desc: 'Student-declared interests, self-assessed skill levels, and resume parsing with live validation.',
        };
      case 'recommendations':
        return {
          title: 'AI Tech-Stack Recommendations & Roadmaps',
          desc: 'Random Forest model outputs ranked by compatibility score and step-by-step learning roadmaps.',
        };
      case 'explanation':
        return {
          title: 'SHAP Explainability & Gap Bridge Simulator',
          desc: 'Mathematical feature contributions (TreeSHAP) and elective suggestions to boost scores.',
        };
      case 'compare':
        return {
          title: 'Stack Comparison & Trade-Off Matrix',
          desc: 'Side-by-side evaluation of top recommended career pathways and technology tooling.',
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
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/90 px-4 sm:px-6 py-3.5 sticky top-0 z-20 transition-all">
        <div className="flex items-center justify-between gap-4">
          {/* Mobile menu button & Title */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onToggleMobileNav}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ERP Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block mt-0.5">{desc}</p>
            </div>
          </div>

          {/* Center/Right: Quick Search Command Button */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setIsCommandOpen(true)}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 text-slate-600 hover:text-slate-900 rounded-lg text-xs font-medium border border-slate-200/80 transition cursor-pointer"
              title="Quick search (⌘K)"
            >
              <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span>Quick Jump</span>
              <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white text-slate-500 border border-slate-200 rounded shadow-2xs">
                ⌘K
              </kbd>
            </button>

            {onOpenReportModal && (
              <button
                type="button"
                onClick={onOpenReportModal}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold border border-slate-300 shadow-2xs transition cursor-pointer card-hover-lift"
              >
                <svg className="w-3.5 h-3.5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Advisory
              </button>
            )}

            {/* ERP Sync status with manual re-sync button */}
            <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/90 px-3 py-1.5 rounded-lg shadow-2xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                }`}
              />
              <div className="hidden lg:block text-left text-xs">
                <span className="font-semibold text-slate-800 block leading-tight">
                  {isSyncing ? 'Syncing ERP...' : 'ERP Synced'}
                </span>
                <span className="text-[10px] text-slate-500">
                  {isSyncing ? 'Fetching SKIT records...' : `Last: ${lastSync}`}
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
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs shrink-0 select-none">
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

      {/* Quick Jump / Command Palette Modal */}
      {isCommandOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-slate-900/50 backdrop-blur-xs">
          <div
            className="fixed inset-0"
            onClick={() => setIsCommandOpen(false)}
          />
          <div className="relative bg-white rounded-xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden z-10 animate-fade-in">
            <div className="p-3 border-b border-slate-100 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search dashboard views, ERP records, models..."
                autoFocus
                className="w-full text-sm outline-none text-slate-800 placeholder-slate-400 bg-transparent"
              />
              <kbd
                onClick={() => setIsCommandOpen(false)}
                className="px-1.5 py-0.5 text-[10px] font-mono bg-slate-100 text-slate-500 border border-slate-200 rounded cursor-pointer"
              >
                ESC
              </kbd>
            </div>

            <div className="max-h-72 overflow-y-auto p-2 space-y-1">
              <div className="px-3 py-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Navigate Sections
              </div>
              {filteredNav.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    if (onTabChange) onTabChange(item.id);
                    setIsCommandOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition cursor-pointer ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'hover:bg-slate-100 text-slate-700'
                  }`}
                >
                  <div>
                    <div className="font-medium text-slate-900">{item.label}</div>
                    <div className="text-[11px] text-slate-500">{item.desc}</div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Jump →</span>
                </button>
              ))}

              {filteredNav.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-400">
                  No matching views found for "{searchQuery}"
                </div>
              )}
            </div>

            <div className="bg-slate-50 px-4 py-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Pro-tip: Press <kbd className="font-mono bg-white px-1 py-0.5 rounded border border-slate-200">⌘K</kbd> anytime</span>
              <span>EduStack AI • SKIT CSE</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

