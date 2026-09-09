'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { KanbanBoard } from '@/components/KanbanBoard';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';
import { InterviewModal } from '@/components/InterviewModal';
import { ApplicationWithDetails, JobWithDetails, ApplicationStatus } from '@/lib/types';
import { StatusBadge } from '@/components/StatusBadge';
import { formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
  KanbanSquare,
  List,
  Filter,
  Calendar,
  Sparkles,
  Users,
  Search,
} from 'lucide-react';

function RecruiterApplicationsContent() {
  const searchParams = useSearchParams();
  const initialJobId = searchParams.get('jobId') || 'ALL';

  const { success, error } = useToast();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [selectedJobId, setSelectedJobId] = useState(initialJobId);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'LIST'>('KANBAN');
  const [loading, setLoading] = useState(true);

  // Modals
  const [selectedApp, setSelectedApp] = useState<ApplicationWithDetails | null>(null);
  const [interviewApp, setInterviewApp] = useState<ApplicationWithDetails | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, jobsRes] = await Promise.all([
        fetch('/api/applications'),
        fetch('/api/recruiter/jobs'),
      ]);

      if (appsRes.ok) {
        const d = await appsRes.json();
        setApplications(d.applications || []);
      }
      if (jobsRes.ok) {
        const d = await jobsRes.json();
        setJobs(d.jobs || []);
      }
    } catch {
      // Handle
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (appId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/applications/${appId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        success(`Applicant transitioned to ${newStatus.replace('_', ' ')}`);
        await fetchData();
        if (selectedApp?.id === appId) {
          setSelectedApp((prev) => prev ? { ...prev, status: newStatus as ApplicationStatus } : null);
        }
      } else {
        error('Failed to change status');
      }
    } catch {
      error('Network error');
    }
  };

  const filteredApplications = applications.filter((a) => {
    if (selectedJobId === 'ALL') return true;
    return a.jobId === selectedJobId;
  });

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">ATS Recruitment Pipeline</h1>
          <p className="text-xs text-slate-500 mt-1">
            Evaluate candidate profiles, progress applicants across hiring stages, and schedule interviews.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Job Filter Dropdown */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold text-slate-500">Filter Job:</span>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none max-w-xs truncate"
            >
              <option value="ALL">All Active Jobs ({applications.length} Candidates)</option>
              {jobs.map((j) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j._count?.applications || 0})
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex p-1 bg-slate-100 rounded-xl">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === 'KANBAN'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KanbanSquare className="w-4 h-4" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              className={`p-1.5 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                viewMode === 'LIST'
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Table</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main ATS Content */}
      {loading ? (
        <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      ) : viewMode === 'KANBAN' ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
          <KanbanBoard
            applications={filteredApplications}
            onSelectApplication={(app) => setSelectedApp(app)}
            onStatusChange={(appId, stg) => handleStatusChange(appId, stg)}
            onScheduleInterview={(app) => setInterviewApp(app)}
          />
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 px-3">Candidate</th>
                <th className="pb-3 px-3">Position</th>
                <th className="pb-3 px-3">Stage</th>
                <th className="pb-3 px-3">Applied</th>
                <th className="pb-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplications.map((app) => (
                <tr
                  key={app.id}
                  onClick={() => setSelectedApp(app)}
                  className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                >
                  <td className="py-4 px-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {app.candidate.avatar ? (
                          <img src={app.candidate.avatar} alt={app.candidate.name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          app.candidate.name.charAt(0)
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{app.candidate.name}</p>
                        <p className="text-[11px] text-slate-500">{app.candidate.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-3 font-semibold text-slate-800">{app.job.title}</td>
                  <td className="py-4 px-3">
                    <StatusBadge status={app.status} size="sm" />
                  </td>
                  <td className="py-4 px-3 text-slate-500">{timeAgo(app.createdAt)}</td>
                  <td className="py-4 px-3 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedApp(app);
                      }}
                    >
                      Review
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Candidate Review Modal */}
      {selectedApp && (
        <CandidateReviewModal
          isOpen={!!selectedApp}
          onClose={() => setSelectedApp(null)}
          application={selectedApp}
          onStatusChange={handleStatusChange}
          onOpenScheduleInterview={(app) => setInterviewApp(app)}
        />
      )}

      {/* Interview Scheduling Modal */}
      {interviewApp && (
        <InterviewModal
          isOpen={!!interviewApp}
          onClose={() => setInterviewApp(null)}
          applicationId={interviewApp.id}
          candidateName={interviewApp.candidate.name}
          jobTitle={interviewApp.job.title}
          onSuccess={async () => {
            await fetchData();
          }}
        />
      )}
    </div>
  );
}

export default function RecruiterApplicationsPage() {
  return (
    <Suspense fallback={<div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />}>
      <RecruiterApplicationsContent />
    </Suspense>
  );
}
