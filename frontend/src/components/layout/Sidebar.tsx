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
          className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-xs transition-opacity"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0 transform transition-transform duration-200 ease-in-out ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Brand */}
          <div className="p-5 border-b border-slate-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
                  AI
                </div>
                <div>
                  <div className="font-bold text-sm tracking-tight text-white leading-tight">
                    EduStack AI
                  </div>
                  <div className="text-[11px] text-slate-400">ERP Tech-Stack Advisor</div>
                </div>
              </div>

              {/* Close button for mobile */}
              <button
                type="button"
                onClick={onCloseMobile}
                className="md:hidden text-slate-400 hover:text-white p-1"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-3 text-[10px] text-slate-400 bg-slate-800/80 px-2.5 py-1.5 rounded border border-slate-700/60 flex items-center justify-between">
              <span>SKIT CSE (IoT)</span>
              <span className="text-blue-400 font-mono">Roll: 096</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="p-3 space-y-1">
            <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
              Dashboard Navigation
            </div>
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 font-semibold border border-blue-500/30'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon(isActive)}
                    <div>
                      <div className="text-xs leading-tight font-medium">{item.label}</div>
                      <div className="text-[10px] text-slate-400">{item.sublabel}</div>
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                        isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-400'
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
        <div className="p-4 border-t border-slate-800 space-y-3">
          <div>
            <div className="flex items-center justify-between text-[11px] mb-1">
              <span className="text-slate-400">Profile Readiness</span>
              <span className="text-emerald-400 font-semibold font-mono">85%</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div className="bg-emerald-500 h-1.5 rounded-full w-[85%]" />
            </div>
          </div>

          {onTriggerRec && (
            <button
              type="button"
              onClick={onTriggerRec}
              className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

          <div className="text-[10px] text-slate-500 text-center">
            Final Year Project • F-096
          </div>
        </div>
      </aside>
    </>
  );
};
