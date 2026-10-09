import React, { useState } from 'react';
import type { FeatureImpact } from '../../types';

interface ShapWaterfallChartProps {
  baseConfidence: number;
  finalScore: number;
  positiveFactors: FeatureImpact[];
  negativeFactors: FeatureImpact[];
  stackTitle: string;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({
  baseConfidence,
  finalScore,
  positiveFactors,
  negativeFactors,
  stackTitle,
}) => {
  const [activeFactor, setActiveFactor] = useState<FeatureImpact | null>(null);
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'ERP' | 'SKILLS' | 'GAPS'>('ALL');
  const [bridgedFeatures, setBridgedFeatures] = useState<string[]>([]);

  // Calculate potential score boost from simulated bridged gaps
  const boostSum = bridgedFeatures.reduce((acc, featName) => {
    const factor = negativeFactors.find((f) => f.featureName === featName);
    return acc + (factor?.potentialBoost ?? 3.5);
  }, 0);

  const simulatedScore = Math.min(99, Math.round(finalScore + boostSum));

  const toggleBridgeGap = (featureName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setBridgedFeatures((prev) =>
      prev.includes(featureName) ? prev.filter((f) => f !== featureName) : [...prev, featureName]
    );
  };

  const maxAbsValue = Math.max(
    ...positiveFactors.map((f) => Math.abs(f.shapValue)),
    ...negativeFactors.map((f) => Math.abs(f.shapValue)),
    0.2
  );

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'ERP_ACADEMICS':
        return { label: 'ERP Academic Data', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
      case 'STUDENT_INTEREST':
        return { label: 'Declared Interest', bg: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'EXISTING_SKILL':
        return { label: 'Self Skill Rating', bg: 'bg-purple-50 text-purple-700 border-purple-200' };
      default:
        return { label: 'Market Demand', bg: 'bg-slate-100 text-slate-700 border-slate-200' };
    }
  };

  const filteredPositive = positiveFactors.filter((f) => {
    if (filterCategory === 'ERP') return f.category === 'ERP_ACADEMICS';
    if (filterCategory === 'SKILLS') return f.category === 'EXISTING_SKILL' || f.category === 'STUDENT_INTEREST';
    if (filterCategory === 'GAPS') return false;
    return true;
  });

  const filteredNegative = negativeFactors.filter((f) => {
    if (filterCategory === 'ERP') return f.category === 'ERP_ACADEMICS';
    if (filterCategory === 'SKILLS') return f.category === 'EXISTING_SKILL';
    if (filterCategory === 'GAPS') return true;
    return true;
  });

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <h3 className="text-base font-bold text-slate-900">
              SHAP Feature Importance & Attribution
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            TreeSHAP explanation visualizing feature contributions toward{' '}
            <span className="font-semibold text-slate-800">{stackTitle}</span>.
          </p>
        </div>

        {/* Prediction Equation Badge with Simulated Score */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-500">Base: {(baseConfidence * 100).toFixed(0)}%</span>
          <span className="text-slate-400">→</span>
          <span className="text-blue-700 font-bold">{finalScore.toFixed(0)}% Match</span>
          {bridgedFeatures.length > 0 && (
            <span className="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[11px]">
              ↑ {simulatedScore}% (Simulated)
            </span>
          )}
        </div>
      </div>

      {/* Interactive Category Filter Pills */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {[
            { id: 'ALL', label: 'All Factors' },
            { id: 'ERP', label: 'ERP Coursework' },
            { id: 'SKILLS', label: 'Declared Skills' },
            { id: 'GAPS', label: 'Gap Remediation' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setFilterCategory(cat.id as any)}
              className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                filterCategory === cat.id
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500">
          Showing <strong className="text-slate-800">{filteredPositive.length + filteredNegative.length}</strong> mathematical parameters
        </div>
      </div>

      {/* Waterfall / Horizontal Contribution Bars */}
      <div className="space-y-4 pt-1">
        {/* Positive Factors Section */}
        {filteredPositive.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              Positive Drivers ({filteredPositive.length})
            </h4>
            <div className="space-y-2.5">
              {filteredPositive.map((factor) => {
                const widthPercent = Math.min(
                  100,
                  Math.round((Math.abs(factor.shapValue) / maxAbsValue) * 85) + 15
                );
                const cat = getCategoryBadge(factor.category);

                return (
                  <div
                    key={factor.featureName}
                    onMouseEnter={() => setActiveFactor(factor)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer ${
                      activeFactor?.featureName === factor.featureName
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{factor.displayName}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded font-medium border ${cat.bg}`}
                        >
                          {cat.label}
                        </span>
                      </div>
                      <span className="font-mono font-bold text-emerald-600">
                        +{(factor.shapValue * 100).toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 mt-1.5">{factor.explanationNote}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Negative / Skill Gap Factors Section */}
        {filteredNegative.length > 0 && (
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                Negative Drivers & Skill Gaps ({filteredNegative.length})
              </h4>
              <span className="text-[11px] text-slate-500">
                Click &apos;Simulate Bridge&apos; to view score projection
              </span>
            </div>

            <div className="space-y-2.5">
              {filteredNegative.map((factor) => {
                const widthPercent = Math.min(
                  100,
                  Math.round((Math.abs(factor.shapValue) / maxAbsValue) * 85) + 15
                );
                const cat = getCategoryBadge(factor.category);
                const isBridged = bridgedFeatures.includes(factor.featureName);

                return (
                  <div
                    key={factor.featureName}
                    onMouseEnter={() => setActiveFactor(factor)}
                    className={`p-3.5 rounded-xl border transition-all ${
                      isBridged
                        ? 'border-emerald-300 bg-emerald-50/40 ring-1 ring-emerald-300'
                        : 'border-amber-200 bg-amber-50/30'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900">{factor.displayName}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-medium border ${cat.bg}`}>
                          {cat.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-amber-700">
                          {(factor.shapValue * 100).toFixed(1)}% penalty
                        </span>
                        <button
                          type="button"
                          onClick={(e) => toggleBridgeGap(factor.featureName, e)}
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
                            isBridged
                              ? 'bg-emerald-600 text-white'
                              : 'bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 shadow-xs'
                          }`}
                        >
                          {isBridged ? '✓ Gap Bridged (+Boost)' : '+ Simulate Bridge'}
                        </button>
                      </div>
                    </div>

                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden mb-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isBridged ? 'bg-emerald-400' : 'bg-amber-500'
                        }`}
                        style={{ width: `${widthPercent}%` }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-600 mb-2">{factor.explanationNote}</p>

                    {factor.remedyElective && (
                      <div className="bg-white/80 border border-amber-200/80 rounded-lg p-2 flex items-center justify-between text-[11px]">
                        <span className="text-slate-700">
                          <strong>Recommended Remediation:</strong> {factor.remedyElective}
                        </span>
                        {factor.potentialBoost && (
                          <span className="text-emerald-700 font-mono font-bold shrink-0 ml-2">
                            +{factor.potentialBoost}% Match Boost
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* AI Recommendation Summary Box */}
      <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 text-xs text-blue-950">
        <div className="font-semibold mb-1 flex items-center gap-1.5">
          <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Academic Interpretability Verdict:
        </div>
        <p className="leading-relaxed text-blue-900">
          The Random Forest algorithm heavily rewarded your institutional performance in{' '}
          <strong>Web Development Lab (Grade A+)</strong> and <strong>Database Systems</strong>.
          {bridgedFeatures.length > 0 ? (
            <span className="block mt-1 text-emerald-800 font-semibold">
              With your {bridgedFeatures.length} simulated remedial electives completed, your projected compatibility rises to {simulatedScore}%.
            </span>
          ) : (
            ' Taking recommended containerization workshops bridges the top negative factor and elevates career readiness.'
          )}
        </p>
      </div>
    </div>
  );
};
