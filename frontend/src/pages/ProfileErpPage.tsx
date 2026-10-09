import React from 'react';
import type { StudentProfile } from '../types';
import { AcademicRecordsTable } from '../components/erp/AcademicRecordsTable';

interface ProfileErpPageProps {
  student: StudentProfile | null;
  onRefreshSync: () => void;
  isSyncing: boolean;
}

export const ProfileErpPage: React.FC<ProfileErpPageProps> = ({
  student,
  onRefreshSync,
  isSyncing,
}) => {
  if (!student) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-500">
        Loading ERP academic data...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Student Identity Overview Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 uppercase tracking-wider">
              College ERP Verified Record
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-1">{student.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {student.branch} • Semester {student.semester} • Academic Year {student.academicYear}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block">University Roll Number</span>
            <span className="font-mono font-bold text-sm text-slate-800">
              {student.erpStudentId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">College</span>
            <span className="font-medium text-slate-800">{student.college}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Official Email</span>
            <span className="font-mono text-slate-800 truncate block">{student.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Current CGPA</span>
            <span className="font-bold text-slate-900 font-mono">{student.cgpa.toFixed(2)} / 10.0</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">ERP Sync Status</span>
            <span className="font-medium text-emerald-600 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Verified ({student.lastErpSync})
            </span>
          </div>
        </div>
      </div>

      {/* Coursework & Lab Performance Table + SGPA Trend */}
      <AcademicRecordsTable
        courses={student.erpCourses}
        sgpaHistory={student.sgpaHistory}
        cgpa={student.cgpa}
        rollNumber={student.erpStudentId}
        semester={student.semester}
        lastSync={student.lastErpSync}
        onRefreshSync={onRefreshSync}
        isSyncing={isSyncing}
      />
    </div>
  );
};
