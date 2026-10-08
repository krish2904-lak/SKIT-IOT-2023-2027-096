import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { AdvisoryReportModal } from '../common/AdvisoryReportModal';
import type { DashboardTab, StudentProfile, RecommendationItem, StackExplanation } from '../../types';

interface DashboardLayoutProps {
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  student: StudentProfile | null;
  isSyncingErp: boolean;
  onSyncErp: () => void;
  syncNotification: string | null;
  onTriggerRec?: () => void;
  topRecommendation?: RecommendationItem;
  explanation: StackExplanation | null;
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
  topRecommendation,
  explanation,
  children,
}) => {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation */}
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
          onOpenReportModal={() => setIsReportModalOpen(true)}
        />

        {/* Sync alert banner */}
        {syncNotification && (
          <div className="bg-emerald-50 border-b border-emerald-200 px-6 py-2.5 flex items-center justify-between text-xs text-emerald-800 transition-all">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>{syncNotification}</span>
            </div>
            <span className="font-mono text-[10px] text-emerald-600">Verified institutional data</span>
          </div>
        )}

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Printable Advisory Report Modal */}
      <AdvisoryReportModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        student={student}
        topRecommendation={topRecommendation}
        explanation={explanation}
      />
    </div>
  );
};
