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
  const getPaceDescription = () => {
    if (weeklyHours <= 10) {
      return {
        tier: 'Part-Time Exploratory',
        description: 'Ideal for semester exam periods. Focuses on core theory and lightweight weekly mini-labs.',
        badgeColor: 'bg-amber-100 text-amber-800',
        roadmapWeeks: '14–16 Weeks',
      };
    }
    if (weeklyHours <= 20) {
      return {
        tier: 'Recommended University Track',
        description: 'Balanced with ongoing college lectures and practicals. Fits standard 3-phase roadmaps.',
        badgeColor: 'bg-blue-100 text-blue-800',
        roadmapWeeks: '8–10 Weeks',
      };
    }
    return {
      tier: 'Intensive Capstone Bootcamp',
      description: 'Rapid sprint mode. Best suited for summer terms, pre-placement preparation, or hackathon sprints.',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      roadmapWeeks: '4–6 Weeks',
    };
  };

  const paceInfo = getPaceDescription();

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200/70 shadow-2xs">
              4
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Career Target & Dedicated Study Commitment
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              Vector 5 • Pacing
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Specify your desired job profile and weekly available hours. The platform adjusts learning roadmap
            phases and difficulty filtering accordingly.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5 shadow-2xs">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Target Technical Role */}
      <div className="space-y-2.5">
        <label className="text-xs font-semibold text-slate-700 block">
          Target Professional Role
        </label>
        <input
          type="text"
          value={preferredRole}
          onChange={(e) => onChangeRole(e.target.value)}
          placeholder="e.g. Full-Stack Cloud Engineer, AI/ML Specialist..."
          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
        />

        {/* Quick suggestions pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Quick Suggestions:</span>
          {COMMON_ROLE_SUGGESTIONS.map((role) => (
            <button
              key={role}
              type="button"
              onClick={() => onChangeRole(role)}
              className={`px-2.5 py-1 text-[11px] rounded-lg transition-all cursor-pointer border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 ${
                preferredRole === role
                  ? 'bg-indigo-600 text-white border-indigo-600 font-semibold shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border-slate-200/70'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-3 border-t border-slate-100">
        {/* Weekly Hours Slider */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-700 block">
              Weekly Dedicated Study Hours
            </label>
            <span className="text-sm font-bold font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60">
              {weeklyHours} hrs / week
            </span>
          </div>

          <input
            type="range"
            min={5}
            max={40}
            step={5}
            value={weeklyHours}
            onChange={(e) => onChangeWeeklyHours(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          />

          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>5 hrs (Min)</span>
            <span>20 hrs (Recommended)</span>
            <span>40 hrs (Max)</span>
          </div>

          {/* Dynamic feedback pill */}
          <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono border shadow-2xs ${paceInfo.badgeColor}`}>
                {paceInfo.tier}
              </span>
              <span className="text-[11px] font-mono font-semibold text-slate-700">
                Est. Completion: {paceInfo.roadmapWeeks}
              </span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              {paceInfo.description}
            </p>
          </div>
        </div>

        {/* Learning Pace Strategy */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-slate-700 block">
            Learning Pace Strategy
          </label>

          <div className="grid grid-cols-1 gap-2.5">
            {[
              {
                id: 'Balanced',
                title: 'Balanced Cadence (Recommended)',
                desc: 'Structured weekly milestones with weekend capstone sprints. Aligns with semester coursework.',
              },
              {
                id: 'Intensive',
                title: 'Intensive Sprint',
                desc: 'Accelerated pacing with high-frequency project deliverables for immediate placement prep.',
              },
              {
                id: 'Self-Paced',
                title: 'Self-Paced Exploration',
                desc: 'Flexible timeline without strict weekly deadlines. Great for concurrent exam schedules.',
              },
            ].map((p) => {
              const isSelected = learningPace === p.id;
              return (
                <div
                  key={p.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onChangeLearningPace(p.id as any)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      onChangeLearningPace(p.id as any);
                    }
                  }}
                  className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer card-hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    isSelected
                      ? 'border-indigo-600/80 bg-gradient-to-br from-indigo-50/70 to-blue-50/30 ring-2 ring-indigo-500/70 shadow-xs'
                      : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900">{p.title}</span>
                    <input
                      type="radio"
                      checked={isSelected}
                      onChange={() => {}}
                      className="accent-indigo-600"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
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
