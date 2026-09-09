'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationWithDetails } from '@/lib/types';
import { formatDate, timeAgo, formatSalary } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  FileCheck2,
  Calendar,
  Video,
  ArrowRight,
  Building2,
  CheckCircle,
  Clock,
  XCircle,
  AlertCircle,
} from 'lucide-react';

const STAGES = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED'];

export default function CandidateApplicationsPage() {
  const { success, error } = useToast();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/applications');
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
    fetchApplications();
  }, []);

  const handleWithdraw = async (applicationId: string) => {
    if (!confirm('Are you sure you want to withdraw this job application?')) return;

    try {
      const res = await fetch(`/api/applications/${applicationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'WITHDRAWN' }),
      });

      if (res.ok) {
        success('Application withdrawn');
        await fetchApplications();
      } else {
        error('Failed to withdraw application');
      }
    } catch {
      error('Network error');
    }
  };

  const filteredApps = applications.filter((app) => {
    if (filter === 'ALL') return true;
    if (filter === 'INTERVIEW') return app.status === 'INTERVIEW';
    if (filter === 'SELECTED') return app.status === 'SELECTED';
    if (filter === 'ACTIVE') return ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW'].includes(app.status);
    return true;
  });

  const getStageIndex = (status: string) => {
    return STAGES.indexOf(status);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Submitted Applications</h1>
          <p className="text-xs text-slate-500 mt-1">
            Track real-time progress through recruitment review stages and scheduled interviews.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-100 rounded-2xl">
          {[
            { id: 'ALL', label: 'All' },
            { id: 'ACTIVE', label: 'In Progress' },
            { id: 'INTERVIEW', label: 'Interviews' },
            { id: 'SELECTED', label: 'Offers' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                filter === tab.id
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Applications List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-44 rounded-3xl bg-white border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : filteredApps.length > 0 ? (
        <div className="space-y-6">
          {filteredApps.map((app) => {
            const currentStageIdx = getStageIndex(app.status);
            const isTerminal = app.status === 'REJECTED' || app.status === 'WITHDRAWN';

            return (
              <div
                key={app.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6 transition-all hover:border-slate-300"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                      {app.job.company.logo ? (
                        <img src={app.job.company.logo} alt={app.job.company.name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-500">{app.job.company.name}</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500">{app.job.location}</span>
                      </div>
                      <Link href={`/jobs/${app.job.id}`}>
                        <h3 className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                          {app.job.title}
                        </h3>
                      </Link>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <StatusBadge status={app.status} />
                    {app.status !== 'WITHDRAWN' && app.status !== 'REJECTED' && (
                      <button
                        onClick={() => handleWithdraw(app.id)}
                        className="text-xs font-semibold text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        Withdraw
                      </button>
                    )}
                  </div>
                </div>

                {/* Visual ATS Stepper */}
                {!isTerminal ? (
                  <div className="space-y-3">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Recruitment Pipeline Stage
                    </p>
                    <div className="grid grid-cols-5 gap-2">
                      {STAGES.map((stg, sIdx) => {
                        const isDone = sIdx <= currentStageIdx;
                        const isCurrent = sIdx === currentStageIdx;

                        return (
                          <div key={stg} className="flex flex-col items-center space-y-1 text-center">
                            <div
                              className={`w-full h-2 rounded-full transition-all ${
                                isDone
                                  ? 'bg-indigo-600'
                                  : 'bg-slate-100'
                              }`}
                            />
                            <span
                              className={`text-[10px] font-bold uppercase tracking-tight mt-1 ${
                                isCurrent
                                  ? 'text-indigo-600'
                                  : isDone
                                  ? 'text-slate-700'
                                  : 'text-slate-300'
                              }`}
                            >
                              {stg.replace('_', ' ')}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center space-x-3 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>This application is currently {app.status.toLowerCase()}.</span>
                  </div>
                )}

                {/* Scheduled Interview Banner if any */}
                {app.interview && (
                  <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-900 uppercase tracking-wider">
                          Interview Confirmed
                        </span>
                      </div>
                      <p className="text-xs font-semibold text-slate-800">
                        {formatDate(app.interview.scheduledDate)} at {app.interview.timeSlot}
                      </p>
                      {app.interview.notes && (
                        <p className="text-[11px] text-slate-500">Note: {app.interview.notes}</p>
                      )}
                    </div>

                    <a
                      href={app.interview.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center space-x-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm shrink-0"
                    >
                      <Video className="w-4 h-4" />
                      <span>Join Interview</span>
                    </a>
                  </div>
                )}

                {/* Footer metadata */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                  <span>Applied on {formatDate(app.createdAt)} ({timeAgo(app.createdAt)})</span>
                  <Link href={`/jobs/${app.job.id}`} className="text-indigo-600 font-semibold hover:underline flex items-center">
                    <span>View Job Posting</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <FileCheck2 className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No applications found</h3>
            <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
              You haven&apos;t submitted any job applications matching this filter.
            </p>
          </div>
          <Link href="/jobs">
            <Button>Explore Open Positions</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
