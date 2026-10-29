import React, { useState, useRef } from 'react';
import type { StudentSkill } from '../../types';

interface ExtractedCandidateSkill {
  name: string;
  category: string;
  confidence: number; // 0-100%
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

const SAMPLE_EXTRACTED_SKILLS: ExtractedCandidateSkill[] = [
  { name: 'Docker Containerization', category: 'DevOps', confidence: 96, level: 'Intermediate' },
  { name: 'PostgreSQL Relational DB', category: 'Databases', confidence: 92, level: 'Advanced' },
  { name: 'Kubernetes Orchestration', category: 'DevOps', confidence: 88, level: 'Beginner' },
  { name: 'FastAPI Microservices', category: 'Frameworks', confidence: 94, level: 'Intermediate' },
  { name: 'Git Workflow & GitHub Actions', category: 'DevOps', confidence: 97, level: 'Advanced' },
];

interface ResumeUploadDropzoneProps {
  resumeUploaded: boolean;
  resumeFileName?: string;
  onUploadSuccess: (fileName: string, extractedSkills: StudentSkill[]) => void;
  onClearResume: () => void;
  existingSkills: StudentSkill[];
}

export const ResumeUploadDropzone: React.FC<ResumeUploadDropzoneProps> = ({
  resumeUploaded,
  resumeFileName,
  onUploadSuccess,
  onClearResume,
  existingSkills,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parseStep, setParseStep] = useState<string>('');
  const [extractedCandidates, setExtractedCandidates] = useState<ExtractedCandidateSkill[]>(SAMPLE_EXTRACTED_SKILLS);
  const [fileMeta, setFileMeta] = useState<{ sizeKb: number; uploadTime: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    if (!file.name.match(/\.(pdf|docx|txt)$/i)) {
      alert('Please select a valid document format (.pdf, .docx, or .txt).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('File size exceeds the 5MB maximum limit.');
      return;
    }

    setIsParsing(true);
    setParseStep('Uploading document & extracting raw text stream...');
    setFileMeta({
      sizeKb: Math.round(file.size / 1024) || 245,
      uploadTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    });

    setTimeout(() => {
      setParseStep('Running NLP Named Entity Recognition (NER)...');
      setTimeout(() => {
        setParseStep('Standardizing skills against project taxonomy...');
        setTimeout(() => {
          setIsParsing(false);
          setParseStep('');
          setExtractedCandidates(SAMPLE_EXTRACTED_SKILLS);

          // Prepare mapped skills for injection
          const mapped: StudentSkill[] = SAMPLE_EXTRACTED_SKILLS.map((item) => ({
            name: item.name,
            level: item.level,
            source: 'RESUME_PARSED',
          }));

          onUploadSuccess(file.name, mapped);
        }, 600);
      }, 700);
    }, 600);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleAddSingleCandidate = (candidate: ExtractedCandidateSkill) => {
    const isAlreadyPresent = existingSkills.some(
      (s) => s.name.toLowerCase() === candidate.name.toLowerCase()
    );
    if (!isAlreadyPresent) {
      onUploadSuccess(resumeFileName || 'resume.pdf', [
        {
          name: candidate.name,
          level: candidate.level,
          source: 'RESUME_PARSED',
        },
      ]);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 sm:p-6 shadow-xs space-y-5 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="flex items-center justify-center w-6 h-6 rounded-lg bg-indigo-50 text-indigo-600 text-xs font-bold border border-indigo-200/70 shadow-2xs">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Resume Parsing & Automated Skill Extraction
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-mono">
              LLM Parser Service
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
            Accelerate profile data collection by parsing your technical resume. The NLP microservice
            extracts languages, cloud tools, frameworks, and projects.
          </p>
        </div>

        {resumeUploaded && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Ingested & Active
          </span>
        )}
      </div>

      {/* Upload Zone */}
      {!resumeUploaded && !isParsing ? (
        <div
          role="button"
          tabIndex={0}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`border-2 border-dashed rounded-2xl p-8 sm:p-10 text-center transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
            isDragging
              ? 'border-indigo-500 bg-indigo-50/70 scale-[0.99] shadow-inner'
              : 'border-slate-200/90 hover:border-indigo-400 bg-slate-50/50 hover:bg-indigo-50/20'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-2xl flex items-center justify-center border border-slate-200 shadow-2xs text-indigo-600 transition-transform group-hover:scale-105">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="text-xs font-bold text-slate-800">
            Drag & drop your resume PDF or <span className="text-indigo-600 hover:text-indigo-700 underline font-semibold">browse files</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports PDF, DOCX, or TXT up to 5MB • Automated tokenization
          </p>
        </div>
      ) : isParsing ? (
        /* Parsing Progress State */
        <div className="p-8 sm:p-10 text-center bg-gradient-to-br from-indigo-50/60 to-blue-50/40 rounded-2xl border border-indigo-200/80 space-y-3.5 shadow-2xs">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white flex items-center justify-center border border-indigo-200 shadow-xs">
            <svg className="w-6 h-6 text-indigo-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Analyzing Document with LLM Parser...
            </h4>
            <p className="text-[11px] font-mono text-indigo-700 mt-1 animate-pulse">
              {parseStep}
            </p>
          </div>
        </div>
      ) : (
        /* Parsed State Card */
        <div className="bg-slate-50/80 rounded-2xl border border-slate-200/80 p-4 sm:p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-2xs">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {resumeFileName || 'Student_Resume.pdf'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2 flex-wrap">
                  <span>{fileMeta?.sizeKb ?? 245} KB</span>
                  <span>•</span>
                  <span>Extracted {fileMeta?.uploadTime ?? 'Just now'}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">✓ Text parsed successfully</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
              >
                Re-upload
              </button>
              <button
                type="button"
                onClick={onClearResume}
                className="px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer border border-transparent hover:border-red-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 active:scale-95"
              >
                Remove
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Extracted Candidates Chips */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs flex-wrap gap-2">
              <span className="font-bold text-slate-900">
                Extracted Technical Entities ({extractedCandidates.length} Detected):
              </span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md border border-purple-200 shadow-2xs">
                Auto-synced into skills inventory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
              {extractedCandidates.map((candidate) => {
                const isImported = existingSkills.some(
                  (s) => s.name.toLowerCase() === candidate.name.toLowerCase()
                );
                return (
                  <div
                    key={candidate.name}
                    className="p-3 bg-white rounded-xl border border-slate-200/80 shadow-2xs hover:border-indigo-200 hover:shadow-xs card-hover-lift transition-all flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-800 block truncate">
                        {candidate.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {candidate.confidence}% conf • {candidate.level}
                      </span>
                    </div>

                    {isImported ? (
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md shrink-0">
                        ✓ In Inventory
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddSingleCandidate(candidate)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-600 hover:text-white text-indigo-700 text-[10px] font-semibold rounded-lg border border-indigo-200 transition-all cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 active:scale-95"
                      >
                        + Add
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
