import React, { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import type { StudentProfile } from '../types';

interface ProfileInputViewProps {
  student: StudentProfile;
}

export const ProfileInputView: React.FC<ProfileInputViewProps> = ({ student }) => {
  const [showEmptyState, setShowEmptyState] = useState(false);

  return (
    <div className="space-y-6">
      {/* State Toggle for Reviewing Sprint 1 Low-Fi Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-lg border border-slate-200">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Sprint 1 State Preview:</span>{' '}
          Switch between empty-state and placeholder input form (Sprint 2 Interface).
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmptyState(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              !showEmptyState
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Form Layout
          </button>
          <button
            type="button"
            onClick={() => setShowEmptyState(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              showEmptyState
                ? 'bg-blue-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Empty State
          </button>
        </div>
      </div>

      {showEmptyState ? (
        <EmptyState
          title="No Student Profile Input Detected"
          description="Your ERP connection has not been configured or your profile questionnaire is empty. Once connected, your coursework grades and self-assessed skills will appear here."
          actionText="Sync with SKIT ERP"
          secondaryText="Scheduled for full form wiring in Sprint 2"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Form Sections */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: ERP Verified Academics (Read-Only) */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    1. Verified Academic Profile (ERP Integration)
                  </h3>
                  <p className="text-xs text-slate-500">
                    Auto-fetched from college ERP database (read-only for student).
                  </p>
                </div>
                <span className="text-[10px] font-semibold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                  ERP Verified
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Student Name</label>
                  <input
                    type="text"
                    readOnly
                    value={student.name}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-medium cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Roll / ERP ID</label>
                  <input
                    type="text"
                    readOnly
                    value={student.erpStudentId}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-mono cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Branch / Department</label>
                  <input
                    type="text"
                    readOnly
                    value={student.branch}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="text-slate-500 font-medium block mb-1">Current CGPA</label>
                  <input
                    type="text"
                    readOnly
                    value={`${student.cgpa} / 10.0`}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-800 font-bold text-blue-600 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Technical Skills Self-Assessment */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    2. Skill Declarations & Proficiency
                  </h3>
                  <p className="text-xs text-slate-500">
                    Skills collected via self-assessment, ERP labs, and resume parsing.
                  </p>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  Sprint 2 Story
                </span>
              </div>

              <div className="space-y-2">
                {student.skills.map((skill) => (
                  <div
                    key={skill.name}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-100 hover:bg-slate-50 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                      <span className="font-medium text-slate-800">{skill.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-500 px-2 py-0.5 bg-slate-100 rounded">
                        {skill.source === 'ERP_COURSEWORK'
                          ? 'ERP Lab'
                          : skill.source === 'RESUME_PARSED'
                          ? 'Resume Extracted'
                          : 'Self Reported'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                          skill.level === 'Advanced'
                            ? 'bg-emerald-100 text-emerald-800'
                            : skill.level === 'Intermediate'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {skill.level}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled
                    placeholder="Add technical skill (e.g. Docker, Flutter)..."
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-400 cursor-not-allowed"
                  />
                  <button
                    type="button"
                    disabled
                    className="px-3 py-2 bg-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                  >
                    + Add Skill
                  </button>
                </div>
              </div>
            </div>

            {/* Section 3: Resume Upload Placeholder */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">
                3. Resume Upload & Automated Skill Extraction
              </h3>
              <p className="text-xs text-slate-500 mb-4">
                Will connect to teammate LLM API parser in Sprint 4.
              </p>

              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-xl p-6 text-center bg-slate-50/50">
                <div className="w-10 h-10 mx-auto mb-2 text-slate-400 bg-white rounded-full flex items-center justify-center border border-slate-200">
                  📄
                </div>
                <div className="text-xs font-semibold text-slate-800">
                  {student.resumeFileName || 'Drop PDF resume here'}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  PDF / DOCX up to 5MB (Integration with LLM parser in Sprint 4)
                </div>
              </div>
            </div>
          </div>

          {/* Right Col: Career Aspirations & Meta */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-1">Career Interests</h3>
              <p className="text-xs text-slate-500 mb-3">
                Selected domains used for Random Forest classification.
              </p>

              <div className="flex flex-wrap gap-1.5">
                {student.interests.map((interest) => (
                  <span
                    key={interest}
                    className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full font-medium"
                  >
                    {interest}
                  </span>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="text-xs font-semibold text-slate-700 mb-2">
                  Sprint 2 Roadmap
                </div>
                <ul className="text-xs text-slate-500 space-y-1.5 list-disc list-inside">
                  <li>Dynamic skill addition & autocomplete</li>
                  <li>Multi-select interest domain picker</li>
                  <li>Client-side form validation</li>
                  <li>Submission payload integration</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
