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
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Backend':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Database':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'DevOps':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'AI_ML':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'IoT':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs font-medium px-2.5 py-1';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md border font-medium transition-colors ${getCategoryStyles(
        category
      )} ${sizeClass}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-60"></span>
      {name}
    </span>
  );
};
