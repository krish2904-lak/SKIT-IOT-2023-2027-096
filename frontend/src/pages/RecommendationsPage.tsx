import React, { useState } from 'react';
import type { RecommendationItem, StackExplanation, DashboardTab } from '../types';
import { TechStackBadge } from '../components/common/TechStackBadge';
import { ShapWaterfallChart } from '../components/recommendation/ShapWaterfallChart';

interface RecommendationsPageProps {
  recommendations: RecommendationItem[];
  explanation: StackExplanation | null;
  onSelectStackForExplanation: (stackId: string) => void;
  onSaveToHistory: (stack: RecommendationItem) => Promise<void>;
  onNavigate: (tab: DashboardTab) => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  recommendations,
  explanation,
  onSelectStackForExplanation,
  onSaveToHistory,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeStackId, setActiveStackId] = useState<string>(
    recommendations[0]?.id ?? 'rec-001'
  );
  const [savedStackIds, setSavedStackIds] = useState<string[]>([]);
  const [showShapInline, setShowShapInline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'DETAILS' | 'ROADMAP'>('DETAILS');

  const categories = ['All', 'Full-Stack Web', 'AI / ML', 'IoT'];

  const filtered =
    selectedCategory === 'All'
      ? recommendations
      : recommendations.filter((r) => r.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const currentStack =
    recommendations.find((r) => r.id === activeStackId) ?? recommendations[0];

  const handleBookmark = async (stack: RecommendationItem) => {
    if (!savedStackIds.includes(stack.id)) {
      await onSaveToHistory(stack);
      setSavedStackIds((prev) => [...prev, stack.id]);
    }
  };

  const handleSelectStack = (stack: RecommendationItem) => {
    setActiveStackId(stack.id);
    onSelectStackForExplanation(stack.id);
  };

  return (
    <div className="space-y-6">
      {/* Top Filter and Info Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
            Machine Learning Inference
          </span>
          <h2 className="text-base font-bold text-slate-900 mt-0.5">
            Ranked Tech-Stack Recommendations
          </h2>
          <p className="text-xs text-slate-500">
            Computed by Random Forest classifier using verified ERP academic metrics + declared skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Compare Button */}
          <button
            type="button"
            onClick={() => onNavigate('compare')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Compare Stacks Matrix
          </button>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stack Cards List (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            {filtered.length} Evaluated Recommendations
          </div>

          <div className="space-y-3">
            {filtered.map((item) => {
              const isSelected = item.id === activeStackId;
              const isSaved = savedStackIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectStack(item)}
                  className={`p-5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-blue-600 bg-white shadow-sm ring-1 ring-blue-600'
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Rank #{item.rank} • {item.category}
                    </span>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {item.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.whyRecommendedSnippet}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Prep Time: <strong className="text-slate-700">{item.estimatedTimeToLearn}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(item);
                      }}
                      className={`px-2.5 py-1 rounded text-[11px] font-medium transition cursor-pointer ${
                        isSaved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                      }`}
                    >
                      {isSaved ? '✓ Saved' : '+ Save to History'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Stack Detail & Learning Roadmap & SHAP (col-span-7) */}
        <div className="lg:col-span-7 space-y-6">
          {currentStack && (
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                    Selected Technical Stack
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-0.5">{currentStack.title}</h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Difficulty: <strong className="text-slate-800">{currentStack.difficulty}</strong> •
                    Estimated Preparation: <strong className="text-slate-800">{currentStack.estimatedTimeToLearn}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <div className="bg-slate-100 p-1 rounded-lg flex items-center text-xs">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('DETAILS')}
                      className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                        activeSubTab === 'DETAILS'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      Stack Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('ROADMAP')}
                      className={`px-3 py-1 rounded-md font-medium transition cursor-pointer ${
                        activeSubTab === 'ROADMAP'
                          ? 'bg-white text-slate-900 shadow-xs font-semibold'
                          : 'text-slate-600'
                      }`}
                    >
                      Learning Roadmap
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowShapInline((prev) => !prev)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition cursor-pointer"
                  >
                    {showShapInline ? 'Hide SHAP' : 'Show SHAP'}
                  </button>
                </div>
              </div>

              {activeSubTab === 'DETAILS' ? (
                <>
                  {/* Target Industry Roles */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
                      Target Industry Roles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentStack.targetRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md text-xs font-medium border border-slate-200"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Technologies Included */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                      Core Technologies & Tools:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentStack.technologies.map((t) => (
                        <TechStackBadge key={t.name} name={t.name} category={t.category} />
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendation Context */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-700">
                    <span className="font-semibold text-slate-900 block mb-1">
                      Why this stack was prioritized:
                    </span>
                    <p className="leading-relaxed text-slate-600">
                      {currentStack.whyRecommendedSnippet}
                    </p>
                  </div>
                </>
              ) : (
                /* NEW FEATURE: Learning Roadmap View */
                <div className="space-y-4 pt-1">
                  <div className="text-xs font-semibold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Curriculum & Milestone Execution Pathway</span>
                    <span className="text-blue-600 font-mono">{currentStack.estimatedTimeToLearn}</span>
                  </div>

                  <div className="space-y-3">
                    {(currentStack.roadmap || []).map((step, idx) => (
                      <div
                        key={step.phase}
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-blue-700">
                            Step {idx + 1}: {step.phase}
                          </span>
                          <span className="px-2 py-0.5 rounded font-mono font-medium bg-blue-100 text-blue-800 text-[11px]">
                            {step.duration}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{step.title}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {step.topics.map((topic) => (
                            <span
                              key={topic}
                              className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px]"
                            >
                              • {topic}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1">
                          <strong>Resource:</strong> {step.recommendedResource}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Jumps */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('compare')}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer"
                >
                  ⇄ Compare with #2 Stack →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View Saved History →
                </button>
              </div>
            </div>
          )}

          {/* Embedded SHAP Visual Feature Importance Chart */}
          {showShapInline && explanation && currentStack && (
            <ShapWaterfallChart
              baseConfidence={explanation.baseConfidence}
              finalScore={currentStack.matchScore}
              positiveFactors={explanation.topPositiveFactors}
              negativeFactors={explanation.topNegativeFactors}
              stackTitle={currentStack.title}
            />
          )}
        </div>
      </div>
    </div>
  );
};
