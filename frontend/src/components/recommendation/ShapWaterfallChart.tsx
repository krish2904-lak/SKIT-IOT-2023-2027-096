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

  // Maximum value for proportional width calculations
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

        {/* Prediction Equation Badge */}
        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-mono">
          <span className="text-slate-500">Base: {baseConfidence.toFixed(0)}%</span>
          <span className="text-slate-400">→</span>
          <span className="text-emerald-600 font-bold">+{ (finalScore - baseConfidence).toFixed(1) }%</span>
          <span className="text-slate-400">=</span>
          <span className="text-blue-700 font-bold">{finalScore.toFixed(0)}% Match</span>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 pt-1">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-emerald-500" />
          <span>Positive Impact (Increases match confidence)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-xs bg-amber-500" />
          <span>Negative / Gap Impact (Reduces match confidence)</span>
        </div>
      </div>

      {/* Waterfall / Horizontal Contribution Bars */}
      <div className="space-y-4 pt-2">
        {/* Positive Factors Section */}
        <div>
          <h4 className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Top Positive Drivers ({positiveFactors.length})
          </h4>
          <div className="space-y-2.5">
            {positiveFactors.map((factor) => {
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

                  {/* Horizontal Bar */}
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

        {/* Negative / Skill Gap Factors Section */}
        {negativeFactors.length > 0 && (
          <div className="pt-2">
            <h4 className="text-xs font-semibold text-amber-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              Negative Drivers & Skill Gaps ({negativeFactors.length})
            </h4>
            <div className="space-y-2.5">
              {negativeFactors.map((factor) => {
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
                        ? 'border-amber-500 bg-amber-50/50 shadow-xs'
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
                      <span className="font-mono font-bold text-amber-600">
                        {(factor.shapValue * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Horizontal Bar */}
                    <div className="w-full bg-slate-200/80 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-amber-500 h-2 rounded-full transition-all duration-500"
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
          Model Interpretability Takeaway:
        </div>
        <p className="leading-relaxed text-blue-900">
          The Random Forest algorithm placed the highest positive weights on your institutional
          coursework marks in <strong>Web Development Lab (Grade A+)</strong> and{' '}
          <strong>Database Management Systems</strong>, which aligned with your declared interest in
          Cloud Systems. Bridging the containerization skill gap will yield optimal role-readiness.
        </p>
      </div>
    </div>
  );
};
