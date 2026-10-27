import React, { useState, useMemo, useRef, useEffect } from 'react';
import type { StudentSkill, SkillLevel } from '../../types';
import { CANONICAL_SKILLS_TAXONOMY } from './taxonomy';

// Mapping from interest domains to recommended starter skills
const DOMAIN_RECOMMENDED_SKILLS: Record<string, string[]> = {
  'Full-Stack Web Development': ['JavaScript', 'TypeScript', 'React.js', 'Node.js', 'MongoDB'],
  'Applied Artificial Intelligence / Machine Learning': ['Python', 'PyTorch', 'Scikit-Learn', 'SQL', 'FastAPI'],
  'Cloud Architecture & DevOps': ['Docker', 'Kubernetes', 'AWS Cloud Services', 'Linux System Administration'],
  'Internet of Things (IoT) & Embedded Firmware': ['ESP32 Microcontroller', 'Arduino Platform', 'MQTT Protocol', 'C++'],
  'Data Engineering & Big Data Systems': ['SQL', 'Python', 'PostgreSQL', 'Docker'],
  'Cybersecurity & Network Defense': ['Linux System Administration', 'Python', 'C Language'],
  'Mobile Application Development (Flutter/React Native)': ['Dart', 'Flutter', 'React.js', 'Node.js'],
};

interface SkillInputCollectorProps {
  skills: StudentSkill[];
  selectedDomains: string[];
  onAddSkill: (skill: StudentSkill) => void;
  onRemoveSkill: (skillName: string) => void;
  onUpdateLevel: (skillName: string, level: SkillLevel) => void;
  error?: string;
}

export const SkillInputCollector: React.FC<SkillInputCollectorProps> = ({
  skills,
  selectedDomains,
  onAddSkill,
  onRemoveSkill,
  onUpdateLevel,
  error,
}) => {
  const [query, setQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<SkillLevel>('Intermediate');
  const [isOpenSuggestions, setIsOpenSuggestions] = useState(false);
  const [searchSkillsList, setSearchSkillsList] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpenSuggestions(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter autocomplete suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const existingSkillNames = new Set(skills.map((s) => s.name.toLowerCase()));

    return CANONICAL_SKILLS_TAXONOMY.filter(
      (item) =>
        !existingSkillNames.has(item.name.toLowerCase()) &&
        (item.name.toLowerCase().includes(q) ||
          item.aliases.some((alias) => alias.toLowerCase().includes(q)) ||
          item.category.toLowerCase().includes(q))
    ).slice(0, 6);
  }, [query, skills]);

  // Context-aware recommended skills to quick-add
  const recommendedSkills = useMemo(() => {
    const existingNames = new Set(skills.map((s) => s.name.toLowerCase()));
    const candidates = new Set<string>();

    selectedDomains.forEach((domain) => {
      const list = DOMAIN_RECOMMENDED_SKILLS[domain] || [];
      list.forEach((skill) => {
        if (!existingNames.has(skill.toLowerCase())) {
          candidates.add(skill);
        }
      });
    });

    return Array.from(candidates).slice(0, 6);
  }, [selectedDomains, skills]);

  const handleSelectSuggestion = (name: string) => {
    onAddSkill({
      name,
      level: selectedLevel,
      source: 'SELF_REPORTED',
    });
    setQuery('');
    setIsOpenSuggestions(false);
  };

  const handleManualAdd = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) return;

    if (skills.some((s) => s.name.toLowerCase() === trimmed.toLowerCase())) {
      alert(`"${trimmed}" is already in your skills inventory.`);
      return;
    }

    onAddSkill({
      name: trimmed,
      level: selectedLevel,
      source: 'SELF_REPORTED',
    });
    setQuery('');
    setIsOpenSuggestions(false);
  };

  // Filtered skills list
  const filteredSkills = useMemo(() => {
    return skills.filter((s) => {
      const matchesSearch = s.name.toLowerCase().includes(searchSkillsList.toLowerCase());
      return matchesSearch;
    });
  }, [skills, searchSkillsList]);

  // Stats calculation
  const stats = useMemo(() => {
    return {
      advanced: skills.filter((s) => s.level === 'Advanced').length,
      intermediate: skills.filter((s) => s.level === 'Intermediate').length,
      beginner: skills.filter((s) => s.level === 'Beginner').length,
    };
  }, [skills]);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-5">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              2
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Technical Skills Inventory & Proficiency Ratings
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
              Feature Vector 2
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Declare your own technical proficiency levels. Imported ERP and resume skills are shown separately and cannot be relabeled here.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`text-xs px-2.5 py-1 rounded-full font-mono font-medium border ${
              skills.length >= 2
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-amber-50 text-amber-700 border-amber-200'
            }`}
          >
            {skills.length} Skills Recorded (min 2)
          </span>
        </div>
      </div>

      {/* Recommended skills quick-add bar */}
      {recommendedSkills.length > 0 && (
        <div className="p-3 bg-blue-50/50 rounded-xl border border-blue-100 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="text-xs text-blue-900 font-semibold flex items-center gap-1.5 shrink-0">
            <span className="text-blue-500">✨</span>
            <span>Suggested for your domains:</span>
          </div>
          <div className="flex flex-wrap items-center gap-1.5">
            {recommendedSkills.map((rec) => (
              <button
                key={rec}
                type="button"
                onClick={() => onAddSkill({ name: rec, level: 'Intermediate', source: 'SELF_REPORTED' })}
                className="px-2 py-0.5 text-[11px] font-medium rounded-md bg-white hover:bg-blue-600 hover:text-white text-blue-800 border border-blue-200 shadow-2xs transition cursor-pointer flex items-center gap-1"
              >
                <span>+ {rec}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Skill Input Form */}
      <form onSubmit={handleManualAdd} className="relative">
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
          {/* Autocomplete input */}
          <div className="sm:col-span-6 relative">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Add Skill Name
            </label>
            <input
              ref={inputRef}
              type="text"
              placeholder="e.g. Docker, PyTorch, MongoDB, React..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpenSuggestions(true);
              }}
              onFocus={() => setIsOpenSuggestions(true)}
              className="w-full bg-white border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500 focus:border-blue-500"
            />

            {/* Dropdown suggestions */}
            {isOpenSuggestions && suggestions.length > 0 && (
              <div
                ref={dropdownRef}
                className="absolute left-0 right-0 top-full mt-1 bg-white rounded-lg border border-slate-200 shadow-lg z-30 overflow-hidden divide-y divide-slate-100"
              >
                <div className="px-3 py-1 bg-slate-50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Standardized Skill Taxonomy
                </div>
                {suggestions.map((item) => (
                  <button
                    key={item.name}
                    type="button"
                    onClick={() => handleSelectSuggestion(item.name)}
                    className="w-full px-3 py-2 text-left text-xs hover:bg-blue-50 flex items-center justify-between transition cursor-pointer"
                  >
                    <span className="font-medium text-slate-800">{item.name}</span>
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                      {item.category}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Proficiency selector */}
          <div className="sm:col-span-3">
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              Proficiency Level
            </label>
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value as SkillLevel)}
              className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 focus:outline-blue-500"
            >
              <option value="Beginner">Beginner (Foundations)</option>
              <option value="Intermediate">Intermediate (Project Ready)</option>
              <option value="Advanced">Advanced (Production Grade)</option>
            </select>
          </div>

          {/* Submit button */}
          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              disabled={!query.trim()}
              className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-semibold shadow-xs transition cursor-pointer flex items-center justify-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Add Skill</span>
            </button>
          </div>
        </div>
      </form>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
          <svg className="w-4 h-4 shrink-0 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Inventory filter tabs & search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
        <div className="text-xs text-slate-500">
          {skills.length} self-reported skills
        </div>

        <div className="relative w-full sm:w-48">
          <input
            type="text"
            placeholder="Search declared..."
            value={searchSkillsList}
            onChange={(e) => setSearchSkillsList(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-md pl-7 pr-2.5 py-1 text-[11px] text-slate-900 placeholder:text-slate-400 focus:outline-blue-500"
          />
          <svg
            className="w-3 h-3 text-slate-400 absolute left-2 top-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Skills list table/card view */}
      {filteredSkills.length === 0 ? (
        <div className="p-8 text-center bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
          <p className="text-xs text-slate-500">
            {skills.length === 0
              ? 'No skills added yet. Use the autocomplete field or quick suggestions above.'
              : 'No skills match the selected filter.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {filteredSkills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-white hover:border-blue-200 hover:shadow-2xs transition"
            >
              <div className="flex flex-col gap-1 min-w-0 pr-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900 truncate">
                    {skill.name}
                  </span>
                  <span className="text-[9px] rounded border border-blue-200 bg-blue-50 px-1.5 py-0.2 font-semibold text-blue-700">
                    Self-reported
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-mono">
                  <span>Proficiency:</span>
                  <span
                    className={`font-semibold ${
                      skill.level === 'Advanced'
                        ? 'text-emerald-600'
                        : skill.level === 'Intermediate'
                        ? 'text-blue-600'
                        : 'text-amber-600'
                    }`}
                  >
                    {skill.level}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {/* Level toggle pill */}
                <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[10px]">
                  {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => onUpdateLevel(skill.name, lvl)}
                      className={`px-1.5 py-0.5 rounded font-medium transition cursor-pointer ${
                        skill.level === lvl
                          ? lvl === 'Advanced'
                            ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                            : lvl === 'Intermediate'
                            ? 'bg-blue-600 text-white shadow-2xs font-bold'
                            : 'bg-amber-600 text-white shadow-2xs font-bold'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                      title={`Set level to ${lvl}`}
                    >
                      {lvl.slice(0, 3)}
                    </button>
                  ))}
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => onRemoveSkill(skill.name)}
                  className="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition cursor-pointer"
                  title="Remove skill"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Advanced: {stats.advanced}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>Intermediate: {stats.intermediate}</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Beginner: {stats.beginner}</span>
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-mono">
          Proficiency values are self-reported
        </span>
      </div>
    </div>
  );
};
