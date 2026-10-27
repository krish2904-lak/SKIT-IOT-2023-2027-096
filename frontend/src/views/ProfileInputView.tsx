import React, { useState } from 'react';
import { EmptyState } from '../components/common/EmptyState';
import { InputFormPage } from '../pages/InputFormPage';
import type { StudentProfile, StudentInputFormData } from '../types';

interface ProfileInputViewProps {
  student: StudentProfile;
  onSubmit?: (data: StudentInputFormData) => Promise<boolean>;
}

export const ProfileInputView: React.FC<ProfileInputViewProps> = ({ student, onSubmit }) => {
  const [showEmptyState, setShowEmptyState] = useState(false);

  const handleFallbackSubmit = async (data: StudentInputFormData): Promise<boolean> => {
    if (onSubmit) {
      return onSubmit(data);
    }
    alert(`Successfully saved ${data.skills.length} skills and ${data.selectedDomains.length} domains to profile!`);
    return true;
  };

  return (
    <div className="space-y-6">
      {/* State Toggle for Reviewing Specs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white rounded-lg border border-slate-200">
        <div className="text-xs text-slate-600">
          <span className="font-semibold text-slate-900">Sprint 2 Data Collection View:</span>{' '}
          Switch between the enhanced interactive input form and the empty-state preview.
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowEmptyState(false)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              !showEmptyState
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Enhanced Form Layout
          </button>
          <button
            type="button"
            onClick={() => setShowEmptyState(true)}
            className={`px-3 py-1 text-xs font-medium rounded-md transition cursor-pointer ${
              showEmptyState
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Empty State Preview
          </button>
        </div>
      </div>

      {showEmptyState ? (
        <EmptyState
          title="No Student Profile Input Detected"
          description="Your ERP connection has not been configured or your profile questionnaire is empty. Once connected, your coursework grades and self-assessed skills will appear here."
          actionText="Sync with SKIT ERP"
          secondaryText="Click 'Enhanced Form Layout' above to test the data collection interface"
        />
      ) : (
        <InputFormPage
          student={student}
          onSubmit={handleFallbackSubmit}
          isSubmitting={false}
        />
      )}
    </div>
  );
};
