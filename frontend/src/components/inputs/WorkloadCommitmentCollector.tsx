import React from 'react';

const COMMON_ROLE_SUGGESTIONS = [
  'Full-Stack Cloud Engineer',
  'Applied AI / ML Engineer',
  'IoT Firmware & Systems Engineer',
  'Cloud Architecture & DevOps Engineer',
  'Data Platform Engineer',
  'Mobile Application Specialist',
  'Cybersecurity Analyst',
];

interface WorkloadCommitmentCollectorProps {
  preferredRole: string;
  onChangeRole: (role: string) => void;
  weeklyHours: number;
  onChangeWeeklyHours: (hours: number) => void;
  learningPace: 'Self-Paced' | 'Intensive' | 'Balanced';
  onChangeLearningPace: (pace: 'Self-Paced' | 'Intensive' | 'Balanced') => void;
  error?: string;
}

export const WorkloadCommitmentCollector: React.FC<WorkloadCommitmentCollectorProps> = ({
  preferredRole,
  onChangeRole,
  weeklyHours,
  onChangeWeeklyHours,
  learningPace,
  onChangeLearningPace,
  error,
}) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Career Target & Dedicated Study Commitment
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Saved Preference
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            These preferences are saved to your profile. The current model does not use them to filter stacks
            or adjust roadmap durations.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Target Technical Role */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-700 block">
          Target Professional Role
        </label>
        <input
          type="text"
          value={preferredRole}
          onChange={(e) => onChangeRole(e.target.value)}
          placeholder="e.g. Full-Stack Cloud Engineer, AI/ML Specialist..."
          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500 focus:bg-white transition"
        />

        {/* Quick suggestions pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-medium mr-1">Quick Suggestions:</span>
          {COMMON_ROLE_SUGGESTIONS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onChangeRole(role)}
              className={`px-2 py-0.5 text-[11px] rounded-md transition cursor-pointer border ${
                preferredRole === role
                  ? 'bg-blue-600 text-white border-blue-600 font-medium'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-100">
        {/* Weekly Hours Slider */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 block">
              Weekly Dedicated Study Hours
            </label>
            <span className="text-sm font-bold font-mono text-blue-600">
              {weeklyHours} hrs / week
            </span>
          </div>

          <input
            type="range"
            min={1}
            max={40}
            step={5}
            value={weeklyHours}
            onChange={(e) => onChangeWeeklyHours(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>1 hr (Min)</span>
            <span>20 hrs</span>
            <span>40 hrs (Max)</span>
          </div>

          <p className="text-[11px] text-slate-500">
            Saved as a profile preference; it does not currently change model output or roadmap estimates.
          </p>
        </div>

        {/* Learning Pace Strategy */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Learning Pace Strategy
          </label>

          <div className="grid grid-cols-1 gap-2">
            {[
              {
                id: 'Balanced',
                title: 'Balanced Cadence (Recommended)',
                desc: 'A saved preference for a steady study rhythm.',
              },
              {
                id: 'Intensive',
                title: 'Intensive Sprint',
                desc: 'A saved preference for faster-paced learning.',
              },
              {
                id: 'Self-Paced',
                title: 'Self-Paced Exploration',
                desc: 'A saved preference without a fixed weekly cadence.',
              },
            ].map((p) => {
              const isSelected = learningPace === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => onChangeLearningPace(p.id as any)}
                  className={`p-3 rounded-lg border text-left transition cursor-pointer ${
                    isSelected
                      ? 'border-blue-500 bg-blue-50/50 ring-1 ring-blue-500'
                      : 'border-slate-200 bg-slate-50/50 hover:bg-slate-100/70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.title}</span>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-blue-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                    {p.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
