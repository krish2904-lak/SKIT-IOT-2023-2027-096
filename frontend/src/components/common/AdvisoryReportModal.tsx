import React from 'react';
import type { StudentProfile, RecommendationItem, StackExplanation } from '../../types';

interface AdvisoryReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  student: StudentProfile | null;
  topRecommendation?: RecommendationItem;
  explanation: StackExplanation | null;
}

export const AdvisoryReportModal: React.FC<AdvisoryReportModalProps> = ({
  isOpen,
  onClose,
  student,
  topRecommendation,
  explanation,
}) => {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Action Bar */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Student Career Advisory Report (Print & Export Preview)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-semibold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              Print / Save as PDF
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Printable Document Body */}
        <div className="p-8 space-y-6 text-slate-800">
          {/* Institution & Project Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest">
                Swami Keshvanand Institute of Technology, Management & Gramothan (SKIT)
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                AI-Based Tech Stack Advisory & Career Alignment Report
              </h2>
              <div className="text-xs text-slate-500 font-mono mt-1">
                Project Code: SKIT/DS/2023-2027/CSE-F-096 • Academic Session 2026–2027
              </div>
            </div>

            <div className="text-right text-xs">
              <span className="font-semibold block text-slate-800">Date Generated</span>
              <span className="text-slate-500 font-mono">
                {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Student Profile & ERP Metadata */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block text-[11px]">Student Name</span>
              <span className="font-bold text-slate-900 text-sm">{student.name}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Roll ID / ERP Reg</span>
              <span className="font-mono font-medium text-slate-800">{student.erpStudentId}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Department</span>
              <span className="font-medium text-slate-800">{student.branch} (Sem {student.semester})</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[11px]">Cumulative GPA</span>
              <span className="font-mono font-bold text-emerald-700 text-sm">{student.cgpa.toFixed(2)} / 10.0</span>
            </div>
          </div>

          {/* Primary Recommendation Verdict */}
          {topRecommendation && (
            <div className="border border-blue-200 bg-blue-50/50 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">
                    Primary Recommended Career Stack (Random Forest Output)
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-0.5">{topRecommendation.title}</h3>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold font-mono bg-emerald-100 text-emerald-800 border border-emerald-300">
                  {topRecommendation.matchScore}% Match Confidence
                </span>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed">
                {topRecommendation.whyRecommendedSnippet}
              </p>

              <div>
                <span className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Core Technologies to Master:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {topRecommendation.technologies.map((t) => (
                    <span
                      key={t.name}
                      className="px-2 py-0.5 rounded text-[11px] font-medium bg-white border border-slate-300 text-slate-800"
                    >
                      {t.name} ({t.category})
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Explainable AI Decision Breakdown */}
          {explanation && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                XAI Decision Attribution (TreeSHAP Mathematical Factors)
              </h4>

              <div className="space-y-2 text-xs">
                {explanation.topPositiveFactors.slice(0, 3).map((f) => (
                  <div key={f.featureName} className="flex items-center justify-between p-2 rounded bg-slate-50 border border-slate-100">
                    <span className="font-medium text-slate-800">{f.displayName}</span>
                    <span className="font-mono text-emerald-700 font-bold">
                      +{(f.shapValue * 100).toFixed(1)}% (Positive Driver)
                    </span>
                  </div>
                ))}
                {explanation.topNegativeFactors.slice(0, 2).map((f) => (
                  <div key={f.featureName} className="flex items-center justify-between p-2 rounded bg-amber-50/60 border border-amber-200">
                    <span className="font-medium text-amber-900">{f.displayName}</span>
                    <span className="font-mono text-amber-700 font-bold">
                      {(f.shapValue * 100).toFixed(1)}% (Bridging Gap)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Signature & Verification Block for Project Report */}
          <div className="pt-8 border-t border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <div className="border-b border-slate-400 pb-8 mb-1.5" />
              <span className="font-bold text-slate-800 block">Student Signature</span>
              <span>{student.name} ({student.erpStudentId})</span>
            </div>

            <div>
              <div className="border-b border-slate-400 pb-8 mb-1.5" />
              <span className="font-bold text-slate-800 block">Project Supervisor / Faculty Mentor</span>
              <span>Department of Computer Science & Engineering (IoT Lab)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
