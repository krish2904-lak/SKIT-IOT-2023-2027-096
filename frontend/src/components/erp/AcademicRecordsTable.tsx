import React, { useMemo, useState } from 'react';
import type { ErpCourseRecord, SemesterSgpaRecord } from '../../types';

interface AcademicRecordsTableProps {
  courses?: ErpCourseRecord[];
  sgpaHistory?: SemesterSgpaRecord[];
  cgpa: number | null;
  rollNumber: string | null;
  semester: number | null;
  lastSync: string | null;
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
  const [selectedSemester, setSelectedSemester] = useState<number>(0);
  const [courseSearch, setCourseSearch] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const semesters = useMemo(
    () => [...new Set(courses.map((course) => course.semester))].sort((a, b) => b - a),
    [courses],
  );
  const grades = useMemo(
    () => [...new Set(courses.map((course) => course.grade).filter((grade): grade is string => Boolean(grade)))].sort(),
    [courses],
  );
  const filteredCourses = courses.filter((course) => (
    (selectedSemester === 0 || course.semester === selectedSemester)
    && (selectedGrade === 'ALL' || course.grade === selectedGrade)
    && `${course.name} ${course.code}`.toLowerCase().includes(courseSearch.toLowerCase())
  ));
  const attendanceRecords = courses.filter(
    (course) => course.attendancePercent !== null && course.attendancePercent !== undefined,
  );
  const averageAttendance = attendanceRecords.length
    ? attendanceRecords.reduce((sum, course) => sum + (course.attendancePercent ?? 0), 0) / attendanceRecords.length
    : null;

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-bold text-slate-900">Trusted ERP Academic Records</h3>
          <p className="mt-1 text-xs text-slate-500">
            {rollNumber ? <>Records linked to Roll ID <span className="font-mono text-slate-800">{rollNumber}</span>. </> : 'Records linked to your account. '}
            {lastSync ? `Last synchronized ${new Date(lastSync).toLocaleString()}.` : 'No synchronization timestamp is available.'}
          </p>
        </div>
        <button
          type="button"
          onClick={onRefreshSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:opacity-50"
        >
          {isSyncing ? 'Syncing…' : 'Refresh ERP records'}
        </button>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">Cumulative GPA</span>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900">
            {cgpa === null ? '—' : `${cgpa.toFixed(2)} / 10`}
          </div>
          <span className="mt-2 inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
            {cgpa === null ? 'Not available' : 'From linked snapshot'}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">Course records</span>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900">{courses.length}</div>
          <span className="mt-2 inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
            {semester === null ? 'Current semester unavailable' : `Current semester ${semester}`}
          </span>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
          <span className="block text-[11px] font-medium uppercase tracking-wider text-slate-500">Average attendance</span>
          <div className="mt-1 text-2xl font-bold font-mono text-slate-900">
            {averageAttendance === null ? '—' : `${averageAttendance.toFixed(1)}%`}
          </div>
          <span className="mt-2 inline-block rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] text-slate-600">
            {attendanceRecords.length ? `${attendanceRecords.length} courses with attendance data` : 'Not available'}
          </span>
        </div>
      </section>

      {sgpaHistory.length > 0 && (
        <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900">Semester GPA history</h3>
          <div className="mt-3 flex flex-wrap gap-3">
            {sgpaHistory.map((record) => (
              <div key={record.semester} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
                Semester {record.semester}: <strong>{record.sgpa.toFixed(2)}</strong>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-col gap-3 border-b border-slate-200 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Coursework records</h3>
            <p className="mt-1 text-xs text-slate-500">
              Showing data returned by the trusted ERP snapshot; absent values remain unavailable.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              value={courseSearch}
              onChange={(event) => setCourseSearch(event.target.value)}
              placeholder="Search course or code"
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
            />
            <select
              value={selectedSemester}
              onChange={(event) => setSelectedSemester(Number(event.target.value))}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
            >
              <option value={0}>All semesters</option>
              {semesters.map((value) => <option key={value} value={value}>Semester {value}</option>)}
            </select>
            <select
              value={selectedGrade}
              onChange={(event) => setSelectedGrade(event.target.value)}
              className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs"
            >
              <option value="ALL">All grades</option>
              {grades.map((grade) => <option key={grade} value={grade}>{grade}</option>)}
            </select>
          </div>
        </div>
        {courses.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">
            No ERP coursework is available. The configured API currently has no trusted ERP connector.
          </p>
        ) : filteredCourses.length === 0 ? (
          <p className="p-6 text-sm text-slate-600">No courses match these filters.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3">Code</th>
                  <th className="px-5 py-3">Course</th>
                  <th className="px-5 py-3">Semester</th>
                  <th className="px-5 py-3">Credits</th>
                  <th className="px-5 py-3">Score</th>
                  <th className="px-5 py-3">Grade</th>
                  <th className="px-5 py-3">Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.map((course) => (
                  <tr key={`${course.code}-${course.semester}`} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5 font-mono text-slate-700">{course.code}</td>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{course.name}</td>
                    <td className="px-5 py-3.5">{course.semester}</td>
                    <td className="px-5 py-3.5 font-mono">{course.credits}</td>
                    <td className="px-5 py-3.5 font-mono">{course.theoryScore ?? course.practicalScore ?? '—'}</td>
                    <td className="px-5 py-3.5">{course.grade || '—'}</td>
                    <td className="px-5 py-3.5 font-mono">
                      {course.attendancePercent == null ? '—' : `${course.attendancePercent.toFixed(1)}%`}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
