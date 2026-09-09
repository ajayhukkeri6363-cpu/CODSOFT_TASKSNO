'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { JobWithDetails } from '@/lib/types';
import { formatSalary, formatJobType, formatRemote, formatExperience, timeAgo } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  Bookmark,
  Building2,
  MapPin,
  DollarSign,
  Trash2,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface SavedJobItem {
  id: string;
  candidateId: string;
  jobId: string;
  savedAt: string;
  job: JobWithDetails;
}

export default function CandidateSavedJobsPage() {
  const { success, error } = useToast();
  const [savedJobs, setSavedJobs] = useState<SavedJobItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSavedJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/saved-jobs');
      if (res.ok) {
        const data = await res.json();
        setSavedJobs(data.savedJobs || []);
      }
    } catch {
      // Handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedJobs();
  }, []);

  const handleRemove = async (jobId: string) => {
    try {
      const res = await fetch('/api/saved-jobs', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });

      if (res.ok) {
        success('Removed from saved jobs');
        setSavedJobs((prev) => prev.filter((s) => s.jobId !== jobId));
      } else {
        error('Failed to remove saved job');
      }
    } catch {
      error('Network error');
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Saved Job Bookmarks</h1>
          <p className="text-xs text-slate-500 mt-1">
            Positions you have bookmarked for quick reference and future applications.
          </p>
        </div>

        <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-700 self-start sm:self-auto">
          {savedJobs.length} Bookmarked
        </span>
      </div>

      {/* List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 rounded-3xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : savedJobs.length > 0 ? (
        <div className="space-y-4">
          {savedJobs.map((item) => {
            const job = item.job;
            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-indigo-200"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {job.company.logo ? (
                      <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                    ) : (
                      <Building2 className="w-6 h-6 text-slate-400" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-500">{job.company.name}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500">{job.location}</span>
                    </div>
                    <Link href={`/jobs/${job.id}`}>
                      <h3 className="text-base font-bold text-slate-900 hover:text-indigo-600 transition-colors line-clamp-1">
                        {job.title}
                      </h3>
                    </Link>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 pt-1">
                      <span className="font-semibold text-slate-900">
                        {formatSalary(job.salaryMin, job.salaryMax)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {formatJobType(job.jobType)}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-medium">
                        {formatRemote(job.remoteStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <Link href={`/jobs/${job.id}`}>
                    <Button size="sm">
                      <span>Apply</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>

                  <button
                    onClick={() => handleRemove(job.id)}
                    title="Remove from bookmarks"
                    className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Bookmark className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No saved jobs</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Save jobs you are interested in while browsing to easily apply later.
            </p>
          </div>
          <Link href="/jobs">
            <Button>Explore Positions</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
