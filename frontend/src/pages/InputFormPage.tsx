import React, { useState } from 'react';
import type { StudentProfile, StudentSkill, SkillLevel, StudentInputFormData, AcademicScoresData } from '../types';
import { DomainInterestPicker } from '../components/inputs/DomainInterestPicker';
import { SkillInputCollector } from '../components/inputs/SkillInputCollector';
import { AcademicProjectMilestones } from '../components/inputs/AcademicProjectMilestones';
import { WorkloadCommitmentCollector } from '../components/inputs/WorkloadCommitmentCollector';
import { ResumeUploadDropzone } from '../components/inputs/ResumeUploadDropzone';
import { ProfileReadinessCard } from '../components/inputs/ProfileReadinessCard';

interface InputFormPageProps {
  student: StudentProfile | null;
  onSubmit: (data: StudentInputFormData) => Promise<boolean>;
  isSubmitting: boolean;
}

export const InputFormPage: React.FC<InputFormPageProps> = ({
  student,
  onSubmit,
  isSubmitting,
}) => {
  // Local state for inputs
  const [selectedDomains, setSelectedDomains] = useState<string[]>(
    student?.interests ?? [
      'Full-Stack Web Development',
      'Internet of Things (IoT) & Embedded Firmware',
      'Applied Artificial Intelligence / Machine Learning',
    ]
  );

  const [skills, setSkills] = useState<StudentSkill[]>(
    student?.skills ?? [
      { name: 'JavaScript / TypeScript', level: 'Advanced', source: 'SELF_REPORTED' },
      { name: 'React.js', level: 'Intermediate', source: 'SELF_REPORTED' },
      { name: 'Database Management Systems (DBMS)', level: 'Advanced', source: 'ERP_COURSEWORK' },
      { name: 'Computer Networks & IoT Protocols', level: 'Intermediate', source: 'ERP_COURSEWORK' },
    ]
  );

  const [preferredRole, setPreferredRole] = useState(
    'Full-Stack Cloud Engineer'
  );
  const [weeklyHours, setWeeklyHours] = useState<number>(15);
  const [learningPace, setLearningPace] = useState<'Self-Paced' | 'Intensive' | 'Balanced'>('Balanced');
  const [resumeUploaded, setResumeUploaded] = useState(student?.resumeUploaded ?? false);
  const [resumeFileName, setResumeFileName] = useState(student?.resumeFileName ?? '');
  const [projectsCompleted, setProjectsCompleted] = useState<number>(student?.projectsCompleted ?? 3);
  const [certificationsCount, setCertificationsCount] = useState<number>(student?.certificationsCount ?? 2);
  const [academicScores] = useState<AcademicScoresData | undefined>(student?.academicScores);

  // Sync state if student prop changes to a different identity
  const [prevStudentId, setPrevStudentId] = useState(student?.id ?? null);
  if (student && student.id !== prevStudentId) {
    setPrevStudentId(student.id);
    setSelectedDomains(student.interests ?? []);
    setSkills(student.skills ?? []);
    setResumeUploaded(student.resumeUploaded ?? false);
    setResumeFileName(student.resumeFileName ?? '');
    setProjectsCompleted(student.projectsCompleted ?? 3);
    setCertificationsCount(student.certificationsCount ?? 2);
  }

  // Validation state
  const [errors, setErrors] = useState<{ domains?: string; skills?: string; hours?: string; role?: string }>({});
  const [activeSection, setActiveSection] = useState<'all' | 'domains' | 'skills' | 'milestones' | 'workload' | 'resume'>('all');

  // Toggle domain
  const handleToggleDomain = (domain: string) => {
    setSelectedDomains((prev) =>
      prev.includes(domain) ? prev.filter((d) => d !== domain) : [...prev, domain]
    );
    if (errors.domains) {
      setErrors((prev) => ({ ...prev, domains: undefined }));
    }
  };

  // Add skill
  const handleAddSkill = (newSkill: StudentSkill) => {
    setSkills((prev) => {
      if (prev.some((s) => s.name.toLowerCase() === newSkill.name.toLowerCase())) {
        return prev;
      }
      return [...prev, newSkill];
    });
    if (errors.skills) {
      setErrors((prev) => ({ ...prev, skills: undefined }));
    }
  };

  // Remove skill
  const handleRemoveSkill = (skillName: string) => {
    setSkills((prev) => prev.filter((s) => s.name !== skillName));
  };

  // Update skill level
  const handleUpdateSkillLevel = (skillName: string, level: SkillLevel) => {
    setSkills((prev) =>
      prev.map((s) => (s.name === skillName ? { ...s, level } : s))
    );
  };

  // Resume upload success handler
  const handleResumeUploadSuccess = (fileName: string, extractedSkills: StudentSkill[]) => {
    setResumeUploaded(true);
    setResumeFileName(fileName);

    // Merge extracted skills without duplicates
    setSkills((prev) => {
      const existingNames = new Set(prev.map((s) => s.name.toLowerCase()));
      const newItems = extractedSkills.filter((s) => !existingNames.has(s.name.toLowerCase()));
      return [...prev, ...newItems];
    });
  };

  // Clear resume
  const handleClearResume = () => {
    setResumeUploaded(false);
    setResumeFileName('');
    // Optionally remove skills that were sourced from resume
    setSkills((prev) => prev.filter((s) => s.source !== 'RESUME_PARSED'));
  };

  // Load demo profile for testing/review
  const handleLoadDemoProfile = () => {
    setSelectedDomains([
      'Full-Stack Web Development',
      'Internet of Things (IoT) & Embedded Firmware',
      'Applied Artificial Intelligence / Machine Learning',
    ]);
    setSkills([
      { name: 'JavaScript / TypeScript', level: 'Advanced', source: 'SELF_REPORTED' },
      { name: 'React.js', level: 'Advanced', source: 'SELF_REPORTED' },
      { name: 'Database Management Systems (DBMS)', level: 'Advanced', source: 'ERP_COURSEWORK' },
      { name: 'Computer Networks & IoT Protocols', level: 'Intermediate', source: 'ERP_COURSEWORK' },
      { name: 'ESP32 Microcontroller', level: 'Intermediate', source: 'SELF_REPORTED' },
      { name: 'Python Basics', level: 'Intermediate', source: 'RESUME_PARSED' },
      { name: 'Docker Containerization', level: 'Beginner', source: 'RESUME_PARSED' },
    ]);
    setPreferredRole('Full-Stack Cloud Engineer');
    setWeeklyHours(20);
    setLearningPace('Balanced');
    setProjectsCompleted(4);
    setCertificationsCount(2);
    setResumeUploaded(true);
    setResumeFileName('Prachi_Bhardwaj_Resume_2026.pdf');
    setErrors({});
  };

  // Reset to ERP baseline
  const handleResetBaseline = () => {
    setSelectedDomains(['Full-Stack Web Development']);
    setSkills(
      student?.skills.filter((s) => s.source === 'ERP_COURSEWORK') ?? [
        { name: 'Database Management Systems (DBMS)', level: 'Advanced', source: 'ERP_COURSEWORK' },
        { name: 'Computer Networks & IoT Protocols', level: 'Intermediate', source: 'ERP_COURSEWORK' },
      ]
    );
    setPreferredRole('Software Engineer');
    setWeeklyHours(15);
    setLearningPace('Balanced');
    setProjectsCompleted(1);
    setCertificationsCount(0);
    setResumeUploaded(false);
    setResumeFileName('');
    setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: { domains?: string; skills?: string; hours?: string; role?: string } = {};

    if (selectedDomains.length === 0) {
      newErrors.domains = 'Please select at least 1 career interest domain.';
    }
    if (skills.length < 2) {
      newErrors.skills = 'Please declare at least 2 technical skills.';
    }
    if (weeklyHours <= 0 || isNaN(weeklyHours)) {
      newErrors.hours = 'Commitment hours must be at least 1 hour/week.';
    }
    if (!preferredRole.trim()) {
      newErrors.role = 'Please specify a target professional role.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const payload: StudentInputFormData = {
      selectedDomains,
      skills,
      preferredRole,
      weeklyCommitmentHours: weeklyHours,
      learningPace,
      resumeUploaded,
      resumeFileName,
      projectsCompleted,
      certificationsCount,
      academicScores,
    };

    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pb-20">
      {/* Overview Info Banner */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 uppercase tracking-wider">
              Sprint 2 Data Collection Engine
            </span>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              ERP + Student + Resume
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 mt-1.5">
            Student Profile & Technical Input Questionnaire
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Vectorize your technical proficiencies, career aspirations, and project milestones alongside
            verified SKIT ERP academic records to generate personalized tech-stack recommendations.
          </p>
        </div>

        {/* Section anchor filter tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs self-start md:self-auto overflow-x-auto">
          {[
            { id: 'all', label: 'All Fields' },
            { id: 'domains', label: '1. Domains' },
            { id: 'skills', label: '2. Skills' },
            { id: 'milestones', label: '3. Milestones' },
            { id: 'workload', label: '4. Workload' },
            { id: 'resume', label: '5. Resume' },
          ].map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id as any)}
              className={`px-2.5 py-1 rounded-md font-medium transition cursor-pointer whitespace-nowrap ${
                activeSection === sec.id
                  ? 'bg-white text-blue-700 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {sec.label}
            </button>
          ))}
        </div>
      </div>

      {/* Vector Readiness Health Card */}
      <ProfileReadinessCard
        hasErpLinked={Boolean(student?.erpCourses && student.erpCourses.length > 0)}
        selectedDomainsCount={selectedDomains.length}
        skills={skills}
        hasRoleConfigured={Boolean(preferredRole.trim())}
        resumeUploaded={resumeUploaded}
        onLoadDemoProfile={handleLoadDemoProfile}
        onResetBaseline={handleResetBaseline}
      />

      {/* Section 1: Career Domains */}
      {(activeSection === 'all' || activeSection === 'domains') && (
        <DomainInterestPicker
          selectedDomains={selectedDomains}
          onToggleDomain={handleToggleDomain}
          onSetDomains={setSelectedDomains}
          error={errors.domains}
        />
      )}

      {/* Section 2: Technical Skills Inventory */}
      {(activeSection === 'all' || activeSection === 'skills') && (
        <SkillInputCollector
          skills={skills}
          selectedDomains={selectedDomains}
          onAddSkill={handleAddSkill}
          onRemoveSkill={handleRemoveSkill}
          onUpdateLevel={handleUpdateSkillLevel}
          error={errors.skills}
        />
      )}

      {/* Section 3: Project Milestones & ERP Alignment */}
      {(activeSection === 'all' || activeSection === 'milestones') && (
        <AcademicProjectMilestones
          projectsCompleted={projectsCompleted}
          onChangeProjects={setProjectsCompleted}
          certificationsCount={certificationsCount}
          onChangeCertifications={setCertificationsCount}
          academicScores={academicScores}
        />
      )}

      {/* Section 4: Workload & Learning Strategy */}
      {(activeSection === 'all' || activeSection === 'workload') && (
        <WorkloadCommitmentCollector
          preferredRole={preferredRole}
          onChangeRole={(role) => {
            setPreferredRole(role);
            if (errors.role) setErrors((prev) => ({ ...prev, role: undefined }));
          }}
          weeklyHours={weeklyHours}
          onChangeWeeklyHours={(hours) => {
            setWeeklyHours(hours);
            if (errors.hours) setErrors((prev) => ({ ...prev, hours: undefined }));
          }}
          learningPace={learningPace}
          onChangeLearningPace={setLearningPace}
          error={errors.role || errors.hours}
        />
      )}

      {/* Section 5: Resume Parser */}
      {(activeSection === 'all' || activeSection === 'resume') && (
        <ResumeUploadDropzone
          resumeUploaded={resumeUploaded}
          resumeFileName={resumeFileName}
          onUploadSuccess={handleResumeUploadSuccess}
          onClearResume={handleClearResume}
          existingSkills={skills}
        />
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-6 py-3.5 shadow-lg">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3 text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Input Vector:</span>
            </span>
            <span className="font-semibold text-slate-900">
              {selectedDomains.length} Domains
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-900">
              {skills.length} Skills
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-900">
              {projectsCompleted} Projects
            </span>
            <span>•</span>
            <span className="font-semibold text-slate-900">
              {weeklyHours} hrs/wk
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={handleResetBaseline}
              className="px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
            >
              Reset
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-xs font-bold shadow-xs transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  <span>Processing Random Forest Model...</span>
                </>
              ) : (
                <>
                  <span>Save Profile & Generate Recommendations</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};
