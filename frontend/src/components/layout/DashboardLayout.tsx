import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import type { DashboardTab, StudentProfile } from '../../types';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  student: StudentProfile | null;
  isSyncingErp: boolean;
  onSyncErp: () => void;
  syncNotification: string | null;
  onTriggerRec?: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  activeTab,
  onTabChange,
  student,
  isSyncingErp,
  onSyncErp,
  syncNotification,
  onTriggerRec,
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation (Desktop sticky, Mobile drawer) */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOpenMobile={isMobileNavOpen}
        onCloseMobile={() => setIsMobileNavOpen(false)}
        onTriggerRec={onTriggerRec}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          activeTab={activeTab}
          studentName={student?.name ?? 'Prachi Bhardwaj'}
          rollNumber={student?.erpStudentId ?? '21ESKCS096'}
          branch={student?.branch ?? 'CSE (IoT)'}
          lastSync={student?.lastErpSync ?? 'Just now'}
          isSyncing={isSyncingErp}
          onSyncErp={onSyncErp}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
        />

        {/* Sync alert banner if notification exists */}
        {syncNotification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800 transition-all">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{syncNotification}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600">Verified institutional data</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
