import React from 'react';
import type { DashboardTab } from '../../types';

interface SidebarProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, onTabChange }) => {
  const navItems: Array<{
    id: DashboardTab;
    label: string;
    sublabel: string;
    sprintBadge: string;
    icon: (isActive: boolean) => React.ReactNode;
  }> = [
    {
      id: 'overview',
      label: 'Overview Hub',
      sublabel: 'Dashboard shell & stats',
      sprintBadge: 'Sprint 1',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`}
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
      id: 'profile-input',
      label: 'Profile & Inputs',
      sublabel: 'ERP & skill questionnaire',
      sprintBadge: 'Sprint 2',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      sublabel: 'AI-ranked tech stacks',
      sprintBadge: 'Sprint 3',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`}
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
      sublabel: 'Why this stack was chosen',
      sprintBadge: 'Sprint 4',
      icon: (active) => (
        <svg
          className={`w-5 h-5 ${active ? 'text-blue-600' : 'text-slate-400'}`}
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
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-100 flex flex-col justify-between shrink-0">
      <div>
        {/* Brand */}
        <div className="p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-xs">
              AI
            </div>
            <div>
              <div className="font-bold text-sm tracking-tight text-white leading-tight">
                EduStack AI
              </div>
              <div className="text-[11px] text-slate-400">Tech-Stack Advisor</div>
            </div>
          </div>
          <div className="mt-3 text-[10px] text-slate-400 bg-slate-800/80 px-2 py-1 rounded border border-slate-700/60 flex items-center justify-between">
            <span>Branch: CSE (IoT)</span>
            <span className="text-blue-400 font-mono">F-096</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-3 space-y-1">
          <div className="px-3 pt-2 pb-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            Student Navigation
          </div>
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-left transition-all cursor-pointer ${
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
                <span
                  className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                    isActive ? 'bg-blue-500/30 text-blue-300' : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {item.sprintBadge}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800 text-[11px] text-slate-400">
        <div className="flex items-center justify-between mb-1">
          <span className="text-slate-300 font-medium">Sprint 1 Target</span>
          <span className="text-emerald-400 text-[10px] font-mono">Static / Low-Fi</span>
        </div>
        <p className="text-[10px] leading-relaxed text-slate-400">
          Scaffolded by Prachi Bhardwaj for SKIT IoT research publication track.
        </p>
      </div>
    </aside>
  );
};
