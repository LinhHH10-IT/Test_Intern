// FE-BR-004: Upload CV — only PDF/DOC accepted, max 5MB, validated client-side.
// FE-BR-007-style 2-step: user selects file → previews filename → submits.

import React, { useRef, useState, useCallback } from 'react';
import {
  XMarkIcon,
  PaperClipIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import type { CandidateApplyPayload, Job } from '../../types';
import { ACCEPTED_CV_TYPES, MAX_CV_SIZE_BYTES, MAX_CV_SIZE_MB } from '../../types';

interface ApplyModalProps {
  job: Job;
  isLoading: boolean;
  onSubmit: (payload: CandidateApplyPayload) => void;
  onCancel: () => void;
}

// FE-BR-004 — validate file type and size
function validateCvFile(file: File): string | null {
  if (!ACCEPTED_CV_TYPES.includes(file.type as typeof ACCEPTED_CV_TYPES[number])) {
    return 'Only PDF or Word documents (.pdf, .doc, .docx) are accepted.';
  }
  if (file.size > MAX_CV_SIZE_BYTES) {
    return `File size must be under ${MAX_CV_SIZE_MB}MB. Your file is ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
  }
  return null;
}

const ApplyModal: React.FC<ApplyModalProps> = ({ job, isLoading, onSubmit, onCancel }) => {
  const [cvFile, setCvFile] = useState<File | null>(null);
  const [cvError, setCvError] = useState<string | null>(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    const error = validateCvFile(file);
    setCvError(error);
    if (!error) setCvFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cvFile) return;
    onSubmit({ cvFile, coverLetter: coverLetter.trim() || undefined });
  };

  const canSubmit = !!cvFile && !cvError && !isLoading;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && !isLoading && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-base font-bold text-gray-900">Apply for Position</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              {job.title}{' '}
              <span className="text-gray-400">·</span>{' '}
              <span className="text-gray-400 font-mono">#{job.jobCode}</span>
            </p>
          </div>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5">
          {/* CV Upload — FE-BR-004 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              CV / Resume <span className="text-red-500">*</span>
              <span className="ml-1 text-xs text-gray-400 font-normal">
                PDF, DOC or DOCX · max {MAX_CV_SIZE_MB}MB
              </span>
            </label>

            {cvFile ? (
              /* File selected — preview */
              <div className="flex items-center gap-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
                <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                  <DocumentTextIcon className="w-5 h-5 text-purple-600" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-800 truncate">{cvFile.name}</p>
                  <p className="text-xs text-gray-400">
                    {(cvFile.size / 1024).toFixed(0)} KB
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setCvFile(null); setCvError(null); }}
                  className="text-gray-400 hover:text-red-500 transition-colors flex-shrink-0"
                >
                  <XMarkIcon className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Drop zone */
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-xl px-4 py-7 cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-purple-400 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                }`}
              >
                <ArrowUpTrayIcon className="w-6 h-6 text-gray-400" />
                <p className="text-sm text-gray-500">
                  Drag &amp; drop your CV here, or{' '}
                  <span className="text-purple-600 font-medium underline underline-offset-2">
                    browse
                  </span>
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  className="hidden"
                  onChange={handleFileInput}
                />
              </div>
            )}

            {cvError && (
              <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                <span>⚠</span> {cvError}
              </p>
            )}
          </div>

          {/* Cover Letter (optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter{' '}
              <span className="text-xs text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={4}
              maxLength={1000}
              placeholder="Why are you a great fit for this role?"
              className="w-full border border-gray-300 rounded-xl px-3 py-2.5 text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition resize-none"
            />
            <p className="text-right text-xs text-gray-400 mt-0.5">{coverLetter.length}/1000</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-1">
            <button
              type="button"
              onClick={onCancel}
              disabled={isLoading}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canSubmit}
              className="flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-purple-600 rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  <PaperClipIcon className="w-4 h-4" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplyModal;
