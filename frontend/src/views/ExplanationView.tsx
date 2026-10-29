import React, { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import type { DashboardTab, StackExplanation } from '../types';

interface ExplanationViewProps {
  explanation: StackExplanation;
  onNavigate: (tab: DashboardTab) => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  explanation,
  onNavigate,
}) => {
  const [showEmptyState, setShowEmptyState] = useState(false);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* State Toggle for Reviewing Sprint 1 Low-Fi Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift">
        <div className="text-xs text-slate-600">
          <span className="font-bold text-slate-900">Sprint 1 State Preview:</span>{' '}
          Switch between empty-state and SHAP feature importance breakdown (Sprint 4 Interface).
        </div>
        <div className="flex items-center gap-1.5 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setShowEmptyState(false)}
            className={`btn-interactive px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              !showEmptyState
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            SHAP Breakdown
          </button>
          <button
            type="button"
            onClick={() => setShowEmptyState(true)}
            className={`btn-interactive px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
              showEmptyState
                ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Empty State
          </button>
        </div>
      </div>

      {showEmptyState ? (
        <EmptyState
          title="No Recommendation Selected for Explanation"
          description="Please select a recommended technology stack from the recommendations catalog to inspect its SHAP explainability breakdown."
          actionText="Browse Recommendations"
          onAction={() => onNavigate('recommendations')}
          secondaryText="Scheduled for SHAP library integration in Sprint 4"
        />
      ) : (
        <div className="space-y-6 sm:space-y-8">
          {/* Header Summary Banner */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
                  SHAP Explainability Report
                </span>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-0.5 tracking-tight">
                  {explanation.recommendationTitle}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-slate-500">Base Model Confidence:</span>
                <span className="text-sm font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-xl font-mono shadow-2xs">
                  {(explanation.baseConfidence * 100).toFixed(0)}%
                </span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed bg-slate-50/80 p-4 rounded-xl border border-slate-200/80 font-normal">
              <span className="font-bold text-slate-900">Model Interpretation: </span>
              {explanation.summaryText}
            </p>
          </div>

          {/* Two-Column Grid: Factors & Prerequisites */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: SHAP Factors */}
            <div className="lg:col-span-2 space-y-6">
              {/* Positive Factors */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Top Positive Influencing Factors (SHAP +Values)
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-mono">
                    Increased Fit
                  </span>
                </div>

                <div className="space-y-4">
                  {explanation.topPositiveFactors.map((factor) => (
                    <div key={factor.featureName} className="text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-800">{factor.displayName}</span>
                        <span className="font-mono font-bold text-emerald-600">
                          +{(factor.shapValue * 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* Bar Visualization */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, factor.shapValue * 200)}%` }}
                        ></div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-normal leading-normal">{factor.explanationNote}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Negative / Gap Factors */}
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift">
                <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2 tracking-tight">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Identified Gaps & Penalties (SHAP -Values)
                  </h3>
                  <span className="text-[11px] text-rose-700 font-bold bg-rose-50 px-2.5 py-0.5 rounded-full border border-rose-200 font-mono">
                    Learning Curve
                  </span>
                </div>

                <div className="space-y-4">
                  {explanation.topNegativeFactors.map((factor) => (
                    <div key={factor.featureName} className="text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-bold text-slate-800">{factor.displayName}</span>
                        <span className="font-mono font-bold text-rose-600">
                          {(factor.shapValue * 100).toFixed(1)}%
                        </span>
                      </div>

                      {/* Bar Visualization */}
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden mb-1.5">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-amber-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.abs(factor.shapValue) * 300)}%` }}
                        ></div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-normal leading-normal">{factor.explanationNote}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Col: Remedial Prerequisites & Navigation */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift">
                <h3 className="text-sm font-bold text-slate-900 mb-1 tracking-tight">
                  Bridging the Skill Gap
                </h3>
                <p className="text-xs text-slate-500 mb-4 font-normal leading-normal">
                  Recommended foundational topics to maximize your success in this stack:
                </p>

                <ul className="space-y-2.5 text-xs">
                  {explanation.learningPrerequisites.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-slate-700">
                      <span className="text-indigo-600 font-bold shrink-0">✓</span>
                      <span className="font-medium">{item}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate('recommendations')}
                    className="btn-interactive w-full py-2.5 bg-[#0B0F19] hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    ← Back to All Stacks
                  </button>
                </div>
              </div>

              <div className="bg-indigo-50/70 rounded-2xl border border-indigo-200/80 p-5 text-xs text-indigo-900 shadow-2xs">
                <div className="font-bold mb-1 tracking-tight text-slate-900">SDG 4: Quality Education</div>
                <p className="leading-relaxed text-indigo-800 text-[11px] font-normal">
                  By explaining recommendation factors through SHAP attribution, students
                  gain actionable insight into curriculum alignment and career readiness.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
