import React, { useState } from 'react';
import type { StudentProfile, StudentSkill, SkillLevel, StudentInputFormData } from '../types';

interface InputFormPageProps {
  student: StudentProfile | null;
  onSubmit: (data: StudentInputFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

const AVAILABLE_DOMAINS = [
  'Full-Stack Web Development',
  'Cloud Architecture & DevOps',
  'Applied Artificial Intelligence / Machine Learning',
  'Internet of Things (IoT) & Embedded Firmware',
  'Data Engineering & Big Data Systems',
  'Cybersecurity & Network Defense',
  'Mobile Application Development (Flutter/React Native)',
];

export const InputFormPage: React.FC<InputFormPageProps> = ({
  student,
  onSubmit,
  isSubmitting,
}) => {
  // Local state for inputs
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    student?.interests ?? ['Full-Stack Web Development', 'Cloud Architecture & DevOps']
  );
  const [skills, setSkills] = useState<StudentSkill[]>(
    student?.skills ?? [
      { name: 'JavaScript / TypeScript', level: 'Advanced', source: 'SELF_REPORTED' },
      { name: 'React.js', level: 'Intermediate', source: 'SELF_REPORTED' },
      { name: 'Database Management Systems (DBMS)', level: 'Advanced', source: 'ERP_COURSEWORK' },
    ]
  );
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState<SkillLevel>('Intermediate');
  const [preferredRole, setPreferredRole] = useState('Full-Stack Cloud Engineer');
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [learningPace, setLearningPace] = useState<'Self-Paced' | 'Intensive' | 'Balanced'>('Balanced');
  const [resumeUploaded, setResumeUploaded] = useState(student?.resumeUploaded ?? false);
  const [resumeFileName, setResumeFileName] = useState(student?.resumeFileName ?? '');
  const [isSimulatingParse, setIsSimulatingParse] = useState(false);

  // Validation state
  const [errors, setErrors] = useState<{ domains?: string; skills?: string; hours?: string }>({});

  const toggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
    if (errors.domains) {
      setErrors((prev) => ({ ...prev, domains: undefined }));
    }
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    if (skills.some((s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase())) {
      alert('This skill is already listed.');
      return;
    }

    setSkills((prev) => [
      ...prev,
      {
        name: newSkillName.trim(),
        level: newSkillLevel,
        source: 'SELF_REPORTED',
      },
    ]);
    setNewSkillName('');
    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  const handleRemoveSkill = (skillName: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== skillName));
  };

  const handleUpdateSkillLevel = (skillName: string, level: SkillLevel) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, level } : s))
    );
  };

  const handleSimulateResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsSimulatingParse(true);
    setTimeout(() => {
      setResumeUploaded(true);
      setResumeFileName(file.name);
      setIsSimulatingParse(false);
      // Auto-extract Python Basics and Docker if not present
      if (!skills.some((s) => s.name.includes('Docker'))) {
        setSkills((prev) => [
          ...prev,
          { name: 'Docker Containerization', level: 'Beginner', source: 'RESUME_PARSED' },
        ]);
      }
    }, 1000);
  };

  const validate = (): boolean => {
    const newErrors: { domains?: string; skills?: string; hours?: string } = {};

    if (selectedDomains.length === 0) {
      newErrors.domains = 'Please select at least 1 career interest domain.';
    }
    if (skills.length < 2) {
      newErrors.skills = 'Please declare at least 2 technical skills.';
    }
    if (weeklyHours <= 0 || isNaN(weeklyHours)) {
      newErrors.hours = 'Commitment hours must be at least 1 hour/week.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: StudentInputFormData = {
      selectedDomains,
      skills,
      preferredRole,
      weeklyCommitmentHours: weeklyHours,
      learningPace,
      resumeUploaded,
      resumeFileName,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overview Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
        <h2 className="text-base font-bold text-slate-900">
          Student Input & Technical Profile Questionnaire
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          These declared inputs are vectorized alongside your verified college ERP academic records
          to feed into the Random Forest recommendation model.
        </p>
      </div>

      {/* Section 1: Career Interest Domains */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              1. Career Aspirations & Target Domains
            </h3>
            <p className="text-xs text-slate-500">
              Select one or more domains you wish to pursue for capstone projects or campus placements.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {selectedDomains.length} selected
          </span>
        </div>

        {errors.domains && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {errors.domains}
          </div>
        )}

        <div className="flex flex-wrap gap-2 pt-1">
          {AVAILABLE_DOMAINS.map((domain) => {
            const isSelected = selectedDomains.includes(domain);
            return (
              <button
                key={domain}
                type="button"
                onClick={() => toggleDomain(domain)}
                className={`px-3.5 py-2 rounded-lg text-xs font-medium border transition cursor-pointer flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                }`}
              >
                <span>{domain}</span>
                {isSelected && (
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Section 2: Technical Skills Self-Assessment */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              2. Technical Skills Inventory & Proficiency
            </h3>
            <p className="text-xs text-slate-500">
              Rate your proficiency. Skills tagged as [ERP] are pre-verified via past coursework.
            </p>
          </div>
          <span className="text-xs font-mono text-slate-500">
            {skills.length} skills recorded
          </span>
        </div>

        {errors.skills && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
            {errors.skills}
          </div>
        )}

        {/* Add Skill Mini-Form */}
        <div className="flex flex-col sm:flex-row items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
          <input
            type="text"
            placeholder="Add new skill (e.g. Next.js, Docker, MongoDB)..."
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            className="w-full sm:flex-1 bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-blue-500"
          />
          <select
            value={newSkillLevel}
            onChange={(e) => setNewSkillLevel(e.target.value as SkillLevel)}
            className="w-full sm:w-auto bg-white border border-slate-200 rounded-md px-3 py-1.5 text-xs text-slate-700"
          >
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <button
            type="button"
            onClick={handleAddSkill}
            className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-xs transition"
          >
            + Add Skill
          </button>
        </div>

        {/* Existing Skills List */}
        <div className="space-y-2 pt-2">
          {skills.map((skill) => (
            <div
              key={skill.name}
              className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition"
            >
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-900">{skill.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded font-mono font-medium ${
                    skill.source === 'ERP_COURSEWORK'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : skill.source === 'RESUME_PARSED'
                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {skill.source === 'ERP_COURSEWORK'
                    ? 'ERP Coursework'
                    : skill.source === 'RESUME_PARSED'
                    ? 'Resume Ingested'
                    : 'Self-Reported'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* Level selector buttons */}
                <div className="flex items-center bg-slate-100 rounded-md p-0.5 text-[11px]">
                  {(['Beginner', 'Intermediate', 'Advanced'] as SkillLevel[]).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => handleUpdateSkillLevel(skill.name, lvl)}
                      className={`px-2 py-0.5 rounded font-medium transition cursor-pointer ${
                        skill.level === lvl
                          ? 'bg-white text-blue-700 shadow-xs'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.name)}
                  className="text-slate-400 hover:text-red-500 p-1 transition"
                  title="Remove skill"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 3: Learning Preferences & Target Role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            3. Career Objective & Workload Commitment
          </h3>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Target Technical Role
            </label>
            <input
              type="text"
              value={preferredRole}
              onChange={(e) => setPreferredRole(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 focus:outline-blue-500"
              placeholder="e.g. Cloud Solutions Architect, Full-Stack Developer"
            />
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Weekly Dedicated Study Hours: <span className="font-bold text-blue-600">{weeklyHours} hrs/week</span>
            </label>
            <input
              type="range"
              min={5}
              max={40}
              step={5}
              value={weeklyHours}
              onChange={(e) => setWeeklyHours(Number(e.target.value))}
              className="w-full accent-blue-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>5 hrs (Part-time)</span>
              <span>20 hrs (Recommended)</span>
              <span>40 hrs (Intensive Boot-up)</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-600 font-medium block mb-1">
              Learning Pace Strategy
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Self-Paced', 'Balanced', 'Intensive'] as const).map((pace) => (
                <button
                  key={pace}
                  type="button"
                  onClick={() => setLearningPace(pace)}
                  className={`py-2 text-xs font-medium rounded-lg border text-center transition cursor-pointer ${
                    learningPace === pace
                      ? 'bg-blue-50 border-blue-500 text-blue-700 font-semibold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {pace}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Section 4: Resume Ingestion & Parsing */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">
            4. Resume Parsing Accelerator (Optional)
          </h3>
          <p className="text-xs text-slate-500">
            Upload your technical resume (PDF) to auto-extract programming languages, frameworks, and tools.
          </p>

          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-blue-400 transition bg-slate-50/50">
            <svg
              className="w-8 h-8 text-slate-400 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>

            {isSimulatingParse ? (
              <div className="text-xs text-blue-600 font-semibold flex items-center justify-center gap-2">
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
                Parsing Resume with NLP Service...
              </div>
            ) : resumeUploaded ? (
              <div className="text-xs text-emerald-700 font-medium">
                ✓ Ingested: <span className="font-mono">{resumeFileName}</span>
                <span className="block text-[11px] text-slate-500 mt-1">
                  Extracted 6 tools into your skills inventory
                </span>
              </div>
            ) : (
              <div>
                <label className="cursor-pointer text-xs font-semibold text-blue-600 hover:text-blue-700">
                  <span>Click to select PDF resume</span>
                  <input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleSimulateResumeUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[11px] text-slate-400 mt-1">PDF or DOCX up to 5MB</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submit Action Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="text-xs text-slate-500">
          Ready to evaluate model with{' '}
          <strong className="text-slate-800">{selectedDomains.length} domains</strong> and{' '}
          <strong className="text-slate-800">{skills.length} verified/declared skills</strong>.
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {isSubmitting ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Running Random Forest Microservice...
            </>
          ) : (
            'Save Profile & Generate Recommendations →'
          )}
        </button>
      </div>
    </form>
  );
};
