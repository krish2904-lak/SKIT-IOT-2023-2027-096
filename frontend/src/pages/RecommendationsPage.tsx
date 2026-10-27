import React, { useState } from 'react';
import type { RecommendationItem, StackExplanation, DashboardTab } from '../types';
import { TechStackBadge } from '../components/common/TechStackBadge';

interface RecommendationsPageProps {
  recommendations: RecommendationItem[];
  explanation: StackExplanation | null;
  onSelectStackForExplanation: (stackId: string) => void;
  onNavigate: (tab: DashboardTab) => void;
}

export const RecommendationsPage: React.FC<RecommendationsPageProps> = ({
  recommendations,
  explanation,
  onSelectStackForExplanation,
  onNavigate,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [sortBy, setSortBy] = useState<'MATCH' | 'PREP' | 'RANK'>('MATCH');
  const [activeStackId, setActiveStackId] = useState<string>(recommendations[0]?.id ?? '');
  const [isCopiedRoadmap, setIsCopiedRoadmap] = useState(false);
  const [showExplanationInline, setShowExplanationInline] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'DETAILS' | 'ROADMAP'>('DETAILS');

  const categories = ['All', 'Full-Stack Web', 'AI / ML', 'IoT'];
  const selectedStackId = recommendations.some((item) => item.id === activeStackId)
    ? activeStackId
    : recommendations[0]?.id ?? '';

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
      if (sortBy === 'MATCH') return b.modelScore - a.modelScore;
      if (sortBy === 'PREP') return a.estimatedTimeToLearn.localeCompare(b.estimatedTimeToLearn);
      return a.rank - b.rank;
    });

  const currentStack =
    recommendations.find((r) => r.id === selectedStackId) ?? filtered[0] ?? recommendations[0];

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
            Model-generated recommendations based on the profile and trusted academic data available.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Search input */}
          <div className="relative">
            <input
              type="text"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              placeholder="Search tech, stack, or role..."
              className="pl-7 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 w-44 sm:w-52 transition"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2"
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
            className="px-2.5 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
          >
            <option value="MATCH">Sort: Highest model score</option>
            <option value="RANK">Sort: Default Rank</option>
            <option value="PREP">Sort: Fast Prep Time</option>
          </select>

          {/* Compare Button */}
          <button
            type="button"
            onClick={() => onNavigate('compare')}
            className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            Compare Matrix
          </button>

          {/* Category Filters */}
          <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-0.5 rounded-lg">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
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
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <span>{filtered.length} Evaluated Recommendations</span>
            {searchKeyword && (
              <span className="text-[11px] text-blue-600 lowercase font-normal">
                filtered by "{searchKeyword}"
              </span>
            )}
          </div>

          <div className="space-y-3">
            {filtered.length === 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-slate-600">
                No recommendations are available for these filters. Submit your profile inputs to generate recommendations.
              </div>
            )}
            {filtered.map((item) => {
              const isSelected = item.id === selectedStackId;

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
                      Model score: {item.modelScore}/100
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 mb-1.5">{item.title}</h3>
                  <p className="text-xs text-slate-500 line-clamp-2 mb-3">
                    {item.whyRecommendedSnippet}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                    <span className="text-slate-500">
                      Catalog estimate: <strong className="text-slate-700">{item.estimatedTimeToLearn}</strong>
                    </span>

                    <span className="text-[11px] text-slate-500">Saved to history automatically</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Selected Recommendation Details */}
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
                    Catalog estimate: <strong className="text-slate-800">{currentStack.estimatedTimeToLearn}</strong>
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
                    onClick={() => setShowExplanationInline((prev) => !prev)}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition cursor-pointer"
                  >
                    {showExplanationInline ? 'Hide explanation' : 'Show explanation'}
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
                    <span>Learning roadmap</span>
                    <div className="flex items-center gap-2">
                      <span className="text-blue-600 font-mono">{currentStack.estimatedTimeToLearn}</span>
                      <button
                        type="button"
                        onClick={handleCopyRoadmap}
                        className="px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 rounded-md border border-slate-200 text-[11px] font-medium transition cursor-pointer flex items-center gap-1 shadow-2xs"
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
                    {currentStack.roadmap && currentStack.roadmap.length > 0
                      ? currentStack.roadmap.map((step, idx) => (
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
                      ))
                      : (
                        <p className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
                          No roadmap was returned for this recommendation.
                        </p>
                      )}
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
                  ⇄ Compare recommendations →
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('history')}
                  className="font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
                >
                  View Recommendation History →
                </button>
              </div>
            </div>
          )}

          {showExplanationInline && explanation && currentStack && explanation.recommendationId === currentStack.id && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Model-provided explanation</h3>
                <p className="mt-1 text-xs text-slate-500">
                  The model score is uncalibrated and is not a probability or confidence estimate.
                </p>
                <p className="mt-3 text-sm text-slate-700">{explanation.summaryText}</p>
              </div>
              {[...explanation.topPositiveFactors, ...explanation.topNegativeFactors].length > 0 ? (
                <ul className="space-y-3">
                  {[...explanation.topPositiveFactors, ...explanation.topNegativeFactors].map((factor) => (
                    <li key={factor.featureName} className="border-t border-slate-100 pt-3">
                      <p className="text-sm font-semibold text-slate-900">
                        {factor.impactDirection === 'POSITIVE' ? 'Positive factor: ' : 'Negative factor: '}
                        {factor.displayName}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{factor.explanationNote}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-slate-500">The model did not provide feature-level factors.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
