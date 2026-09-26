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
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            MongoDB Archived Logs
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Historical Recommendations Log
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Review recommendations generated across semesters to monitor skill progression and
            curriculum alignment.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onTriggerRec}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
          >
            + Run New Evaluation
          </button>
          <button
            type="button"
            onClick={() => onNavigate('recommendations')}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
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
