import React from 'react';
import { StatCard } from '../components/common/StatCard';
import { TechStackBadge } from '../components/common/TechStackBadge';
import type { DashboardTab, StudentProfile, RecommendationItem } from '../types';

interface OverviewViewProps {
  student: StudentProfile;
  topRecommendation: RecommendationItem;
  onNavigate: (tab: DashboardTab) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  student,
  topRecommendation,
  onNavigate,
}) => {
  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-slate-900 text-white rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full text-xs font-medium text-blue-200 backdrop-blur-xs mb-2">
            <span>🎓 Academic Session 2026</span>
            <span>•</span>
            <span>SKIT IoT Department</span>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Welcome back, {student.name}
          </h2>
          <p className="text-sm text-blue-100 max-w-2xl mt-1 leading-relaxed">
            Your profile is synchronized with college ERP. Our AI model has evaluated your
            academic coursework and interests to recommend tailored technology stacks.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onNavigate('profile-input')}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition cursor-pointer"
          >
            Review ERP Data
          </button>
          <button
            type="button"
            onClick={() => onNavigate('recommendations')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white text-xs font-semibold rounded-lg shadow-sm transition cursor-pointer"
          >
            View Recommendations
          </button>
        </div>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current CGPA"
          value={student.cgpa.toFixed(2)}
          subtitle="Synced via SKIT ERP"
          badge="Verified"
          accentColor="blue"
        />
        <StatCard
          title="Profile Skills"
          value={student.skills.length}
          subtitle="ERP & self-reported items"
          badge="7 Active"
          accentColor="emerald"
        />
        <StatCard
          title="Top Recommendation"
          value={`${topRecommendation.matchScore}%`}
          subtitle={topRecommendation.title}
          badge="Rank #1"
          accentColor="indigo"
        />
        <StatCard
          title="Model Confidence"
          value="High"
          subtitle="Random Forest + SHAP verified"
          badge="Sprint 3/4"
          accentColor="amber"
        />
      </div>

      {/* Two-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Recommendation Highlight Card */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                Featured Tech Stack
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {topRecommendation.title}
              </h3>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                {topRecommendation.matchScore}% Match
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-600 mt-4 leading-relaxed">
            {topRecommendation.whyRecommendedSnippet}
          </p>

          <div className="mt-5">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
              Stack Architecture & Tools:
            </h4>
            <div className="flex flex-wrap gap-2">
              {topRecommendation.technologies.map((tech) => (
                <TechStackBadge
                  key={tech.name}
                  name={tech.name}
                  category={tech.category}
                />
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Estimated Mastery Curve: <span className="font-semibold text-slate-700">{topRecommendation.estimatedTimeToLearn}</span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => onNavigate('explanation')}
                className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer"
              >
                Inspect SHAP Factors
              </button>
              <button
                type="button"
                onClick={() => onNavigate('recommendations')}
                className="flex-1 sm:flex-none px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition cursor-pointer"
              >
                Explore All Stacks →
              </button>
            </div>
          </div>
        </div>

        {/* Academic & ERP Summary Widget */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">ERP Student Identity</h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                Sem {student.semester}
              </span>
            </div>

            <dl className="mt-4 space-y-3 text-xs">
              <div>
                <dt className="text-slate-400 font-medium">Roll / ERP ID</dt>
                <dd className="font-semibold text-slate-800 font-mono mt-0.5">
                  {student.erpStudentId}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Department</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">{student.branch}</dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Section & Batch</dt>
                <dd className="font-semibold text-slate-800 mt-0.5">
                  {student.section} ({student.academicYear})
                </dd>
              </div>
              <div>
                <dt className="text-slate-400 font-medium">Resume Upload Status</dt>
                <dd className="font-semibold text-emerald-700 flex items-center gap-1 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  {student.resumeFileName || 'Uploaded'}
                </dd>
              </div>
            </dl>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => onNavigate('profile-input')}
              className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-medium text-xs rounded-lg transition cursor-pointer"
            >
              Update Skills & Preferences
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
