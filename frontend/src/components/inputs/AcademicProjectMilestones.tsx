import React from 'react';
import type { AcademicScoresData } from '../../types';

interface AcademicProjectMilestonesProps {
  projectsCompleted: number;
  onChangeProjects: (count: number) => void;
  certificationsCount: number;
  onChangeCertifications: (count: number) => void;
  academicScores?: AcademicScoresData;
}

const DEFAULT_ACADEMIC_SCORES: AcademicScoresData = {
  web_technologies: 95.0,
  dbms: 84.0,
  dsa: 82.0,
  iot_embedded: 92.0,
  ml_math: 78.0,
  cloud_computing: 80.0,
  operating_systems: 88.0,
};

const COURSE_FEATURE_LABELS: { key: keyof AcademicScoresData; label: string; code: string; relevance: string }[] = [
  { key: 'web_technologies', label: 'Web Technologies & Lab', code: '5CS4-21', relevance: 'MERN & Full-Stack Web' },
  { key: 'dbms', label: 'Database Management Systems', code: '5CS4-04', relevance: 'Data Engineering & Backend' },
  { key: 'dsa', label: 'Data Structures & Algorithms', code: '4CS4-02', relevance: 'Core Software & Competitive' },
  { key: 'iot_embedded', label: 'IoT Sensors & Microcontrollers', code: '4CS4-21', relevance: 'IoT Embedded Systems' },
  { key: 'ml_math', label: 'Applied AI & Linear Algebra', code: '5CS4-06', relevance: 'AI/ML Engineering' },
  { key: 'cloud_computing', label: 'Cloud Systems & Virtualization', code: '5CS4-11', relevance: 'Cloud & DevOps' },
  { key: 'operating_systems', label: 'Operating Systems & Linux', code: '5CS4-05', relevance: 'Systems & Cybersecurity' },
];

export const AcademicProjectMilestones: React.FC<AcademicProjectMilestonesProps> = ({
  projectsCompleted,
  onChangeProjects,
  certificationsCount,
  onChangeCertifications,
  academicScores = DEFAULT_ACADEMIC_SCORES,
}) => {
  const getProjectTier = (count: number) => {
    if (count <= 1) return { label: 'Foundational', color: 'bg-slate-100 text-slate-700 border-slate-200' };
    if (count <= 3) return { label: 'Hands-on Builder', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    if (count <= 6) return { label: 'Experienced Creator', color: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { label: 'Production Capstone Ready', color: 'bg-emerald-50 text-emerald-800 border-emerald-200' };
  };

  const projectTier = getProjectTier(projectsCompleted);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-6 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200/70 shadow-2xs">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Project Milestones & Verified ERP Course Alignment
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              Vectors 3 & 4 • Milestones
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Quantify completed project artifacts and track automated ERP academic scores feeding into the
            Random Forest recommendation engine.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
        {/* Projects Completed Stepper & Slider */}
        <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 card-hover-lift transition-all">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Independent & Capstone Projects
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Coursework projects, hackathons, or GitHub repositories.
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md font-mono border shadow-2xs shrink-0 ${projectTier.color}`}>
              {projectTier.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => onChangeProjects(Math.max(0, projectsCompleted - 1))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center text-slate-700 font-bold text-base shadow-2xs transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Decrease projects"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {projectsCompleted}
              </span>
              <span className="text-xs text-slate-500 block font-medium">projects completed</span>
            </div>
            <button
              type="button"
              onClick={() => onChangeProjects(Math.min(20, projectsCompleted + 1))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center text-slate-700 font-bold text-base shadow-2xs transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Increase projects"
            >
              +
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={15}
            value={projectsCompleted}
            onChange={(e) => onChangeProjects(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Examples:</span>
            {['IoT Telemetry Node', 'React Portfolio Hub', 'FastAPI REST Service', 'ML Classification'].map((sample) => (
              <span
                key={sample}
                className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono"
              >
                {sample}
              </span>
            ))}
          </div>
        </div>

        {/* Industry Certifications Stepper */}
        <div className="p-4 sm:p-5 bg-slate-50/80 rounded-2xl border border-slate-200/80 space-y-4 card-hover-lift transition-all">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Industry Certifications Earned
              </h4>
              <p className="text-[11px] text-slate-500 mt-0.5">
                NPTEL, Coursera, AWS, or college institutional credentials.
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-2xs shrink-0">
              {certificationsCount} Active
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-2">
            <button
              type="button"
              onClick={() => onChangeCertifications(Math.max(0, certificationsCount - 1))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center text-slate-700 font-bold text-base shadow-2xs transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Decrease certifications"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-3xl font-black text-slate-900 font-mono tracking-tight">
                {certificationsCount}
              </span>
              <span className="text-xs text-slate-500 block font-medium">certifications</span>
            </div>
            <button
              type="button"
              onClick={() => onChangeCertifications(Math.min(10, certificationsCount + 1))}
              className="w-9 h-9 rounded-xl bg-white border border-slate-300 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-700 flex items-center justify-center text-slate-700 font-bold text-base shadow-2xs transition-all cursor-pointer active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              aria-label="Increase certifications"
            >
              +
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={8}
            value={certificationsCount}
            onChange={(e) => onChangeCertifications(Number(e.target.value))}
            className="w-full accent-indigo-600 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-lg"
          />

          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-200/80">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Recognized:</span>
            {['NPTEL Elite IoT', 'AWS Cloud Practitioner', 'Coursera Deep Learning'].map((cert) => (
              <span
                key={cert}
                className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-mono"
              >
                {cert}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Verified ERP Academic Scores Preview Table */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-bold text-slate-900">
              Synchronized ERP Academic Scores (0–100 Scale)
            </h4>
            <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold px-2 py-0.5 rounded-full font-mono">
              ✓ Read-Only ERP Sync
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Directly mapped to Random Forest vectors
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COURSE_FEATURE_LABELS.map((item) => {
            const score = academicScores[item.key] ?? 75;
            return (
              <div
                key={item.key}
                className="p-3.5 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:shadow-xs card-hover-lift transition-all flex flex-col justify-between space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      {item.code} • {item.relevance}
                    </span>
                  </div>
                  <span
                    className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      score >= 85
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : score >= 75
                        ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200'
                    }`}
                  >
                    {score}%
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      score >= 85
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500'
                        : score >= 75
                        ? 'bg-gradient-to-r from-indigo-500 to-blue-500'
                        : 'bg-gradient-to-r from-amber-500 to-orange-500'
                    }`}
                    style={{ width: `${Math.min(100, score)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
