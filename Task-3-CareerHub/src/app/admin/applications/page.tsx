'use client';

import React, { useState, useEffect } from 'react';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, timeAgo } from '@/lib/utils';
import { FileCheck2, Search, Building2, Calendar, Video } from 'lucide-react';
import Link from 'next/link';

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== 'ALL') params.set('status', statusFilter);

      const res = await fetch(`/api/admin/applications?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setApplications(data.applications || []);
      }
    } catch {
      // Handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, [statusFilter]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Platform Application Ledger</h1>
          <p className="text-xs text-slate-500 mt-1">
            Audit and inspect candidate applications across all companies and positions.
          </p>
        </div>

        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {['ALL', 'APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'].map(
            (s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  statusFilter === s
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {s === 'ALL' ? 'All' : s.replace('_', ' ')}
              </button>
            )
          )}
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="h-64 animate-pulse bg-slate-50 rounded-2xl" />
        ) : applications.length > 0 ? (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Candidate</th>
                <th className="pb-3 px-3">Position & Company</th>
                <th className="pb-3 px-3">Status</th>
                <th className="pb-3 px-3">Interview Scheduled</th>
                <th className="pb-3 px-3">Applied Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {applications.map((app) => (
                <tr key={app.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-4 px-3">
                    <div>
                      <p className="font-bold text-slate-900">{app.candidate.name}</p>
                      <p className="text-[11px] text-slate-500">{app.candidate.email}</p>
                    </div>
                  </td>
                  <td className="py-4 px-3">
                    <Link href={`/jobs/${app.job.id}`} className="font-semibold text-slate-900 hover:text-indigo-600">
                      {app.job.title}
                    </Link>
                    <p className="text-[11px] text-slate-500">{app.job.company.name}</p>
                  </td>
                  <td className="py-4 px-3">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-4 px-3">
                    {app.interview ? (
                      <span className="inline-flex items-center space-x-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(app.interview.scheduledDate)}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                  <td className="py-4 px-3 text-slate-400">{timeAgo(app.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="py-12 text-center text-xs text-slate-400">
            No applications found matching the selected filter.
          </div>
        )}
      </div>
    </div>
  );
}
