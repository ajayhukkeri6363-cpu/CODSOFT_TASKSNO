'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { JobWithDetails } from '@/lib/types';
import { formatDate, timeAgo, formatSalary, formatJobType, formatRemote } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  Briefcase,
  PlusCircle,
  Edit,
  Eye,
  Trash2,
  Users,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from 'lucide-react';

export default function RecruiterJobsPage() {
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/recruiter/jobs');
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
      }
    } catch {
      // Handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        success(`Job status changed to ${nextStatus}`);
        await fetchJobs();
      } else {
        error('Failed to change status');
      }
    } catch {
      error('Network error');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to permanently delete this job listing?')) return;
    try {
      const res = await fetch(`/api/jobs/${jobId}`, { method: 'DELETE' });
      if (res.ok) {
        success('Job deleted successfully');
        await fetchJobs();
      } else {
        error('Failed to delete job');
      }
    } catch {
      error('Network error');
    }
  };

  const filteredJobs = jobs.filter((j) => {
    if (filter === 'ALL') return true;
    return j.status === filter;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Manage Job Listings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Create, edit, publish, or close openings across your organization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="flex gap-1 p-1 bg-slate-100 rounded-2xl">
            {['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  filter === tab ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          <Link href="/recruiter/jobs/new">
            <Button size="sm" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Post Job
            </Button>
          </Link>
        </div>
      </div>

      {/* Jobs Table / Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white rounded-3xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-all hover:border-slate-300"
            >
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <StatusBadge status={job.status} size="sm" />
                  <span className="text-xs text-slate-400">Created {timeAgo(job.createdAt)}</span>
                </div>

                <Link href={`/jobs/${job.id}`}>
                  <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {job.title}
                  </h3>
                </Link>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>{job.location}</span>
                  <span>•</span>
                  <span>{formatSalary(job.salaryMin, job.salaryMax)}</span>
                  <span>•</span>
                  <span>{formatJobType(job.jobType)}</span>
                  <span>•</span>
                  <span>{formatRemote(job.remoteStatus)}</span>
                </div>
              </div>

              {/* Stats & Actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100">
                <Link
                  href={`/recruiter/applications?jobId=${job.id}`}
                  className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-xs font-bold text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>{job._count?.applications || 0} Applicants</span>
                </Link>

                <button
                  onClick={() => handleToggleStatus(job.id, job.status)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${
                    job.status === 'PUBLISHED'
                      ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                      : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                  }`}
                >
                  {job.status === 'PUBLISHED' ? 'Close Job' : 'Publish Job'}
                </button>

                <Link href={`/recruiter/jobs/${job.id}/edit`}>
                  <Button variant="outline" size="sm" leftIcon={<Edit className="w-3.5 h-3.5" />}>
                    Edit
                  </Button>
                </Link>

                <button
                  onClick={() => handleDeleteJob(job.id)}
                  title="Delete job"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Briefcase className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No job listings found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              Get started by publishing your first job listing to attract qualified candidates.
            </p>
          </div>
          <Link href="/recruiter/jobs/new">
            <Button leftIcon={<PlusCircle className="w-4 h-4" />}>Post a Job</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
