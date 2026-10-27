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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header and counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              1
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Career Aspirations & Target Domains
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Feature Vector 1
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Choose domains you wish to pursue for capstone projects, internships, or placements.
            These preferences are sent as part of your recommendation request.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium flex items-center gap-1.5 border ${
              selectedDomains.length >= 1 && selectedDomains.length <= 4
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : selectedDomains.length > 4
                ? 'bg-amber-50 text-amber-700 border-amber-200'
                : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                selectedDomains.length >= 1 ? 'bg-emerald-500' : 'bg-slate-400'
              }`}
            />
            <span>{selectedDomains.length} Selected</span>
            <span className="text-[10px] text-slate-400">/ 1–4 optimal</span>
          </div>
        </div>
      </div>

      {/* Preset shortcut bars & search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
          <span className="text-[11px] font-medium text-slate-400 mr-1 shrink-0">Presets:</span>
          {onSetDomains && (
            <>
              <button
                type="button"
                onClick={() => handleApplyPreset('iot-web')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 transition cursor-pointer shrink-0 border border-slate-200 hover:border-blue-300"
              >
                IoT + Web + AI (CSE-IoT)
              </button>
              <button
                type="button"
                onClick={() => handleApplyPreset('cloud-data')}
                className="px-2.5 py-1 text-[11px] font-medium rounded-md bg-slate-100 hover:bg-cyan-50 hover:text-cyan-700 text-slate-700 transition cursor-pointer shrink-0 border border-slate-200 hover:border-cyan-300"
              >
                Cloud + Data + Security
              </button>
              {selectedDomains.length > 0 && (
                <button
                  type="button"
                  onClick={() => handleApplyPreset('clear')}
                  className="px-2 py-1 text-[11px] text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer shrink-0"
                >
                  Clear
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
            className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500 focus:bg-white transition"
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
            className={`px-3 py-1 rounded-full text-xs font-medium transition cursor-pointer whitespace-nowrap ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
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
              onClick={() => onToggleDomain(domain.id)}
              className={`group relative rounded-xl p-4 border transition-all cursor-pointer text-left ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 shadow-xs ring-1 ring-blue-500'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 border transition ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-100 text-slate-600 border-slate-200 group-hover:bg-white group-hover:text-blue-600'
                      }`}
                    >
                      {DOMAIN_ICONS[domain.id]}
                    </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-xs font-bold text-slate-900">{domain.name}</h4>
                      {isSelected && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 bg-blue-600 text-white rounded font-mono">
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
                  className={`w-5 h-5 rounded-md flex items-center justify-center border transition shrink-0 ${
                    isSelected
                      ? 'bg-blue-600 border-blue-600 text-white'
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
              <div className="flex flex-wrap items-center gap-1 mt-3 pt-2.5 border-t border-slate-100">
                <span className="text-[10px] text-slate-400 font-medium mr-1">Tools:</span>
                {domain.popularStacks.map((tool) => (
                  <span
                    key={tool}
                    className="text-[10px] bg-slate-100/80 text-slate-600 px-1.5 py-0.5 rounded font-mono"
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
