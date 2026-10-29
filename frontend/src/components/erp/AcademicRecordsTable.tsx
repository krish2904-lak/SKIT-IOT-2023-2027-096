import React, { useState } from 'react';
import type { ErpCourseRecord, SemesterSgpaRecord } from '../../types';

interface AcademicRecordsTableProps {
  courses?: ErpCourseRecord[];
  sgpaHistory?: SemesterSgpaRecord[];
  cgpa: number;
  rollNumber: string;
  semester: number;
  lastSync: string;
  onRefreshSync: () => void;
  isSyncing: boolean;
}

export const AcademicRecordsTable: React.FC<AcademicRecordsTableProps> = ({
  courses = [],
  sgpaHistory = [],
  cgpa,
  rollNumber,
  semester,
  lastSync,
  onRefreshSync,
  isSyncing,
}) => {
  const [selectedSemester, setSelectedSemester] = useState<number>(semester - 1);
  const [courseSearch, setCourseSearch] = useState<string>('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState<string>('ALL');

  // Filter courses by semester, search query, and grade
  const filteredCourses = courses.filter((c) => {
    const matchesSemester = selectedSemester === 0 || c.semester === selectedSemester;
    const matchesSearch =
      c.name.toLowerCase().includes(courseSearch.toLowerCase()) ||
      c.code.toLowerCase().includes(courseSearch.toLowerCase());
    const matchesGrade =
      selectedGradeFilter === 'ALL' || c.grade === selectedGradeFilter;
    return matchesSemester && matchesSearch && matchesGrade;
  });

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

  const totalCreditsEarned = sgpaHistory.reduce((acc, curr) => acc + curr.creditsCompleted, 0);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Top ERP Sync Info Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 card-hover-lift">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
              College ERP Academic Records (SKIT Ingestion)
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-normal font-normal">
            Institutional records linked to Roll ID{' '}
            <span className="font-mono font-bold text-slate-800">{rollNumber}</span>.
            Last verified on <span className="font-semibold text-slate-700">{lastSync}</span>.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefreshSync}
          disabled={isSyncing}
          className="btn-interactive inline-flex items-center gap-2 px-4 py-2 bg-[#0B0F19] hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 shrink-0"
        >
          <svg
            className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`}
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Cumulative GPA
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{cgpa.toFixed(2)}</span>
            <span className="text-xs text-slate-400 font-medium">/ 10.0</span>
          </div>
          <span className="inline-block mt-2.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
            First Class Distinction
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Degree Credits Earned
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">{totalCreditsEarned || 124}</span>
            <span className="text-xs text-slate-400 font-medium">/ 160 B.Tech</span>
          </div>
          <span className="inline-block mt-2.5 text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-bold border border-indigo-200">
            77.5% Degree Complete
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Overall Attendance
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">89.4%</span>
          </div>
          <span className="inline-block mt-2.5 text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
            Eligible for Exams (&gt;75%)
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs card-hover-lift">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Active Backlogs
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono tracking-tight">0</span>
          </div>
          <span className="inline-block mt-2.5 text-[10px] text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full font-bold border border-slate-200">
            Clean Academic Record
          </span>
        </div>
      </div>

      {/* Semester-by-Semester SGPA Progression Trend */}
      {sgpaHistory.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3.5 border-b border-slate-100 gap-2">
            <div>
              <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">
                Academic Trajectory Analytics
              </span>
              <h4 className="text-sm font-bold text-slate-900 mt-0.5 tracking-tight">
                Semester-by-Semester SGPA Progression
              </h4>
            </div>
            <span className="text-xs text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-bold font-mono">
              +0.60 SGPA Overall Gain
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3.5 pt-1">
            {sgpaHistory.map((item) => {
              const heightPercentage = Math.round(((item.sgpa - 7.0) / 3.0) * 100);
              return (
                <div
                  key={item.semester}
                  className="bg-slate-50/80 rounded-2xl p-3.5 border border-slate-200/80 text-center flex flex-col justify-between card-hover-lift"
                >
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Sem {item.semester}
                  </span>
                  <div className="my-3">
                    <div className="w-8 mx-auto bg-slate-200/80 rounded-full h-18 flex items-end p-0.5 overflow-hidden">
                      <div
                        className="w-full bg-gradient-to-t from-indigo-600 to-sky-500 rounded-full transition-all duration-700 shadow-2xs"
                        style={{ height: `${heightPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-extrabold font-mono text-slate-900 block mt-2">
                      {item.sgpa.toFixed(2)}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500 block truncate font-medium" title={item.highlightCourse}>
                    {item.highlightCourse}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Semester Coursework Table */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-200/80 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">Coursework & Laboratory Performance</h4>
              <span className="text-[11px] font-mono font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                {filteredCourses.length} of {courses.length} courses
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-normal leading-normal">
              Verified institutional metrics supplied to the Random Forest recommendation engine.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Live Search input */}
            <div className="relative">
              <input
                type="text"
                value={courseSearch}
                onChange={(e) => setCourseSearch(e.target.value)}
                placeholder="Search subject or code..."
                className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-44 sm:w-52 transition-all duration-150"
              />
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Grade Filter */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs border border-slate-200/60">
              {(['ALL', 'A+', 'A', 'B+'] as const).map((grade) => (
                <button
                  key={grade}
                  type="button"
                  onClick={() => setSelectedGradeFilter(grade)}
                  className={`px-2.5 py-1 rounded-lg font-semibold text-[11px] transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                    selectedGradeFilter === grade
                      ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {grade}
                </button>
              ))}
            </div>

            {/* Semester Selector Buttons */}
            <div className="flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl text-xs border border-slate-200/60">
              <button
                type="button"
                onClick={() => setSelectedSemester(0)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedSemester === 0
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester(5)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedSemester === 5
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sem 5
              </button>
              <button
                type="button"
                onClick={() => setSelectedSemester(4)}
                className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                  selectedSemester === 4
                    ? 'bg-white text-indigo-700 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Sem 4
              </button>
            </div>
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
