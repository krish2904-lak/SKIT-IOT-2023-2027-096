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
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ERP Integration Active
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Welcome back, {student.name}!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Your college ERP records (Semesters 1–5) and technical skills are synced. Our Random
            Forest ML model evaluates your profile against current industry tech stacks.
          </p>

          <div className="flex flex-wrap items-center gap-3 mt-5">
            <button
              type="button"
              onClick={() => onNavigate('profile-input')}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Update Preferences & Skills
            </button>
            <button
              type="button"
              onClick={() => onNavigate('recommendations')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              View Recommended Stacks
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Top AI Recommendation
              </span>
              <h3 className="text-lg font-bold text-slate-900 mt-0.5">
                {topRecommendation?.title || 'Full-Stack Cloud Native (MERN + Docker)'}
              </h3>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                {topRecommendation?.matchScore ?? 94}% Compatibility
              </span>
            </div>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {topRecommendation?.whyRecommendedSnippet ||
              'High correlation with your A+ in Web Development Lab (95%) and declared interest in Cloud Systems.'}
          </p>

          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
              Integrated Technologies:
            </span>
            <div className="flex flex-wrap gap-2">
              {(topRecommendation?.technologies ?? []).map((t) => (
                <TechStackBadge key={t.name} name={t.name} category={t.category} />
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Target Career Role:{' '}
              <strong className="text-slate-800">
                {topRecommendation?.targetRoles[0] || 'Cloud Solutions Associate'}
              </strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onNavigate('explanation')}
                className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold border border-blue-200 transition cursor-pointer"
              >
                Why This Stack? (SHAP Factors) →
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Quick Links & ERP Sync Snapshot */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Institutional ERP State
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Student Roll No:</span>
                <span className="font-mono font-medium text-slate-800">
                  {student.erpStudentId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Department:</span>
                <span className="font-medium text-slate-800">{student.branch}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">College:</span>
                <span className="font-medium text-slate-800 text-right truncate max-w-[140px]" title={student.college}>
                  {student.college}
                </span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-500">Last Synced:</span>
                <span className="font-medium text-emerald-600">{student.lastErpSync}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('erp-profile')}
              className="w-full mt-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition cursor-pointer"
            >
              Inspect Complete ERP Coursework →
            </button>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
              Model Control
            </h4>
            <p className="text-xs text-slate-500 mb-3">
              Re-run Random Forest inference using latest synced parameters.
            </p>
            <button
              type="button"
              onClick={onTriggerRec}
              disabled={isLoadingRecs}
              className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold transition disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
            >
              {isLoadingRecs ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
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
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Skills Ingestion & Matching
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Domain Competency Alignment
              </h4>
            </div>
            <span className="text-xs font-mono font-medium text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              88% Average Fit
            </span>
          </div>

          <div className="space-y-3.5 pt-1">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-800">Full-Stack Web & Cloud Systems</span>
                <span className="font-mono font-bold text-blue-600">94%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-600 h-2 rounded-full transition-all duration-700 w-[94%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-800">Cloud Architecture & DevOps Containerization</span>
                <span className="font-mono font-bold text-indigo-600">89%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-indigo-600 h-2 rounded-full transition-all duration-700 w-[89%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-800">IoT & Microcontroller Systems (SKIT Specialization)</span>
                <span className="font-mono font-bold text-cyan-600">82%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-600 h-2 rounded-full transition-all duration-700 w-[82%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="font-medium text-slate-800">Applied Artificial Intelligence & Data Pipelines</span>
                <span className="font-mono font-bold text-rose-600">76%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className="bg-rose-500 h-2 rounded-full transition-all duration-700 w-[76%]" />
              </div>
            </div>
          </div>
        </div>

        {/* Real-time System & Verification Timeline */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                Audit Trail
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5">
                Institutional Milestones & Execution
              </h4>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">v2.4 Live</span>
          </div>

          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">SKIT ERP Academic Records Synchronized</div>
                <div className="text-[11px] text-slate-500">
                  Semesters 1 to 5 coursework, lab marks, and 8.42 CGPA ingested.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Random Forest Classifier Inference Done</div>
                <div className="text-[11px] text-slate-500">
                  Ranked 4 high-demand career pathways with TreeSHAP factor calculation.
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                ✓
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900">Milestone Roadmap Generated</div>
                <div className="text-[11px] text-slate-500">
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
