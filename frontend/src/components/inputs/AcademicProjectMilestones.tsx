import React from 'react';
import type { AcademicScoresData } from '../../types';

interface AcademicProjectMilestonesProps {
  projectsCompleted: number;
  onChangeProjects: (count: number) => void;
  certificationsCount: number;
  onChangeCertifications: (count: number) => void;
  academicScores?: AcademicScoresData;
}

const COURSE_FEATURE_LABELS: { key: keyof AcademicScoresData; label: string; relevance: string }[] = [
  { key: 'web_technologies', label: 'Web Technologies', relevance: 'Web development' },
  { key: 'dbms', label: 'Database Systems', relevance: 'Data and backend' },
  { key: 'dsa', label: 'Data Structures & Algorithms', relevance: 'Core software' },
  { key: 'iot_embedded', label: 'IoT & Embedded Systems', relevance: 'IoT and devices' },
  { key: 'ml_math', label: 'AI, Machine Learning & Mathematics', relevance: 'AI/ML' },
  { key: 'cloud_computing', label: 'Cloud Computing', relevance: 'Cloud and DevOps' },
  { key: 'operating_systems', label: 'Operating Systems', relevance: 'Systems software' },
];

export const AcademicProjectMilestones: React.FC<AcademicProjectMilestonesProps> = ({
  projectsCompleted,
  onChangeProjects,
  certificationsCount,
  onChangeCertifications,
  academicScores,
}) => {
  const getProjectTier = (count: number) => {
    if (count <= 1) return { label: 'Foundational', color: 'bg-slate-100 text-slate-700' };
    if (count <= 3) return { label: 'Hands-on Builder', color: 'bg-blue-100 text-blue-800' };
    if (count <= 6) return { label: 'Experienced Creator', color: 'bg-indigo-100 text-indigo-800' };
    return { label: 'Production Capstone Ready', color: 'bg-emerald-100 text-emerald-800' };
  };

  const projectTier = getProjectTier(projectsCompleted);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              3
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Project and Certification Self-Report
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Optional
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Project and certification totals are self-reported. Academic scores below are read-only and shown only when matched in the trusted ERP snapshot.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Projects Completed Stepper & Slider */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Independent & Capstone Projects
              </h4>
              <p className="text-[11px] text-slate-500">
                Coursework projects, hackathons, or GitHub repositories.
              </p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded font-mono ${projectTier.color}`}>
              {projectTier.label}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              type="button"
              onClick={() => onChangeProjects(Math.max(0, projectsCompleted - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-2xs transition cursor-pointer"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {projectsCompleted}
              </span>
              <span className="text-xs text-slate-500 block">projects completed</span>
            </div>
            <button
              type="button"
              onClick={() => onChangeProjects(Math.min(20, projectsCompleted + 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-2xs transition cursor-pointer"
            >
              +
            </button>
          </div>

          <input
            type="range"
            min={0}
            max={20}
            value={projectsCompleted}
            onChange={(e) => onChangeProjects(Number(e.target.value))}
            className="w-full accent-blue-600 cursor-pointer"
          />

          <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-200">
            <span className="text-[10px] text-slate-400 font-medium">Examples:</span>
            {['IoT Telemetry Node', 'React Portfolio Hub', 'FastAPI REST Service', 'ML Classification'].map((sample) => (
              <span
                key={sample}
                className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2 py-0.5 rounded"
              >
                {sample}
              </span>
            ))}
          </div>
        </div>

        {/* Industry Certifications Stepper */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-bold text-slate-900">
                Industry Certifications Earned
              </h4>
              <p className="text-[11px] text-slate-500">
                NPTEL, Coursera, AWS, or college institutional credentials.
              </p>
            </div>
            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
              {certificationsCount} Active
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 pt-1">
            <button
              type="button"
              onClick={() => onChangeCertifications(Math.max(0, certificationsCount - 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-2xs transition cursor-pointer"
            >
              -
            </button>
            <div className="text-center">
              <span className="text-2xl font-black text-slate-900 font-mono">
                {certificationsCount}
              </span>
              <span className="text-xs text-slate-500 block">certifications</span>
            </div>
            <button
              type="button"
              onClick={() => onChangeCertifications(Math.min(10, certificationsCount + 1))}
              className="w-8 h-8 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-sm shadow-2xs transition cursor-pointer"
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
            className="w-full accent-blue-600 cursor-pointer"
          />

          <p className="border-t border-slate-200 pt-2 text-[10px] text-slate-500">
            Enter only certifications you have earned.
          </p>
        </div>
      </div>

      {/* ERP Academic Scores Preview Table */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h4 className="text-xs font-bold text-slate-900">
              Matched ERP Academic Scores
            </h4>
            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.2 rounded">
              Read-Only ERP Sync
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Scores are sourced only from linked ERP courses
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {COURSE_FEATURE_LABELS.map((item) => {
            const score = academicScores?.[item.key];
            return (
              <div
                key={item.key}
                className="p-3 bg-white rounded-lg border border-slate-200 shadow-2xs flex flex-col justify-between space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block leading-tight">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {item.relevance}
                    </span>
                  </div>
                  {score === undefined
                    ? <span className="text-[10px] text-slate-400">No matched course</span>
                    : <span className="text-xs font-mono font-bold text-slate-700">{score.toFixed(1)}%</span>}
                </div>

                {score !== undefined && (
                  <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full bg-blue-500" style={{ width: `${Math.min(100, score)}%` }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
