import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  badge?: string;
  accentColor?: 'blue' | 'emerald' | 'indigo' | 'amber';
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  badge,
  accentColor = 'blue',
}) => {
  const getAccentConfig = () => {
    switch (accentColor) {
      case 'emerald':
        return {
          border: 'border-t-emerald-500 hover:border-emerald-500',
          bgGradient: 'from-emerald-500/5 via-transparent to-transparent',
          badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          iconBg: 'bg-emerald-100 text-emerald-600',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
        };
      case 'indigo':
        return {
          border: 'border-t-indigo-500 hover:border-indigo-500',
          bgGradient: 'from-indigo-500/5 via-transparent to-transparent',
          badgeBg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          iconBg: 'bg-indigo-100 text-indigo-600',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          ),
        };
      case 'amber':
        return {
          border: 'border-t-amber-500 hover:border-amber-500',
          bgGradient: 'from-amber-500/5 via-transparent to-transparent',
          badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
          iconBg: 'bg-amber-100 text-amber-600',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          ),
        };
      default:
        return {
          border: 'border-t-blue-500 hover:border-blue-500',
          bgGradient: 'from-blue-500/5 via-transparent to-transparent',
          badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
          iconBg: 'bg-blue-100 text-blue-600',
          icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          ),
        };
    }
  };

  const config = getAccentConfig();

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-t-4 p-5 shadow-xs card-hover-lift bg-gradient-to-b ${config.bgGradient} ${config.border} flex flex-col justify-between`}
    >
      <div>
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2.5">
          <span className="flex items-center gap-1.5">{title}</span>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${config.badgeBg}`}>
                {badge}
              </span>
            )}
            <div className={`p-1 rounded-md ${config.iconBg}`}>
              {config.icon}
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      </div>
      {subtitle && <p className="text-xs text-slate-500 mt-2 font-medium">{subtitle}</p>}
    </div>
  );
};

