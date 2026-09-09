'use client';

import React, { useState, useEffect } from 'react';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/ui/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { formatSalary, formatDate, timeAgo } from '@/lib/utils';
import {
  ShieldAlert,
  Search,
  Sparkles,
  Trash2,
  ExternalLink,
  Building2,
} from 'lucide-react';
import Link from 'next/link';

export default function AdminJobsPage() {
  const { success, error } = useToast();
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/jobs?${params.toString()}`);
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
  }, [statusFilter]);

  const handleToggleFeatured = async (jobId: string, currentFeatured: boolean) => {
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, isFeatured: !currentFeatured }),
      });
      if (res.ok) {
        success('Job featured status updated');
        await fetchJobs();
      }
    } catch {
      error('Network error');
    }
  };

  const handleToggleStatus = async (jobId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'PUBLISHED' ? 'CLOSED' : 'PUBLISHED';
    try {
      const res = await fetch('/api/admin/jobs', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId, status: nextStatus }),
      });
      if (res.ok) {
        success(`Job status changed to ${nextStatus}`);
        await fetchJobs();
      }
    } catch {
      error('Network error');
    }
  };

  const handleDeleteJob = async (jobId: string) => {
    if (!confirm('Are you sure you want to remove this job listing from the platform?')) return;
    try {
      const res = await fetch(`/api/admin/jobs?id=${jobId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Job listing removed successfully');
        await fetchJobs();
      } else {
        error('Failed to remove job');
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
          <h1 className="text-xl font-bold text-slate-900">Job Listings Moderation</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review and moderate job opportunities published by recruiters across the platform.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['ALL', 'PUBLISHED', 'DRAFT', 'CLOSED'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                statusFilter === s
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              {s === 'ALL' ? 'All Jobs' : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex gap-3">
        <div className="relative flex-1 flex items-center">
          <Search className="w-4 h-4 text-slate-400 absolute left-3" />
          <input
            type="text"
            placeholder="Search by job title or company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchJobs()}
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:bg-slate-50"
          />
        </div>
        <Button variant="secondary" size="sm" onClick={fetchJobs}>
          Search
        </Button>
      </div>

      {/* Jobs Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="h-64 animate-pulse bg-slate-50 rounded-2xl" />
        ) : (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Job Listing</th>
                <th className="pb-3 px-3">Company</th>
                <th className="pb-3 px-3">Category & Type</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Applicants</th>
                <th className="pb-3 px-3 text-right">Moderation Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {jobs.map((j) => (
                <tr key={j.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-3">
                    <div>
                      <Link href={`/jobs/${j.id}`} className="font-bold text-slate-900 hover:text-indigo-600 flex items-center space-x-1">
                        <span>{j.title}</span>
                        {j.isFeatured && (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 fill-amber-400 inline shrink-0" />
                        )}
                      </Link>
                      <p className="text-[11px] text-slate-400">
                        {j.location} • {formatSalary(j.salaryMin, j.salaryMax)}
                      </p>
                    </div>
                  </td>
                  <td className="py-4 px-3 font-semibold text-slate-800">{j.company.name}</td>
                  <td className="py-4 px-3 text-slate-600">
                    {j.category} ({j.jobType})
                  </td>
                  <td className="py-4 px-3">
                    <StatusBadge status={j.status} size="sm" />
                  </td>
                  <td className="py-4 px-3 font-semibold text-slate-800">
                    {j._count?.applications || 0}
                  </td>
                  <td className="py-4 px-3 text-right space-x-2">
                    <button
                      onClick={() => handleToggleFeatured(j.id, j.isFeatured)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                        j.isFeatured
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {j.isFeatured ? 'Unfeature' : 'Feature'}
                    </button>

                    <button
                      onClick={() => handleToggleStatus(j.id, j.status)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-colors ${
                        j.status === 'PUBLISHED'
                          ? 'border-amber-200 bg-amber-50 text-amber-800'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-800'
                      }`}
                    >
                      {j.status === 'PUBLISHED' ? 'Close' : 'Publish'}
                    </button>

                    <button
                      onClick={() => handleDeleteJob(j.id)}
                      title="Remove from platform"
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors inline-block"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
