import React, { useState } from 'react';
import type { SavedRecommendationHistoryItem } from '../../types';

interface HistoryTableProps {
  history: SavedRecommendationHistoryItem[];
  onSelectRun?: (item: SavedRecommendationHistoryItem) => void;
}

export const HistoryTable: React.FC<HistoryTableProps> = ({ history, onSelectRun }) => {
  const [selectedItem, setSelectedItem] = useState<SavedRecommendationHistoryItem | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopyId = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Overview Top Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Recommendation History & Career Trajectory
          </h3>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-normal">
            Archived model inferences stored in MongoDB. Tracks how your stack recommendations
            evolve across academic semesters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium bg-slate-100/80 px-3 py-1.5 rounded-xl border border-slate-200">
            Total Saved Inferences: <strong className="text-slate-900 font-bold">{history.length}</strong>
          </span>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-200/80">
                <th className="px-5 py-3.5">Inference Date</th>
                <th className="px-5 py-3.5">Semester</th>
                <th className="px-5 py-3.5">Top Recommended Stack</th>
                <th className="px-5 py-3.5">Match Score</th>
                <th className="px-5 py-3.5">Target Career Role</th>
                <th className="px-5 py-3.5">Primary Factor</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {history.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => setSelectedItem(selectedItem?.id === run.id ? null : run)}
                  className="hover:bg-slate-50/80 transition-colors cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-mono text-slate-600 font-medium">
                    {run.runDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      Semester {run.semesterRecorded}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-bold text-slate-900">
                    {run.topStackTitle}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {run.technologiesSummary.map((tech: string) => (
                        <span
                          key={tech}
                          className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {run.matchScore}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 font-semibold">
                    {run.targetRole}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate font-normal" title={run.keyFactor}>
                    {run.keyFactor}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(run.id, e)}
                      className="btn-interactive px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-[11px] font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    >
                      {copiedId === run.id ? 'Copied ID' : 'Copy ID'}
                    </button>
                    {onSelectRun && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRun(run);
                        }}
                        className="btn-interactive px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-semibold shadow-2xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        Details
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expanded Modal/Card for Selected Run */}
      {selectedItem && (
        <div className="bg-[#0B0F19] text-slate-100 rounded-2xl p-5 sm:p-6 shadow-xl border border-slate-800/80 space-y-4 animate-fade-in">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800/80">
            <div>
              <span className="text-[10px] text-indigo-400 uppercase tracking-widest font-bold">
                Archived Recommendation Snapshot
              </span>
              <h4 className="text-base font-extrabold text-white mt-0.5 tracking-tight">
                {selectedItem.topStackTitle} ({selectedItem.matchScore}% Compatibility)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition text-xs cursor-pointer focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Date & Semester</span>
              <span className="font-mono text-slate-200 font-semibold">
                {selectedItem.runDate} • Semester {selectedItem.semesterRecorded}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Primary Target Role</span>
              <span className="text-slate-200 font-semibold">{selectedItem.targetRole}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px] font-medium">Key Attribution Driver</span>
              <span className="text-emerald-400 font-semibold">{selectedItem.keyFactor}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-slate-400 block text-[11px] font-medium mb-1.5">Technologies In Stack:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.technologiesSummary.map((t: string) => (
                <span
                  key={t}
                  className="bg-slate-800/80 text-indigo-300 px-2.5 py-0.5 rounded-lg text-[11px] font-mono font-medium border border-slate-700/80"
                >
                  {t}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
