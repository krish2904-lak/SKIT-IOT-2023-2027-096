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
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200">
              5
            </span>
            <h3 className="text-sm font-bold text-slate-900">
              Resume Parsing & Automated Skill Extraction
            </h3>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded">
              LLM Parser Service
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Accelerate profile data collection by parsing your technical resume. The NLP microservice
            extracts languages, cloud tools, frameworks, and projects.
          </p>
        </div>

        {resumeUploaded && (
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Ingested & Active
          </span>
        )}
      </div>

      {/* Upload Zone */}
      {!resumeUploaded && !isParsing ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition cursor-pointer ${
            isDragging
              ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
              : 'border-slate-200 hover:border-blue-400 bg-slate-50/50 hover:bg-slate-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="w-12 h-12 mx-auto mb-3 bg-white rounded-full flex items-center justify-center border border-slate-200 shadow-2xs text-blue-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div className="text-xs font-bold text-slate-800">
            Drag & drop your resume PDF or <span className="text-blue-600 hover:underline">browse files</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Supports PDF, DOCX, or TXT up to 5MB • Automated tokenization
          </p>
        </div>
      ) : isParsing ? (
        /* Parsing Progress State */
        <div className="p-8 text-center bg-blue-50/40 rounded-xl border border-blue-200 space-y-3">
          <div className="w-10 h-10 mx-auto rounded-full bg-white flex items-center justify-center border border-blue-300 shadow-2xs">
            <svg className="w-5 h-5 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Analyzing Document with LLM Parser...
            </h4>
            <p className="text-[11px] font-mono text-blue-700 mt-1 animate-pulse">
              {parseStep}
            </p>
          </div>
        </div>
      ) : (
        /* Parsed State Card */
        <div className="bg-slate-50/70 rounded-xl border border-slate-200 p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-lg border border-slate-200">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold text-slate-900 truncate">
                  {resumeFileName || 'Student_Resume.pdf'}
                </div>
                <div className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-2">
                  <span>{fileMeta?.sizeKb ?? 245} KB</span>
                  <span>•</span>
                  <span>Extracted {fileMeta?.uploadTime ?? 'Just now'}</span>
                  <span>•</span>
                  <span className="text-emerald-700 font-medium">Text parsed successfully</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition cursor-pointer"
              >
                Re-upload
              </button>
              <button
                type="button"
                onClick={onClearResume}
                className="px-2.5 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded-md transition cursor-pointer"
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
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-800">
                Extracted Technical Entities ({extractedCandidates.length} Detected):
              </span>
              <span className="text-[10px] font-mono text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200">
                Auto-synced into skills inventory
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {extractedCandidates.map((candidate) => {
                const isImported = existingSkills.some(
                  (s) => s.name.toLowerCase() === candidate.name.toLowerCase()
                );
                return (
                  <div
                    key={candidate.name}
                    className="p-2.5 bg-white rounded-lg border border-slate-200 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <span className="text-xs font-semibold text-slate-800 block truncate">
                        {candidate.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {candidate.confidence}% confidence • {candidate.level}
                      </span>
                    </div>

                    {isImported ? (
                      <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded shrink-0">
                        ✓ In Inventory
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleAddSingleCandidate(candidate)}
                        className="px-2 py-0.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 text-[10px] font-semibold rounded border border-blue-200 transition cursor-pointer shrink-0"
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
