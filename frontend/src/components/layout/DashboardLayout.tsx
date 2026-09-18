import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { DashboardTab, StudentProfile } from '../../types';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  student: StudentProfile;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  student,
  children,
}) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-100 text-slate-900 font-sans">
      {/* Sidebar Navigation */}
      <Sidebar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Main Body */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          studentName={student.name}
          rollNumber={student.erpStudentId}
          branch={student.branch}
          lastSync={student.lastErpSync}
        />

        <main className="flex-1 p-6 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
