import React, { useState, useMemo } from 'react';
import { DOMAIN_CATALOG } from './taxonomy';

const DOMAIN_ICONS: Record<string, React.ReactNode> = {
  'Full-Stack Web Development': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  'Applied Artificial Intelligence / Machine Learning': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  'Cloud Architecture & DevOps': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z" />
    </svg>
  ),
  'Internet of Things (IoT) & Embedded Firmware': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
  ),
  'Data Engineering & Big Data Systems': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  ),
  'Cybersecurity & Network Defense': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  'Mobile Application Development (Flutter/React Native)': (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  ),
};

interface DomainInterestPickerProps {
  selectedDomains: string[];
  onToggleDomain: (domainId: string) => void;
  onSetDomains?: (domains: string[]) => void;
  error?: string;
}

export const DomainInterestPicker: React.FC<DomainInterestPickerProps> = ({
  selectedDomains,
  onToggleDomain,
  onSetDomains,
  error,
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['All', 'Software & Web', 'Data & AI', 'Cloud & Systems', 'Hardware & IoT', 'Mobile & Security'];

  const filteredDomains = useMemo(() => {
    return DOMAIN_CATALOG.filter((d) => {
      const matchesCategory = activeCategory === 'All' || d.category === activeCategory;
      const matchesSearch =
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.popularStacks.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeCategory, searchQuery]);

  const handleApplyPreset = (presetName: string) => {
    if (!onSetDomains) return;
    if (presetName === 'iot-web') {
      onSetDomains([
        'Full-Stack Web Development',
        'Internet of Things (IoT) & Embedded Firmware',
        'Applied Artificial Intelligence / Machine Learning',
      ]);
    } else if (presetName === 'cloud-data') {
      onSetDomains([
        'Cloud Architecture & DevOps',
        'Data Engineering & Big Data Systems',
        'Cybersecurity & Network Defense',
      ]);
    } else if (presetName === 'clear') {
      onSetDomains([]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 transition-all">
      {/* Header and counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200/70 shadow-2xs">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Career Aspirations & Target Domains
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md font-mono">
              Vector 1 • Aspirations
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Choose domains you wish to pursue for capstone projects, internships, or placements.
            These form primary positive drivers in the Random Forest classification.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          <div
            className={`text-xs px-3 py-1.5 rounded-full font-mono font-medium flex items-center gap-2 border transition-all ${
              selectedDomains.length >= 1 && selectedDomains.length <= 4
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-2xs'
                : selectedDomains.length > 4
                ? 'bg-amber-50 text-amber-700 border-amber-200 shadow-2xs'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                selectedDomains.length >= 1 ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span className="font-semibold">{selectedDomains.length} Selected</span>
            <span className="text-[10px] text-slate-400">/ 1–4 optimal</span>
          </div>
        </div>
      </div>

      {/* Preset shortcut bars & search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1 shrink-0 uppercase tracking-wider">Presets:</span>
          {onSetDomains && (
            <>
              <button
                type="button"
                onClick={() => handleApplyPreset('iot-web')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100/80 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 transition cursor-pointer shrink-0 border border-slate-200/70 hover:border-indigo-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
              >
                IoT + Web + AI (CSE-IoT)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('cloud-data')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-100/80 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition cursor-pointer shrink-0 border border-slate-200/70 hover:border-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 active:scale-95"
              >
                Cloud + Data + Security
              </button>
              {selectedDomains.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset('clear')}
                  className="px-2.5 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer shrink-0 border border-transparent hover:border-red-200 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95"
                >
                  Clear Selection
                </button>
              )}
            </>
          )}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            placeholder="Search domains or tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50/70 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus:bg-white transition-all shadow-2xs"
          />
          <svg
            className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-slate-100">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95 ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs font-semibold'
                : 'bg-slate-100/70 text-slate-600 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50/90 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2.5 shadow-2xs">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Domain Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredDomains.map((domain) => {
          const isSelected = selectedDomains.includes(domain.id);
          const selectionIndex = selectedDomains.indexOf(domain.id);

          return (
            <div
              key={domain.id}
              role="button"
              tabIndex={0}
              onClick={() => onToggleDomain(domain.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onToggleDomain(domain.id);
                }
              }}
              className={`group relative rounded-xl p-4 sm:p-4.5 border transition-all cursor-pointer text-left card-hover-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
                isSelected
                  ? 'border-indigo-600/80 bg-gradient-to-br from-indigo-50/70 via-blue-50/30 to-white shadow-xs ring-2 ring-indigo-500/70'
                  : 'border-slate-200/80 bg-white hover:border-slate-300 hover:bg-slate-50/60 shadow-2xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-all duration-200 ${
                      isSelected
                        ? 'bg-gradient-to-br from-indigo-600 to-blue-600 text-white border-indigo-600 shadow-xs'
                        : 'bg-slate-100/80 text-slate-600 border-slate-200/80 group-hover:bg-white group-hover:text-indigo-600 group-hover:border-indigo-200'
                    }`}
                  >
                    {DOMAIN_ICONS[domain.id]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-950 transition-colors">
                        {domain.name}
                      </h4>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-indigo-600 text-white rounded font-mono shadow-2xs">
                          {selectionIndex === 0 ? 'Primary' : `#${selectionIndex + 1}`}
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">
                      {domain.category}
                    </span>
                  </div>
                </div>

                {/* Checkbox indicator */}
                <div
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all duration-200 shrink-0 ${
                    isSelected
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-2xs'
                      : 'border-slate-300 bg-white group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && (
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>

              <p className="text-[11px] text-slate-600 mt-2.5 line-clamp-2 leading-relaxed">
                {domain.description}
              </p>

              {/* Popular tools preview */}
              <div className="flex flex-wrap items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Tools:</span>
                {domain.popularStacks.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] bg-slate-100/80 text-slate-600 px-1.5 py-0.5 rounded font-mono border border-slate-200/50"
                  >
                    {tool}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
