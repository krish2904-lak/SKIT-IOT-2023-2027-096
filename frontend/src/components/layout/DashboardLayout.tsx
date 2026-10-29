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
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-indigo-500 selection:text-white">
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
          <div className="fixed top-4 right-4 sm:top-20 sm:right-6 z-50 max-w-sm sm:max-w-md bg-white/95 backdrop-blur-md border border-emerald-500/30 rounded-2xl shadow-xl p-4 flex items-start gap-3.5 transition-all duration-300 ring-1 ring-emerald-500/20">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 text-xs">
              <span className="font-bold text-slate-900 block tracking-tight">Institutional ERP Update</span>
              <p className="text-slate-600 mt-0.5 leading-relaxed">{syncNotification}</p>
              <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 mt-1.5 inline-block font-medium">SKIT College API • Verified</span>
            </div>
          </div>
        )}

        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto overflow-y-auto">
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
