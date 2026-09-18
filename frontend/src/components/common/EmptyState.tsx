import React from 'react';

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionText,
  onAction,
  secondaryText,
}) => {
  return (
    <div className="bg-white rounded-xl border border-dashed border-slate-300 p-8 text-center max-w-lg mx-auto my-6">
      <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-5 leading-relaxed">{description}</p>
      {actionText && (
        <button
          type="button"
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-xs text-white bg-blue-600 hover:bg-blue-700 transition cursor-pointer"
        >
          {actionText}
        </button>
      )}
      {secondaryText && (
        <p className="text-xs text-slate-400 mt-3">{secondaryText}</p>
      )}
    </div>
  );
};
