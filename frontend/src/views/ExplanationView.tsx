import React from 'react';
import type { DashboardTab, StackExplanation } from '../types';

interface ExplanationViewProps {
  explanation: StackExplanation;
  onNavigate: (tab: DashboardTab) => void;
}

export const ExplanationView: React.FC<ExplanationViewProps> = ({
  explanation,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
        <div className="space-y-6">
          {/* Header Summary Banner */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                  Model Explanation
                </span>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {explanation.recommendationTitle}
                </h2>
              </div>
              <span className="text-xs font-medium text-slate-600">
                Uncalibrated model explanation — not a probability or confidence estimate.
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-4 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-200">
              <span className="font-semibold text-slate-800">Model Interpretation: </span>
              {explanation.summaryText}
            </p>
          </div>

          {/* Two-Column Grid: Factors & Prerequisites */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Cols: SHAP Factors */}
            <div className="lg:col-span-2 space-y-6">
              {/* Positive Factors */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    Positive Factors
                  </h3>
                  <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
                    Model signal
                  </span>
                </div>

                <div className="space-y-4">
                  {explanation.topPositiveFactors.length > 0
                    ? explanation.topPositiveFactors.map((factor) => (
                      <div key={factor.featureName} className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{factor.displayName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{factor.explanationNote}</p>
                      </div>
                    ))
                    : <p className="text-xs text-slate-500">No positive model factors were provided.</p>}
                </div>
              </div>

              {/* Negative / Gap Factors */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    Negative Factors
                  </h3>
                  <span className="text-[11px] text-rose-700 font-semibold bg-rose-50 px-2 py-0.5 rounded">
                    Model signal
                  </span>
                </div>

                <div className="space-y-4">
                  {explanation.topNegativeFactors.length > 0
                    ? explanation.topNegativeFactors.map((factor) => (
                      <div key={factor.featureName} className="text-xs">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-slate-800">{factor.displayName}</span>
                        </div>
                        <p className="text-[11px] text-slate-500">{factor.explanationNote}</p>
                      </div>
                    ))
                    : <p className="text-xs text-slate-500">No negative model factors were provided.</p>}
                </div>
              </div>
            </div>

            {/* Right Col: Remedial Prerequisites & Navigation */}
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                <h3 className="text-sm font-bold text-slate-900 mb-1">
                  Learning Prerequisites
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Model-catalog guidance; this is not a verified skills-gap assessment.
                </p>

                <ul className="space-y-2.5 text-xs">
                  {explanation.learningPrerequisites.length > 0
                    ? explanation.learningPrerequisites.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-700">
                        <span className="text-blue-600 font-bold">✓</span>
                        <span>{item}</span>
                      </li>
                    ))
                    : <li className="text-slate-500">No prerequisites were provided.</li>}
                </ul>

                <div className="mt-6 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => onNavigate('recommendations')}
                    className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs rounded-lg transition cursor-pointer"
                  >
                    ← Back to All Stacks
                  </button>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl border border-blue-100 p-5 text-xs text-blue-800">
                <div className="font-bold mb-1">About this explanation</div>
                <p className="leading-relaxed text-blue-700 text-[11px]">
                  Factors are provided by the configured recommendation model; they are not a guarantee of career fit.
                </p>
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};
