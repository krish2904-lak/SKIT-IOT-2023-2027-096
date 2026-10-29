import React from 'react';
import type { DashboardTab } from '../../types';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
  onTriggerRec?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
  onTriggerRec,
}) => {
  const navItems: Array<{
    id: DashboardTab;
    label: string;
    sublabel: string;
    badge?: string;
    icon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      id: 'overview',
      label: 'Overview Hub',
      sublabel: 'Snapshot & key metrics',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
          />
        </svg>
      ),
    },
    {
      id: 'erp-profile',
      label: 'ERP Academic Data',
      sublabel: 'Grades, SGPA & courses',
      badge: 'Live',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
          />
        </svg>
      ),
    },
    {
      id: 'profile-input',
      label: 'Skills & Preferences',
      sublabel: 'Self-ratings & interests',
      badge: 'Input',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      ),
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      sublabel: 'Ranked tech stacks',
      badge: 'ML',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
    },
    {
      id: 'explanation',
      label: 'SHAP Insights',
      sublabel: 'Model feature breakdown',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
    },
    {
      id: 'compare',
      label: 'Stack Comparison',
      sublabel: 'Side-by-side trade-offs',
      badge: 'New',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
          />
        </svg>
      ),
    },
    {
      id: 'history',
      label: 'Saved History',
      sublabel: 'Past iterations & trends',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-400' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  const handleItemClick = (tabId: DashboardTab) => {
    onTabChange(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          className="fixed inset-0 bg-slate-950/75 z-40 md:hidden backdrop-blur-sm transition-opacity duration-300"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-50 w-68 bg-[#0B0F19] text-slate-100 flex flex-col justify-between shrink-0 border-r border-slate-800/80 shadow-2xl md:shadow-none transform transition-transform duration-300 cubic-bezier(0.16, 1, 0.3, 1) ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
        aria-label="Sidebar Navigation"
      >
        <div className="flex-1 overflow-y-auto">
          {/* Brand Header */}
          <div className="p-5 border-b border-slate-800/70">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-500 flex items-center justify-center font-extrabold text-white text-xs shadow-md shadow-indigo-500/25 ring-1 ring-white/20">
                  AI
                </div>
                <div>
                  <div className="font-extrabold text-sm tracking-tight text-white leading-tight flex items-center gap-1.5">
                    EduStack AI
                    <span className="text-[9px] font-mono font-bold bg-indigo-500/20 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-400/20">v2</span>
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium">ERP Tech-Stack Advisor</div>
                </div>
              </div>

              {/* Close button for mobile */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/80 transition-colors focus-visible:ring-2 focus-visible:ring-indigo-400 cursor-pointer"
                aria-label="Close sidebar navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3.5 text-[11px] text-slate-300 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800 flex items-center justify-between shadow-inner">
              <span className="font-medium text-slate-400">SKIT CSE (IoT)</span>
              <span className="text-cyan-400 font-mono font-semibold bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">Roll: 096</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3.5 space-y-1">
            <div className="px-3 pt-2 pb-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              Student Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`group w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600/20 via-indigo-500/10 to-transparent text-indigo-300 font-semibold border-l-[3px] border-l-indigo-400 pl-3 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white pl-3.5'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 transition-transform duration-200 group-hover:scale-105">
                      {item.icon(isActive)}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs leading-tight font-medium truncate">{item.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5 font-normal">{item.sublabel}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-semibold shrink-0 ml-2 transition-colors ${
                        isActive
                          ? 'bg-indigo-500/30 text-indigo-300 border border-indigo-400/40 shadow-xs'
                          : 'bg-slate-800/80 text-slate-400 border border-slate-700/60 group-hover:border-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Readiness progress + Action Trigger */}
        <div className="p-4 border-t border-slate-800/70 space-y-3.5 bg-[#080C14]">
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-400 font-medium">Profile Readiness</span>
              <span className="text-emerald-400 font-bold font-mono text-[11px]">85%</span>
            </div>
            <div className="w-full bg-slate-800/90 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-1.5 rounded-full transition-all duration-500" 
                style={{ width: '85%' }} 
              />
            </div>
          </div>

          {onTriggerRec && (
            <button
              type="button"
              onClick={onTriggerRec}
              className="btn-interactive w-full py-2.5 px-3 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              <svg className="w-3.5 h-3.5 text-indigo-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Run AI Evaluation
            </button>
          )}

          <div className="text-[10px] text-slate-400 text-center font-mono">
            Final Year Project • F-096
          </div>
        </div>
      </aside>
    </>
  );
};
