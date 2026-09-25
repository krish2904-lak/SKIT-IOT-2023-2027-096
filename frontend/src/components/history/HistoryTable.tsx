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
    <div className="space-y-6">
      {/* Overview Top Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900">
            Recommendation History & Career Trajectory
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Archived model inferences stored in MongoDB. Tracks how your stack recommendations
            evolve across academic semesters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">
            Total Saved Inferences: <strong className="text-slate-900">{history.length}</strong>
          </span>
        </div>
      </div>

      {/* History Table Container */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Inference Date</th>
                <th className="px-5 py-3">Semester</th>
                <th className="px-5 py-3">Top Recommended Stack</th>
                <th className="px-5 py-3">Match Score</th>
                <th className="px-5 py-3">Target Career Role</th>
                <th className="px-5 py-3">Primary Factor</th>
                <th className="px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {history.map((run) => (
                <tr
                  key={run.id}
                  onClick={() => setSelectedItem(selectedItem?.id === run.id ? null : run)}
                  className="hover:bg-slate-50/70 transition cursor-pointer"
                >
                  <td className="px-5 py-3.5 font-mono text-slate-600">
                    {run.runDate}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="inline-block px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                      Semester {run.semesterRecorded}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-slate-900">
                    {run.topStackTitle}
                    <div className="flex flex-wrap gap-1 mt-1">
                      {run.technologiesSummary.map((tech) => (
                        <span
                          key={tech}
                          className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      {run.matchScore}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-700 font-medium">
                    {run.targetRole}
                  </td>
                  <td className="px-5 py-3.5 text-slate-500 max-w-xs truncate" title={run.keyFactor}>
                    {run.keyFactor}
                  </td>
                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={(e) => handleCopyId(run.id, e)}
                      className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-[11px] font-medium transition"
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
                        className="px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition"
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
        <div className="bg-slate-900 text-slate-100 rounded-xl p-5 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div>
              <span className="text-[10px] text-blue-400 uppercase tracking-wider font-semibold">
                Archived Recommendation Snapshot
              </span>
              <h4 className="text-base font-bold text-white mt-0.5">
                {selectedItem.topStackTitle} ({selectedItem.matchScore}% Compatibility)
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setSelectedItem(null)}
              className="text-slate-400 hover:text-white p-1 text-xs"
            >
              ✕ Close
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Date & Semester</span>
              <span className="font-mono text-slate-200">
                {selectedItem.runDate} • Semester {selectedItem.semesterRecorded}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Primary Target Role</span>
              <span className="text-slate-200 font-medium">{selectedItem.targetRole}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Key Attribution Driver</span>
              <span className="text-emerald-400 font-medium">{selectedItem.keyFactor}</span>
            </div>
          </div>

          <div className="pt-2">
            <span className="text-slate-400 block text-[11px] mb-1">Technologies In Stack:</span>
            <div className="flex flex-wrap gap-1.5">
              {selectedItem.technologiesSummary.map((t) => (
                <span
                  key={t}
                  className="bg-slate-800 text-blue-300 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-700"
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
