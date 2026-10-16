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
          onTabChange={onTabChange}
        />

        {/* Sync alert banner & floating toast */}
        {syncNotification && (
          <div className="fixed top-18 right-6 z-50 max-w-md bg-white border border-emerald-300 rounded-xl shadow-xl p-3.5 flex items-start gap-3 animate-fade-in">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-slate-900 block">Institutional ERP Update</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{syncNotification}</p>
              <span className="font-mono text-[10px] text-emerald-600 mt-1 inline-block">SKIT College API • Verified</span>
            </div>
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
