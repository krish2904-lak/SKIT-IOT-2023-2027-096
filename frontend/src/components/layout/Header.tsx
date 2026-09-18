import React from 'react';
import type { DashboardTab } from '../../types';

interface HeaderProps {
  activeTab: DashboardTab;
  studentName: string;
  rollNumber: string;
  branch: string;
  lastSync: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  studentName,
  rollNumber,
  branch,
  lastSync,
}) => {
  const getTabTitle = (tab: DashboardTab) => {
    switch (tab) {
      case 'overview':
        return {
          title: 'Student Overview',
          desc: 'Academic profile summary, system status, and recommendation overview',
        };
      case 'profile-input':
        return {
          title: 'Profile & Technical Input',
          desc: 'ERP-verified academic records, self-declared interests, and resume parsing (Sprint 2)',
        };
      case 'recommendations':
        return {
          title: 'Tech-Stack Recommendations',
          desc: 'AI-evaluated technology stacks ranked by match confidence (Sprint 3)',
        };
      case 'explanation':
        return {
          title: 'Recommendation Explainability',
          desc: 'SHAP-based transparent feature importance breakdown and academic factor analysis (Sprint 4)',
        };
    }
  };

  const { title, desc } = getTabTitle(activeTab);

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
              Sprint 1 Prototype
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* ERP Sync Badge */}
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <div>
              <span className="font-semibold text-emerald-800">SKIT ERP: Connected</span>
              <span className="text-[10px] text-emerald-600 block">Synced: {lastSync}</span>
            </div>
          </div>

          {/* Student Profile Tag */}
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs">
              PB
            </div>
            <div className="text-left text-xs">
              <div className="font-semibold text-slate-800 leading-tight">{studentName}</div>
              <div className="text-[11px] text-slate-500">{rollNumber} • {branch}</div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
