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
  const getAccentBorder = () => {
    switch (accentColor) {
      case 'emerald':
        return 'border-t-emerald-500';
      case 'indigo':
        return 'border-t-indigo-500';
      case 'amber':
        return 'border-t-amber-500';
      default:
        return 'border-t-blue-500';
    }
  };

  return (
    <div
      className={`bg-white rounded-xl border border-slate-200 border-t-4 p-5 shadow-xs transition-shadow hover:shadow-md ${getAccentBorder()}`}
    >
      <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
        <span>{title}</span>
        {badge && (
          <span className="text-[10px] font-medium bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
            {badge}
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-slate-900 tracking-tight">{value}</div>
      {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
    </div>
  );
};
