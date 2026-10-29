import React from 'react';
import type { SavedRecommendationHistoryItem, DashboardTab } from '../types';
import { HistoryTable } from '../components/history/HistoryTable';

interface HistoryPageProps {
  history: SavedRecommendationHistoryItem[];
  onNavigate: (tab: DashboardTab) => void;
  onTriggerRec: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  history,
  onNavigate,
  onTriggerRec,
}) => {
  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
            MongoDB Archived Logs
          </span>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
            Historical Recommendations Log
          </h2>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-normal">
            Review recommendations generated across semesters to monitor skill progression and
            curriculum alignment.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={onTriggerRec}
            className="btn-interactive px-4 py-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/20 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            + Run New Evaluation
          </button>
          <button
            type="button"
            onClick={() => onNavigate('recommendations')}
            className="btn-interactive px-4 py-2 bg-slate-100 hover:bg-slate-200/80 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Current Active Stacks
          </button>
        </div>
      </div>

      {/* History Table */}
      <HistoryTable
        history={history}
        onSelectRun={() => {
          onNavigate('recommendations');
        }}
      />
    </div>
  );
};
