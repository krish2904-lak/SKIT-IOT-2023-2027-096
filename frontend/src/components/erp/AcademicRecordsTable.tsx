import React, { useState } from 'react';
import type { ErpCourseRecord } from '../../types';

interface AcademicRecordsTableProps {
  courses?: ErpCourseRecord[];
  cgpa: number;
  rollNumber: string;
  semester: number;
  lastSync: string;
  onRefreshSync: () => void;
  isSyncing: boolean;
}

export const AcademicRecordsTable: React.FC<AcademicRecordsTableProps> = ({
  courses = [],
  cgpa,
  rollNumber,
  semester,
  lastSync,
  onRefreshSync,
  isSyncing,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(semester - 1);

  // Filter courses by semester or all
  const filteredCourses =
    selectedSemester === 0
      ? courses
      : courses.filter((c) => c.semester === selectedSemester);

  const getGradeBadge = (grade: string) => {
    switch (grade) {
      case 'A+':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'A':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'B+':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top ERP Sync Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <h3 className="text-base font-bold text-slate-900">
              College ERP Academic Records (SKIT Ingestion)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Institutional records linked to Roll ID{' '}
            <span className="font-mono font-medium text-slate-800">{rollNumber}</span>.
            Last verified on <span className="font-medium text-slate-700">{lastSync}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer"
        >
          <svg
            className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-blue-400' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isSyncing ? 'Syncing...' : 'Re-sync with ERP'}
        </button>
      </div>

      {/* Academic Stat Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Cumulative GPA
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">{cgpa.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
          </div>
          <span className="inline-block mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
            First Class Distinction
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Active Semester
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">Sem {semester}</span>
          </div>
          <span className="inline-block mt-2 text-[10px] text-blue-700 bg-blue-50 px-2 py-0.5 rounded font-medium border border-blue-200">
            Third Year (2025–26)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Overall Attendance
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">89.4%</span>
          </div>
          <span className="inline-block mt-2 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
            Above 75% Threshold
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Active Backlogs
          </span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 font-mono">0</span>
          </div>
          <span className="inline-block mt-2 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded font-medium border border-slate-200">
            Clean Academic Record
          </span>
        </div>
      </div>

      {/* Semester Coursework Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Coursework & Laboratory Performance</h4>
            <p className="text-xs text-slate-500">
              Direct inputs supplied to the Random Forest recommendation model.
            </p>
          </div>

          {/* Semester Selector Buttons */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setSelectedSemester(0)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                selectedSemester === 0
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Courses
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(5)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                selectedSemester === 5
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semester 5
            </button>
            <button
              type="button"
              onClick={() => setSelectedSemester(4)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition ${
                selectedSemester === 4
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semester 4
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[11px] font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">
                <th className="px-5 py-3">Course Code</th>
                <th className="px-5 py-3">Subject / Laboratory Name</th>
                <th className="px-5 py-3">Credits</th>
                <th className="px-5 py-3">Score</th>
                <th className="px-5 py-3">Grade</th>
                <th className="px-5 py-3">Attendance</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredCourses.map((course) => (
                <tr key={course.code} className="hover:bg-slate-50/70 transition">
                  <td className="px-5 py-3.5 font-mono font-medium text-slate-700">
                    {course.code}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">
                    {course.name}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 font-mono">
                    {course.credits}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-slate-700">
                    {course.theoryScore
                      ? `${course.theoryScore} / 100 (Th)`
                      : `${course.practicalScore} / 100 (Lab)`}
                  </td>
                  <td className="px-5 py-3.5">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[11px] font-semibold border ${getGradeBadge(
                        course.grade
                      )}`}
                    >
                      {course.grade}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 font-mono">
                    <span
                      className={
                        course.attendancePercent >= 85
                          ? 'text-emerald-600 font-medium'
                          : 'text-amber-600 font-medium'
                      }
                    >
                      {course.attendancePercent.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
