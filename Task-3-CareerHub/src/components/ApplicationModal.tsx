'use client';

import React, { useState, useEffect } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { FileText, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: {
    id: string;
    title: string;
    company: {
      name: string;
    };
  };
  onSuccess?: () => void;
}

interface ResumeOption {
  id: string;
  fileName: string;
  isDefault: boolean;
  uploadedAt: string;
}

export const ApplicationModal: React.FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  job,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [resumes, setResumes] = useState<ResumeOption[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string>('');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newFile, setNewFile] = useState<File | null>(null);

  useEffect(() => {
    if (isOpen && user?.role === 'CANDIDATE') {
      fetchResumes();
    }
  }, [isOpen, user]);

  const fetchResumes = async () => {
    setLoadingResumes(true);
    try {
      const res = await fetch('/api/candidate/resume');
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
        const defaultResume = data.resumes?.find((r: ResumeOption) => r.isDefault);
        if (defaultResume) {
          setSelectedResumeId(defaultResume.id);
        } else if (data.resumes?.length > 0) {
          setSelectedResumeId(data.resumes[0].id);
        }
      }
    } catch {
      // Ignore
    } finally {
      setLoadingResumes(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      error('Please log in to apply for this position');
      return;
    }

    if (user.role !== 'CANDIDATE') {
      error('Only candidate accounts can submit job applications');
      return;
    }

    setSubmitting(true);
    try {
      let finalResumeId = selectedResumeId;

      // If user uploaded a new resume directly in this modal
      if (newFile) {
        const formData = new FormData();
        formData.append('file', newFile);
        const uploadRes = await fetch('/api/candidate/resume', {
          method: 'POST',
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalResumeId = uploadData.resume?.id;
        } else {
          error('Failed to upload resume document');
          setSubmitting(false);
          return;
        }
      }

      const res = await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          jobId: job.id,
          resumeId: finalResumeId || undefined,
          coverLetter: coverLetter.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          error(data.error || 'You have already submitted an application for this position.');
        } else {
          error(data.error || 'Failed to submit application');
        }
        return;
      }

      success(`Successfully submitted application for ${job.title}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      error(err.message || 'Error submitting application');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} title="Sign In Required">
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900">Sign in to Apply</h4>
            <p className="text-sm text-slate-500 mt-1">
              You must be logged in with a Candidate account to submit an application for {job.title} at {job.company.name}.
            </p>
          </div>
          <div className="flex justify-center space-x-3 pt-2">
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Link href={`/login?redirect=/jobs/${job.id}`}>
              <Button>Sign In</Button>
            </Link>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Apply for ${job.title}`}
      description={`Submit your application to ${job.company.name}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Candidate Summary */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between text-xs">
          <div>
            <p className="font-semibold text-slate-900">{user.name}</p>
            <p className="text-slate-500">{user.email}</p>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
            Candidate Verified
          </span>
        </div>

        {/* Resume Selection */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800">
            Resume / CV <span className="text-rose-500">*</span>
          </label>

          {loadingResumes ? (
            <div className="p-4 border rounded-xl bg-slate-50 text-center text-xs text-slate-500 animate-pulse">
              Loading stored resumes...
            </div>
          ) : resumes.length > 0 ? (
            <div className="space-y-2">
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {resumes.map((r) => (
                  <label
                    key={r.id}
                    className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      selectedResumeId === r.id && !newFile
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="resumeChoice"
                        checked={selectedResumeId === r.id && !newFile}
                        onChange={() => {
                          setSelectedResumeId(r.id);
                          setNewFile(null);
                        }}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <FileText className="w-4 h-4 text-indigo-600" />
                      <div>
                        <p className="text-xs font-semibold">{r.fileName}</p>
                        {r.isDefault && (
                          <span className="text-[10px] text-slate-400 font-medium">Default Resume</span>
                        )}
                      </div>
                    </div>
                    {selectedResumeId === r.id && !newFile && (
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                    )}
                  </label>
                ))}
              </div>

              {/* Or upload new */}
              <div className="pt-1">
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Or upload a different resume (PDF / DOCX):
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    if (e.target.files?.[0]) {
                      setNewFile(e.target.files[0]);
                    }
                  }}
                  className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 cursor-pointer"
                />
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-indigo-400 transition-colors">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">Upload your Resume (PDF / DOCX)</p>
              <p className="text-[11px] text-slate-400 mt-0.5">Maximum file size 5MB</p>
              <input
                type="file"
                required
                accept=".pdf,.doc,.docx"
                onChange={(e) => setNewFile(e.target.files?.[0] || null)}
                className="mt-3 block w-full text-xs text-slate-500 file:mx-auto file:py-1.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* Cover Letter */}
        <div className="space-y-1.5">
          <label className="block text-sm font-semibold text-slate-800">
            Cover Letter / Note to Recruiter <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            rows={4}
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            placeholder="Highlight your relevant experience, key achievements, and why you are excited about this role..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button type="submit" isLoading={submitting}>
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
};
