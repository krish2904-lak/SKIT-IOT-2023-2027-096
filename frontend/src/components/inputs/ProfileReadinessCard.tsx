import React from 'react';
import type { StudentSkill } from '../../types';

interface ProfileReadinessCardProps {
  hasErpLinked: boolean;
  selectedDomainsCount: number;
  skills: StudentSkill[];
  hasRoleConfigured: boolean;
  resumeUploaded: boolean;
  onLoadDemoProfile?: () => void;
  onResetBaseline?: () => void;
}

export const ProfileReadinessCard: React.FC<ProfileReadinessCardProps> = ({
  hasErpLinked,
  selectedDomainsCount,
  skills,
  hasRoleConfigured,
  resumeUploaded,
  onLoadDemoProfile,
  onResetBaseline,
}) => {
  // Vector checkpoints calculation
  const checks = [
    {
      label: 'Verified ERP Academic Records',
      met: hasErpLinked,
      detail: hasErpLinked ? '7 Coursework marks synchronized' : 'ERP connection pending',
      weight: 20,
    },
    {
      label: 'Career Target Domains',
      met: selectedDomainsCount >= 1,
      detail: selectedDomainsCount >= 1 ? `${selectedDomainsCount} domains selected` : 'Select at least 1 domain',
      weight: 20,
    },
    {
      label: 'Technical Skills Inventory',
      met: skills.length >= 2,
      detail: skills.length >= 2 ? `${skills.length} skills recorded` : 'Declare at least 2 skills',
      weight: 20,
    },
    {
      label: 'Career Role & Workload Pacing',
      met: hasRoleConfigured,
      detail: hasRoleConfigured ? 'Pacing vector configured' : 'Set preferred target role',
      weight: 20,
    },
    {
      label: 'Resume Document NLP Ingestion',
      met: resumeUploaded,
      detail: resumeUploaded ? 'Resume parsed & vectorized' : 'Optional: Upload PDF resume',
      weight: 20,
    },
  ];

  const totalScore = checks.reduce((acc, c) => (c.met ? acc + c.weight : acc), 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-gradient-to-r from-emerald-500 to-teal-400', text: 'text-emerald-700', border: 'border-emerald-200', tag: 'High Prediction Confidence' };
    if (score >= 60) return { bg: 'bg-gradient-to-r from-indigo-500 to-blue-500', text: 'text-indigo-700', border: 'border-indigo-200', tag: 'Model-Ready' };
    return { bg: 'bg-gradient-to-r from-amber-500 to-rose-400', text: 'text-amber-700', border: 'border-amber-200', tag: 'Needs Required Vectors' };
  };

  const status = getScoreColor(totalScore);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-5 card-hover-lift">
      {/* Header and readiness meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ✓
            </span>
            <h3 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              Data Collection Completeness & Vector Health
            </h3>
            <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${status.border} ${status.text} bg-slate-50 font-mono`}>
              {status.tag}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-normal leading-normal">
            Real-time evaluation of student profile vectors required for Random Forest ML inference and SHAP explainability.
          </p>
        </div>

        {/* Big percentage indicator */}
        <div className="flex items-center gap-3">
          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">
              {totalScore}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Profile Vector Health</div>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${status.bg}`}
          style={{ width: `${totalScore}%` }}
        />
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {checks.map((check) => (
          <div
            key={check.label}
            className={`p-3.5 rounded-xl border text-left transition-all duration-150 card-hover-lift ${
              check.met
                ? 'bg-slate-50/80 border-slate-200/80'
                : 'bg-amber-50/40 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  check.met ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                }`}
              >
                {check.met ? '✓' : '!'}
              </span>
              <span className="text-xs font-bold text-slate-800 truncate">
                {check.label}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 truncate font-normal">{check.detail}</p>
          </div>
        ))}
      </div>

      {/* Quick shortcuts / testing helper buttons */}
      {(onLoadDemoProfile || onResetBaseline) && (
        <div className="flex flex-wrap items-center justify-between gap-2 pt-3.5 border-t border-slate-100 text-xs">
          <span className="text-[11px] text-slate-400 font-medium">Testing & Demo Helpers:</span>
          <div className="flex items-center gap-2">
            {onLoadDemoProfile && (
              <button
                type="button"
                onClick={onLoadDemoProfile}
                className="btn-interactive px-3 py-1.5 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100/80 rounded-xl border border-indigo-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Populate Full CSE-IoT Profile
              </button>
            )}
            {onResetBaseline && (
              <button
                type="button"
                onClick={onResetBaseline}
                className="btn-interactive px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl border border-slate-200 transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Reset to ERP Baseline
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
