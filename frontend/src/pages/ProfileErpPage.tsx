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
    <div className="space-y-6 sm:space-y-8">
      {/* Student Identity Overview Header */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs card-hover-lift">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4">
          <div>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 uppercase tracking-widest inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              College ERP Verified Record
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 mt-1.5 tracking-tight">{student.name}</h2>
            <p className="text-xs text-slate-500 mt-0.5 font-normal">
              {student.branch} • Semester {student.semester} • Academic Year {student.academicYear}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-xs text-slate-400 block font-medium">University Roll Number</span>
            <span className="font-mono font-bold text-sm sm:text-base text-slate-900 bg-slate-100/80 px-2.5 py-1 rounded-lg border border-slate-200 inline-block mt-0.5">
              {student.erpStudentId}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">College</span>
            <span className="font-semibold text-slate-800">{student.college}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Official Email</span>
            <span className="font-mono text-slate-800 truncate block font-medium">{student.email}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">Current CGPA</span>
            <span className="font-bold text-slate-900 font-mono text-sm">{student.cgpa.toFixed(2)} / 10.0</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px] font-medium">ERP Sync Status</span>
            <span className="font-semibold text-emerald-600 flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
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
