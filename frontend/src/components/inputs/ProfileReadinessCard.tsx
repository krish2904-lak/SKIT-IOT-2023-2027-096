import React from 'react';
import type { StudentSkill } from '../../types';

interface ProfileReadinessCardProps {
  hasErpLinked: boolean;
  selectedDomainsCount: number;
  skills: StudentSkill[];
  hasRoleConfigured: boolean;
  resumeUploaded: boolean;
}

export const ProfileReadinessCard: React.FC<ProfileReadinessCardProps> = ({
  hasErpLinked,
  selectedDomainsCount,
  skills,
  hasRoleConfigured,
  resumeUploaded,
}) => {
  const checks = [
    {
      label: 'Trusted ERP snapshot',
      met: hasErpLinked,
      detail: hasErpLinked ? 'Snapshot linked' : 'No trusted snapshot linked',
      weight: 20,
    },
    {
      label: 'Interest domains',
      met: selectedDomainsCount >= 1,
      detail: selectedDomainsCount >= 1 ? `${selectedDomainsCount} domains selected` : 'Select at least 1 domain',
      weight: 20,
    },
    {
      label: 'Profile skills',
      met: skills.length >= 2,
      detail: skills.length >= 2 ? `${skills.length} skills recorded` : 'Declare at least 2 skills',
      weight: 20,
    },
    {
      label: 'Career preference',
      met: hasRoleConfigured,
      detail: hasRoleConfigured ? 'Target role saved' : 'Set a preferred target role',
      weight: 20,
    },
    {
      label: 'Resume metadata',
      met: resumeUploaded,
      detail: resumeUploaded ? 'Resume parsed' : 'Optional: upload PDF or DOCX',
      weight: 20,
    },
  ];

  const totalScore = checks.reduce((acc, c) => (c.met ? acc + c.weight : acc), 0);

  const getScoreColor = (score: number) => {
    if (score >= 80) return { bg: 'bg-emerald-500', text: 'text-emerald-700', border: 'border-emerald-200', tag: 'Profile fields complete' };
    if (score >= 60) return { bg: 'bg-blue-500', text: 'text-blue-700', border: 'border-blue-200', tag: 'Profile in progress' };
    return { bg: 'bg-amber-500', text: 'text-amber-700', border: 'border-amber-200', tag: 'Add profile information' };
  };

  const status = getScoreColor(totalScore);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header and readiness meter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
              ✓
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Profile completeness
            </h3>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${status.border} ${status.text} bg-slate-50`}>
              {status.tag}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            This checklist counts profile fields only; it is not a model score or recommendation readiness guarantee.
          </p>
        </div>

        {/* Big percentage indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-2xl font-black text-slate-900 font-mono">
              {totalScore}%
            </div>
            <div className="text-[10px] text-slate-400 font-mono">Profile fields complete</div>
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
            className={`p-3 rounded-lg border text-left transition ${
              check.met
                ? 'bg-slate-50 border-slate-200'
                : 'bg-amber-50/40 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1">
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
            <p className="text-[11px] text-slate-500 truncate">{check.detail}</p>
          </div>
        ))}
      </div>

    </div>
  );
};
