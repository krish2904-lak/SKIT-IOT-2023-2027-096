import React from 'react';
import type { TechCategory } from '../../types';

interface TechStackBadgeProps {
  name: string;
  category?: TechCategory;
  size?: 'sm' | 'md';
}

export const TechStackBadge: React.FC<TechStackBadgeProps> = ({
  name,
  category = 'Frontend',
  size = 'md',
}) => {
  const getCategoryStyles = (cat: TechCategory) => {
    switch (cat) {
      case 'Frontend':
        return 'bg-indigo-50/80 text-indigo-700 border-indigo-200/80 hover:bg-indigo-100/90 hover:border-indigo-300 hover:shadow-xs';
      case 'Backend':
        return 'bg-emerald-50/80 text-emerald-700 border-emerald-200/80 hover:bg-emerald-100/90 hover:border-emerald-300 hover:shadow-xs';
      case 'Database':
        return 'bg-amber-50/80 text-amber-700 border-amber-200/80 hover:bg-amber-100/90 hover:border-amber-300 hover:shadow-xs';
      case 'DevOps':
        return 'bg-violet-50/80 text-violet-700 border-violet-200/80 hover:bg-violet-100/90 hover:border-violet-300 hover:shadow-xs';
      case 'AI_ML':
        return 'bg-rose-50/80 text-rose-700 border-rose-200/80 hover:bg-rose-100/90 hover:border-rose-300 hover:shadow-xs';
      case 'IoT':
        return 'bg-cyan-50/80 text-cyan-700 border-cyan-200/80 hover:bg-cyan-100/90 hover:border-cyan-300 hover:shadow-xs';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200/80 hover:border-slate-300 hover:shadow-xs';
    }
  };

  const sizeClass = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs font-semibold px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-lg border shadow-2xs font-sans tracking-tight transition-all duration-200 ease-out cursor-default select-none hover:-translate-y-0.5 ${getCategoryStyles(
        category
      )} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75 animate-pulse-glow shrink-0"></span>
      <span>{name}</span>
    </span>
  );
};

