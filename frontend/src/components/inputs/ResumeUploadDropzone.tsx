import React, { useRef, useState } from 'react';

interface ResumeUploadDropzoneProps {
  resumeUploaded: boolean;
  resumeFileName?: string;
  onUploadFile: (file: File) => Promise<boolean>;
}

export const ResumeUploadDropzone: React.FC<ResumeUploadDropzoneProps> = ({
  resumeUploaded,
  resumeFileName,
  onUploadFile,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setUploadError(null);
    if (!/\.(pdf|docx)$/i.test(file.name)) {
      setUploadError('Choose a PDF or DOCX file.');
      return;
    }
    if (file.size < 1 || file.size > 5 * 1024 * 1024) {
      setUploadError('The file must be between 1 byte and 5 MB.');
      return;
    }

    setIsUploading(true);
    const uploaded = await onUploadFile(file);
    setIsUploading(false);
    if (!uploaded) {
      setUploadError('Upload or parsing failed. Check the API error message above and try again.');
    }
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files[0];
    if (file) void processFile(file);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) void processFile(file);
    event.target.value = '';
  };

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xs">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Resume parsing</h3>
        <p className="mt-1 text-xs text-slate-500">
          PDF and DOCX files up to 5 MB are parsed in memory by the configured service. The API stores
          parsed metadata and skills, not the uploaded file.
        </p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
      />
      {resumeUploaded && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
          Parsed resume: <span className="font-semibold">{resumeFileName || 'Uploaded document'}</span>
          {' '}— replace it by selecting another file.
        </p>
      )}
      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-8 text-center ${
          isDragging ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-slate-50'
        }`}
      >
        <p className="text-sm font-semibold text-slate-800">
          {isUploading ? 'Uploading and parsing…' : 'Drop a resume here or select a file'}
        </p>
        <button
          type="button"
          disabled={isUploading}
          onClick={() => inputRef.current?.click()}
          className="mt-3 rounded-md bg-blue-700 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
        >
          {isUploading ? 'Please wait' : 'Choose PDF or DOCX'}
        </button>
      </div>
      {uploadError && <p role="alert" className="text-xs text-rose-700">{uploadError}</p>}
    </section>
  );
};
