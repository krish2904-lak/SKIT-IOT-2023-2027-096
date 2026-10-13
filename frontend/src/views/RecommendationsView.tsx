import React, { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { TechStackBadge } from '../components/common/TechStackBadge';
import type { DashboardTab, RecommendationItem } from '../types';

interface RecommendationsViewProps {
  recommendations: RecommendationItem[];
  onNavigate: (tab: DashboardTab) => void;
}

export const RecommendationsView: React.FC<RecommendationsViewProps> = ({
  recommendations,
  onNavigate,
}) => {
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('All');

  const filteredRecs =
    selectedFilter === 'All'
      ? recommendations
      : recommendations.filter((r) =>
          r.category.toLowerCase().includes(selectedFilter.toLowerCase())
        );

  return (
    <div className="space-y-6">
      {/* State Toggle for Reviewing Sprint 1 Low-Fi Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-lg border border-slate-200">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Sprint 1 State Preview:</span>{' '}
          Switch between empty-state and populated recommendation cards (Sprint 3 Interface).
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmptyState(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              !showEmptyState
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recommendation Cards
          </button>
          <button
            type="button"
            onClick={() => setShowEmptyState(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              showEmptyState
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Empty State
          </button>
        </div>
      </div>

      {showEmptyState ? (
        <EmptyState
          title="No Tech-Stack Recommendations Generated"
          description="The AI recommendation engine has not processed your academic record yet. Fill out your profile skills and submit the questionnaire to trigger recommendations."
          actionText="Go to Profile & Inputs"
          onAction={() => onNavigate('profile-input')}
          secondaryText="Scheduled for Random Forest model binding in Sprint 3"
        />
      ) : (
        <div className="space-y-5">
          {/* Category Filter Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {['All', 'Web', 'IoT', 'AI'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedFilter(category)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                    selectedFilter === category
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {category === 'All' ? 'All Stacks' : `${category} Track`}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-400">
              Showing <span className="font-semibold text-slate-700">{filteredRecs.length}</span> recommended stacks
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredRecs.map((rec) => (
              <div
                key={rec.id}
                className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-lg bg-blue-50 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                      #{rec.rank}
                    </span>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-tight">
                        {rec.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">{rec.category}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                      Difficulty: {rec.difficulty}
                    </span>
                    <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      {rec.matchScore}% Match
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                  {rec.whyRecommendedSnippet}
                </p>

                {/* Tech Components */}
                <div className="mt-4">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Included Core Tools:
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rec.technologies.map((t) => (
                      <TechStackBadge key={t.name} name={t.name} category={t.category} />
                    ))}
                  </div>
                </div>

                {/* Target Career Roles & Action Footer */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    <span className="font-medium text-slate-700">Target Roles:</span>{' '}
                    {rec.targetRoles.join(', ')}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onNavigate('explanation')}
                      className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 text-xs font-semibold rounded-lg transition cursor-pointer"
                    >
                      Why this recommendation? (SHAP) →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
