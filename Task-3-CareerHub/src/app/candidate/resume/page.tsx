'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/ui/Button';
import { formatDate } from '@/lib/utils';
import {
  FileText,
  Upload,
  CheckCircle2,
  Trash2,
  Download,
  ExternalLink,
  ShieldCheck,
  Cloud,
} from 'lucide-react';

interface ResumeItem {
  id: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  isDefault: boolean;
  uploadedAt: string;
}

export default function CandidateResumePage() {
  const { success, error } = useToast();
  const [resumes, setResumes] = useState<ResumeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchResumes = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/candidate/resume');
      if (res.ok) {
        const data = await res.json();
        setResumes(data.resumes || []);
      }
    } catch {
      // Handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      error('Please select a PDF or Word document to upload');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/candidate/resume', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        success('Resume uploaded successfully!');
        setSelectedFile(null);
        await fetchResumes();
      } else {
        error('Failed to upload resume');
      }
    } catch {
      error('Network error during upload');
    } finally {
      setUploading(false);
    }
  };

  const handleSetDefault = async (resumeId: string) => {
    try {
      const res = await fetch('/api/candidate/resume', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resumeId }),
      });
      if (res.ok) {
        success('Primary resume updated');
        await fetchResumes();
      }
    } catch {
      error('Failed to set default resume');
    }
  };

  const handleDelete = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return;
    try {
      const res = await fetch(`/api/candidate/resume?id=${resumeId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Resume deleted successfully');
        await fetchResumes();
      } else {
        error('Failed to delete resume');
      }
    } catch {
      error('Failed to delete resume');
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Resume & Documents</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your CVs and resumes for instant 1-click job applications.
          </p>
        </div>

        {/* Upload Box */}
        <form onSubmit={handleUpload} className="space-y-4">
          <div className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/20 rounded-3xl p-8 text-center transition-colors">
            <Upload className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">Upload New Resume</h3>
            <p className="text-xs text-slate-500 mt-0.5">Supports PDF, DOC, DOCX up to 5MB</p>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
              />
              {selectedFile && (
                <Button type="submit" size="sm" isLoading={uploading}>
                  Upload File
                </Button>
              )}
            </div>
          </div>
        </form>

        {/* Cloud Storage Abstraction Info */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center space-x-3 text-xs text-slate-600">
          <Cloud className="w-5 h-5 text-indigo-600 shrink-0" />
          <p>
            <strong>Storage Architecture:</strong> Resumes are stored using our decoupled Cloud Storage Abstraction layer, storing file metadata securely in PostgreSQL while persisting binaries in object storage.
          </p>
        </div>
      </div>

      {/* Resumes List Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
        <h2 className="text-base font-bold text-slate-900">Uploaded Documents</h2>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-20 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : resumes.length > 0 ? (
          <div className="space-y-3">
            {resumes.map((r) => (
              <div
                key={r.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                  r.isDefault
                    ? 'border-indigo-300 bg-indigo-50/30'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="text-sm font-bold text-slate-900">{r.fileName}</h4>
                      {r.isDefault && (
                        <span className="px-2 py-0.5 rounded-full bg-indigo-600 text-white text-[10px] font-bold">
                          Primary Default
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Uploaded {formatDate(r.uploadedAt)} • {(r.fileSize / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  {!r.isDefault && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSetDefault(r.id)}
                    >
                      Set as Default
                    </Button>
                  )}

                  <a
                    href={r.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View</span>
                  </a>

                  <button
                    onClick={() => handleDelete(r.id)}
                    title="Delete resume"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No resumes uploaded yet. Upload your CV above to get started.
          </div>
        )}
      </div>
    </div>
  );
}
