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
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<'MATCH' | 'PREP' | 'RANK'>('MATCH');
  const [activeStackId, setActiveStackId] = useState<string>(
    recommendations[0]?.id ?? 'rec-001'
  );
  const [savedStackIds, setSavedStackIds] = useState<string[]>([]);
  const [savedFeedback, setSavedFeedback] = useState<string | null>(null);
  const [isCopiedRoadmap, setIsCopiedRoadmap] = useState(false);
  const [showShapInline, setShowShapInline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'DETAILS' | 'ROADMAP'>('DETAILS');

  const categories = ['All', 'Full-Stack Web', 'AI / ML', 'IoT'];

  const filtered = recommendations
    .filter((r) => {
      const matchCat =
        selectedCategory === 'All' ||
        r.category.toLowerCase().includes(selectedCategory.toLowerCase());
      const query = searchKeyword.toLowerCase();
      const matchSearch =
        !query ||
        r.title.toLowerCase().includes(query) ||
        r.whyRecommendedSnippet.toLowerCase().includes(query) ||
        r.technologies.some((t) => t.name.toLowerCase().includes(query)) ||
        r.targetRoles.some((role) => role.toLowerCase().includes(query));
      return matchCat && matchSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'MATCH') return b.matchScore - a.matchScore;
      if (sortBy === 'PREP') return a.estimatedTimeToLearn.localeCompare(b.estimatedTimeToLearn);
      return a.rank - b.rank;
    });

  const currentStack =
    recommendations.find((r) => r.id === activeStackId) ?? filtered[0] ?? recommendations[0];

  const handleBookmark = async (stack: RecommendationItem) => {
    if (!savedStackIds.includes(stack.id)) {
      await onSaveToHistory(stack);
      setSavedStackIds((prev) => [...prev, stack.id]);
      setSavedFeedback(`"${stack.title.split('(')[0]}" saved to your Career History!`);
      setTimeout(() => setSavedFeedback(null), 3000);
    }
  };

  const handleCopyRoadmap = () => {
    if (!currentStack || !currentStack.roadmap) return;
    const text = currentStack.roadmap
      .map((r, i) => `${i + 1}. [${r.duration}] ${r.title} - ${r.topics.join(', ')} (Resource: ${r.recommendedResource})`)
      .join('\n\n');
    navigator.clipboard.writeText(`Learning Roadmap for ${currentStack.title}:\n\n${text}`);
    setIsCopiedRoadmap(true);
    setTimeout(() => setIsCopiedRoadmap(false), 2500);
  };

  const handleSelectStack = (stack: RecommendationItem) => {
    setActiveStackId(stack.id);
    onSelectStackForExplanation(stack.id);
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top Filter and Info Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 card-hover-lift">
        <div>
          <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
            Machine Learning Inference
          </span>
          <h2 className="text-base sm:text-lg font-extrabold text-slate-900 mt-0.5 tracking-tight">
            Ranked Tech-Stack Recommendations
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 font-normal leading-normal">
            Computed by Random Forest classifier using verified ERP academic metrics + declared skills.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Live Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search tech, stack, or role..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-56 transition-all duration-150"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Sort selector */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition"
          >
            <option value="MATCH">Sort: Highest Match</option>
            <option value="RANK">Sort: Default Rank</option>
            <option value="PREP">Sort: Fast Prep Time</option>
          </select>

          {/* Compare Button */}
          <button
            type="button"
            onClick={() => onNavigate('compare')}
            className="btn-interactive px-3.5 py-1.5 bg-[#0B0F19] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            <svg className="w-3.5 h-3.5 text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Compare Matrix
          </button>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedCategory === cat
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Save Feedback Banner */}
      {savedFeedback && (
        <div className="bg-emerald-50/90 border border-emerald-300 text-emerald-800 text-xs px-4 py-3 rounded-2xl flex items-center justify-between shadow-xs animate-fade-in">
          <span className="flex items-center gap-2.5 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            {savedFeedback}
          </span>
          <button
            type="button"
            onClick={() => onNavigate('history')}
            className="text-xs text-emerald-700 font-bold hover:text-emerald-900 cursor-pointer underline underline-offset-2"
          >
            View History →
          </button>
        </div>
      )}

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Stack Cards List (col-span-5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-widest px-1">
            <span>{filtered.length} Evaluated Recommendations</span>
            {searchKeyword && (
              <span className="text-[11px] text-indigo-600 lowercase font-normal">
                filtered by "{searchKeyword}"
              </span>
            )}
          </div>

          <div className="space-y-3.5">
            {filtered.map((item) => {
              const isSelected = item.id === activeStackId;
              const isSaved = savedStackIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => handleSelectStack(item)}
                  className={`p-5 rounded-2xl border transition-all duration-200 cursor-pointer card-hover-lift ${
                    isSelected
                      ? 'border-indigo-600 bg-white shadow-md ring-2 ring-indigo-500/20'
                      : 'border-slate-200/90 bg-white hover:border-slate-300 shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Rank #{item.rank} • {item.category}
                    </span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-emerald-50 text-emerald-700 border border-emerald-200 shadow-2xs">
                      {item.matchScore}% Match
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5 tracking-tight">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                    {item.whyRecommendedSnippet}
                  </p>

                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Prep Time: <strong className="text-slate-800 font-semibold">{item.estimatedTimeToLearn}</strong>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleBookmark(item);
                      }}
                      className={`btn-interactive px-3 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        isSaved
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
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
            <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div>
                  <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                    Selected Technical Stack
                  </span>
                  <h3 className="text-xl font-extrabold text-slate-900 mt-0.5 tracking-tight">{currentStack.title}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-normal">
                    Difficulty: <strong className="text-slate-800 font-semibold">{currentStack.difficulty}</strong> •
                    Estimated Preparation: <strong className="text-slate-800 font-semibold">{currentStack.estimatedTimeToLearn}</strong>
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <div className="bg-slate-100/90 p-1 rounded-xl flex items-center text-xs border border-slate-200/60">
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('DETAILS')}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        activeSubTab === 'DETAILS'
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Stack Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSubTab('ROADMAP')}
                      className={`px-3 py-1 rounded-lg font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                        activeSubTab === 'ROADMAP'
                          ? 'bg-white text-indigo-700 shadow-xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Learning Roadmap
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowShapInline((prev) => !prev)}
                    className="btn-interactive px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    {showShapInline ? 'Hide SHAP' : 'Show SHAP'}
                  </button>
                </div>
              </div>

              {activeSubTab === 'DETAILS' ? (
                <>
                  {/* Target Industry Roles */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Target Industry Roles:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {currentStack.targetRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold border border-slate-200/80"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Technologies Included */}
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Core Technologies & Tools:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {currentStack.technologies.map((t) => (
                        <TechStackBadge key={t.name} name={t.name} category={t.category} />
                      ))}
                    </div>
                  </div>

                  {/* AI Recommendation Context */}
                  <div className="bg-slate-50/80 border border-slate-200/90 rounded-2xl p-4.5 text-xs text-slate-700">
                    <span className="font-bold text-slate-900 block mb-1 tracking-tight">
                      Why this stack was prioritized:
                    </span>
                    <p className="leading-relaxed text-slate-600 font-normal">
                      {currentStack.whyRecommendedSnippet}
                    </p>
                  </div>
                </>
              ) : (
                /* Learning Roadmap View */
                <div className="space-y-4 pt-1">
                  <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Curriculum & Milestone Execution Pathway</span>
                    <div className="flex items-center gap-2">
                      <span className="text-indigo-600 font-mono font-semibold">{currentStack.estimatedTimeToLearn}</span>
                      <button
                        type="button"
                        onClick={handleCopyRoadmap}
                        className="btn-interactive px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow-2xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                      >
                        {isCopiedRoadmap ? (
                          <>
                            <span className="text-emerald-600 font-bold">✓ Copied</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copy Plan
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(currentStack.roadmap || []).map((step, idx) => (
                      <div
                        key={step.phase}
                        className="p-4 rounded-xl border border-slate-200/90 bg-slate-50/70 space-y-2 card-hover-lift"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-indigo-700">
                            Step {idx + 1}: {step.phase}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full font-mono font-semibold bg-indigo-100 text-indigo-800 text-[11px]">
                            {step.duration}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-900 tracking-tight">{step.title}</h4>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {step.topics.map((topic) => (
                            <span
                              key={topic}
                              className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md text-[11px] font-medium shadow-2xs"
                            >
                              • {topic}
                            </span>
                          ))}
                        </div>
                        <p className="text-[11px] text-slate-500 pt-1">
                          <strong className="text-slate-700">Resource:</strong> {step.recommendedResource}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Jumps */}
              <div className="flex items-center justify-between pt-3.5 border-t border-slate-100 text-xs">
                <button
                  type="button"
                  onClick={() => onNavigate('compare')}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  ⇄ Compare with #2 Stack →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className="font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer transition-colors"
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
