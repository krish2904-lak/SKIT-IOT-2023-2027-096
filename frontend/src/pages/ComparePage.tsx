import React, { useState } from 'react';
import type { RecommendationItem, DashboardTab } from '../types';
import { TechStackBadge } from '../components/common/TechStackBadge';

interface ComparePageProps {
  recommendations: RecommendationItem[];
  onNavigate: (tab: DashboardTab) => void;
  onSelectStackForExplanation: (stackId: string) => void;
}

export const ComparePage: React.FC<ComparePageProps> = ({
  recommendations,
  onNavigate,
  onSelectStackForExplanation,
}) => {
  const [stackAId, setStackAId] = useState<string>(recommendations[0]?.id ?? 'rec-001');
  const [stackBId, setStackBId] = useState<string>(recommendations[1]?.id ?? 'rec-002');

  const stackA = recommendations.find((r) => r.id === stackAId) ?? recommendations[0];
  const stackB = recommendations.find((r) => r.id === stackBId) ?? recommendations[1];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
            Decision Matrix & Trade-Off Analysis
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">
            Side-by-Side Tech-Stack Comparison
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Compare target technologies, learning duration, and ERP coursework alignment to make an informed choice.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onNavigate('recommendations')}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
          >
            ← Back to Recommendations
          </button>
        </div>
      </div>

      {/* Selector Toolbar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-900 text-white p-6 rounded-2xl shadow-sm">
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Select Primary Pathway (Option A):
          </label>
          <select
            value={stackAId}
            onChange={(e) => setStackAId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-blue-500 cursor-pointer"
          >
            {recommendations.map((r) => (
              <option key={r.id} value={r.id}>
                #{r.rank} {r.title} ({r.matchScore}% Match)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-2">
            Select Alternative Pathway (Option B):
          </label>
          <select
            value={stackBId}
            onChange={(e) => setStackBId(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-semibold text-white focus:outline-indigo-500 cursor-pointer"
          >
            {recommendations.map((r) => (
              <option key={r.id} value={r.id} disabled={r.id === stackAId}>
                #{r.rank} {r.title} ({r.matchScore}% Match)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Side-by-Side Comparison Matrix */}
      {stackA && stackB && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card A */}
          <div className="bg-white rounded-2xl border-2 border-blue-500/40 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                Option A (Rank #{stackA.rank})
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-blue-50 text-blue-700 border border-blue-200">
                {stackA.matchScore}% Compatibility
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{stackA.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{stackA.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Difficulty</span>
                <span className="font-bold text-slate-800">{stackA.difficulty}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Preparation Time</span>
                <span className="font-bold text-slate-800 font-mono">{stackA.estimatedTimeToLearn}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Technologies In Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {stackA.technologies.map((t) => (
                  <TechStackBadge key={t.name} name={t.name} category={t.category} />
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Target Roles:</span>
              <div className="flex flex-wrap gap-1.5">
                {stackA.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 text-xs text-blue-950">
              <span className="font-semibold block mb-1">Model Reasoning:</span>
              <p className="leading-relaxed">{stackA.whyRecommendedSnippet}</p>
            </div>

            <button
              type="button"
              onClick={() => onSelectStackForExplanation(stackA.id)}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Inspect Option A SHAP Factors →
            </button>
          </div>

          {/* Card B */}
          <div className="bg-white rounded-2xl border-2 border-indigo-500/40 p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Option B (Rank #{stackB.rank})
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-indigo-50 text-indigo-700 border border-indigo-200">
                {stackB.matchScore}% Compatibility
              </span>
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{stackB.title}</h3>
              <p className="text-xs text-slate-500 mt-1">{stackB.category}</p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Difficulty</span>
                <span className="font-bold text-slate-800">{stackB.difficulty}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-slate-400 block text-[11px]">Preparation Time</span>
                <span className="font-bold text-slate-800 font-mono">{stackB.estimatedTimeToLearn}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Technologies In Stack:</span>
              <div className="flex flex-wrap gap-1.5">
                {stackB.technologies.map((t) => (
                  <TechStackBadge key={t.name} name={t.name} category={t.category} />
                ))}
              </div>
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-600 block mb-2">Target Roles:</span>
              <div className="flex flex-wrap gap-1.5">
                {stackB.targetRoles.map((role) => (
                  <span
                    key={role}
                    className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                  >
                    {role}
                  </span>
                ))}
              </div>
            </div>

            <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 text-xs text-indigo-950">
              <span className="font-semibold block mb-1">Model Reasoning:</span>
              <p className="leading-relaxed">{stackB.whyRecommendedSnippet}</p>
            </div>

            <button
              type="button"
              onClick={() => onSelectStackForExplanation(stackB.id)}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
            >
              Inspect Option B SHAP Factors →
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
