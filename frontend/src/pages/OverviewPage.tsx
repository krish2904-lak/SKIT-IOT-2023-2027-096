import React from 'react';
import type { StudentProfile, RecommendationItem, DashboardTab } from '../types';
import { StatCard } from '../components/common/StatCard';
import { TechStackBadge } from '../components/common/TechStackBadge';

interface OverviewPageProps {
  student: StudentProfile | null;
  topRecommendation?: RecommendationItem;
  onNavigate: (tab: DashboardTab) => void;
  onTriggerRec: () => void;
  isLoadingRecs: boolean;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  student,
  topRecommendation,
  onNavigate,
  onTriggerRec,
  isLoadingRecs,
}) => {
  if (!student) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading student academic profile...
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-br from-[#0B0F19] via-[#131B2E] to-[#1E1B4B] text-white rounded-3xl p-6 sm:p-8 lg:p-10 shadow-lg relative overflow-hidden border border-slate-800/80">
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 left-1/3 w-80 h-80 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3.5 backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Institutional ERP Verified
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Welcome back, {student.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2.5 leading-relaxed font-normal">
            Your college ERP records (Semesters 1–5) and technical skills are synchronized. Our Random
            Forest ML model evaluates your profile against current industry tech stacks with explainable TreeSHAP metrics.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              type="button"
              onClick={() => onNavigate('profile-input')}
              className="btn-interactive px-4.5 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/25 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              Update Preferences & Skills
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recommendations')}
              className="btn-interactive px-4.5 py-2.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-medium transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
            >
              View Recommended Stacks →
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        <StatCard
          title="Cumulative GPA"
          value={`${student.cgpa.toFixed(2)} / 10`}
          subtitle="Verified via SKIT ERP"
          badge="Semesters 1-5"
          accentColor="emerald"
        />
        <StatCard
          title="Active Skills"
          value={`${student.skills.length} Recorded`}
          subtitle="ERP + Self + Resume"
          badge="Profile Ingested"
          accentColor="blue"
        />
        <StatCard
          title="Top Matched Stack"
          value={topRecommendation ? `${topRecommendation.matchScore}% Match` : '94% Match'}
          subtitle={topRecommendation?.title.split('(')[0] || 'Full-Stack Cloud'}
          badge="Random Forest"
          accentColor="indigo"
        />
        <StatCard
          title="Pipeline Status"
          value="Evaluated"
          subtitle="TreeSHAP Available"
          badge="Live Model"
          accentColor="amber"
        />
      </div>

      {/* Featured Recommendation Snippet & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Featured Recommendation */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Top AI Recommendation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5 tracking-tight">
                {topRecommendation?.title || 'Full-Stack Cloud Native (MERN + Docker)'}
              </h3>
            </div>
            <div className="sm:text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                {topRecommendation?.matchScore ?? 94}% Compatibility
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed font-normal">
            {topRecommendation?.whyRecommendedSnippet ||
              'High correlation with your A+ in Web Development Lab (95%) and declared interest in Cloud Systems.'}
          </p>

          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2.5">
              Integrated Technologies:
            </span>
            <div className="flex flex-wrap gap-2">
              {(topRecommendation?.technologies ?? []).map((t) => (
                <TechStackBadge key={t.name} name={t.name} category={t.category} />
              ))}
            </div>
          </div>

          <div className="pt-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Target Career Role:{' '}
              <strong className="text-slate-900 font-semibold">
                {topRecommendation?.targetRoles[0] || 'Cloud Solutions Associate'}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('explanation')}
                className="btn-interactive px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Why This Stack? (SHAP Factors) →
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & ERP Sync Snapshot */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs card-hover-lift">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Institutional ERP State
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Student Roll No:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {student.erpStudentId}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{student.branch}</span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-500">College:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[140px]" title={student.college}>
                  {student.college}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-slate-500">Last Synced:</span>
                <span className="font-semibold text-emerald-600">{student.lastErpSync}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('erp-profile')}
              className="btn-interactive w-full mt-4 py-2 px-3 bg-slate-50 hover:bg-slate-100/90 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Inspect Complete ERP Coursework →
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs card-hover-lift">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Model Control
            </h4>
            <p className="text-xs text-slate-500 mb-3.5 leading-relaxed">
              Re-run Random Forest inference using latest synced parameters.
            </p>
            <button
              type="button"
              onClick={onTriggerRec}
              disabled={isLoadingRecs}
              className="btn-interactive w-full py-2.5 px-3 bg-[#0B0F19] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              {isLoadingRecs ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin text-indigo-400" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Evaluating Model...
                </>
              ) : (
                'Run Recommendation Engine'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* NEW SECTION: Career Pathway Competency Radar & Academic Milestones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Competency Distribution */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Skills Ingestion & Matching
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">
                Domain Competency Alignment
              </h4>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              88% Average Fit
            </span>
          </div>

          <div className="space-y-4 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Full-Stack Web & Cloud Systems</span>
                <span className="font-mono font-bold text-indigo-600">94%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-2 rounded-full transition-all duration-700 w-[94%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Cloud Architecture & DevOps Containerization</span>
                <span className="font-mono font-bold text-blue-600">89%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-2 rounded-full transition-all duration-700 w-[89%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">IoT & Microcontroller Systems (SKIT Specialization)</span>
                <span className="font-mono font-bold text-teal-600">82%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-teal-500 to-emerald-500 h-2 rounded-full transition-all duration-700 w-[82%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800">Applied Artificial Intelligence & Data Pipelines</span>
                <span className="font-mono font-bold text-purple-600">76%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700 w-[76%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time System & Verification Timeline */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift space-y-4">
          <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Audit Trail
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">
                Institutional Milestones & Execution
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono font-medium">v2.4 Live</span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">SKIT ERP Academic Records Synchronized</div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  Semesters 1 to 5 coursework, lab marks, and 8.42 CGPA ingested.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Random Forest Classifier Inference Done</div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  Ranked 4 high-demand career pathways with TreeSHAP factor calculation.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-cyan-100 text-cyan-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-2xs">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Milestone Roadmap Generated</div>
                <div className="text-[11px] text-slate-500 leading-normal">
                  Step-by-step curriculum with recommended resource links mapped.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
