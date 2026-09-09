'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationWithDetails, JobWithDetails } from '@/lib/types';
import { formatDate, timeAgo, formatSalary } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { CandidateReviewModal } from '@/components/CandidateReviewModal';
import { InterviewModal } from '@/components/InterviewModal';
import { useToast } from '@/context/ToastContext';
import {
  Briefcase,
  Users,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  PlusCircle,
  KanbanSquare,
  ArrowRight,
  Building2,
  Award,
} from 'lucide-react';

export default function RecruiterDashboardPage() {
  const { user } = useAuth();
  const { success, error } = useToast();

  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  // Review & Interview Modals
  const [selectedApplication, setSelectedApplication] = useState<ApplicationWithDetails | null>(null);
  const [interviewApplication, setInterviewApplication] = useState<ApplicationWithDetails | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [jobsRes, appsRes] = await Promise.all([
        fetch('/api/recruiter/jobs'),
        fetch('/api/applications'),
      ]);

      if (jobsRes.ok) {
        const d = await jobsRes.json();
        setJobs(d.jobs || []);
      }

      if (appsRes.ok) {
        const d = await appsRes.json();
        setApplications(d.applications || []);
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
        success(`Applicant moved to ${newStatus.replace('_', ' ')}`);
        await fetchData();
        if (selectedApplication?.id === appId) {
          setSelectedApplication((prev) => prev ? { ...prev, status: newStatus as any } : null);
        }
      } else {
        error('Failed to change status');
      }
    } catch {
      error('Network error changing status');
    }
  };

  const activeJobsCount = jobs.filter((j) => j.status === 'PUBLISHED').length;
  const totalApps = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED').length;
  const interviewsCount = applications.filter((a) => a.status === 'INTERVIEW').length;
  const hiresCount = applications.filter((a) => a.status === 'SELECTED').length;

  return (
    <div className="space-y-8">
      {/* Welcome & Quick Action Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-indigo-300">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Recruitment Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Manage your hiring pipeline, review applicants, and coordinate interviews with candidate talent.
          </p>
        </div>

        <div className="flex flex-wrap gap-2.5 shrink-0">
          <Link href="/recruiter/jobs/new">
            <Button size="md" leftIcon={<PlusCircle className="w-4 h-4" />}>
              Post New Job
            </Button>
          </Link>
          <Link href="/recruiter/applications">
            <Button variant="outline" size="md" className="bg-white text-slate-900 border-white hover:bg-slate-100" leftIcon={<KanbanSquare className="w-4 h-4" />}>
              ATS Kanban
            </Button>
          </Link>
        </div>
      </div>

      {/* 6 Key Recruiter KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-2xl font-black text-slate-900">{activeJobsCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Jobs</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-2xl font-black text-indigo-600">{totalApps}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Applicants</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-2xl font-black text-amber-600">{underReviewCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Review</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-2xl font-black text-purple-600">{shortlistedCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Shortlisted</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-2xl font-black text-blue-600">{interviewsCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Interviews</p>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <p className="text-2xl font-black text-emerald-600">{hiresCount}</p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Hired</p>
        </div>
      </div>

      {/* Recent Applications Ledger */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Recent Candidate Applicants</h2>
            <p className="text-xs text-slate-500">Review candidates and advance them across recruitment stages</p>
          </div>
          <Link
            href="/recruiter/applications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <span>Open Kanban ATS</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : applications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 6).map((app) => (
              <div
                key={app.id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 p-2 rounded-xl transition-colors cursor-pointer"
                onClick={() => setSelectedApplication(app)}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 font-bold text-sm flex items-center justify-center shrink-0">
                    {app.candidate.avatar ? (
                      <img src={app.candidate.avatar} alt={app.candidate.name} className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      app.candidate.name.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">{app.candidate.name}</h4>
                    <p className="text-xs text-slate-500">{app.job.title} • {timeAgo(app.createdAt)}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <StatusBadge status={app.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedApplication(app);
                    }}
                  >
                    Evaluate
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No applicants received yet for your active positions.
          </div>
        )}
      </div>

      {/* Recruiter Active Jobs Overview */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Your Active Job Listings</h2>
          <Link
            href="/recruiter/jobs"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <span>Manage All Jobs</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {jobs.slice(0, 3).map((job) => (
            <div
              key={job.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 hover:bg-white hover:border-indigo-200 transition-all space-y-2 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <StatusBadge status={job.status} size="sm" />
                  <span className="text-[11px] font-bold text-indigo-600">
                    {job._count?.applications || 0} Applicants
                  </span>
                </div>
                <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{job.title}</h4>
                <p className="text-[11px] text-slate-500">{job.location}</p>
                <p className="text-xs font-semibold text-slate-800 mt-1">
                  {formatSalary(job.salaryMin, job.salaryMax)}
                </p>
              </div>

              <div className="pt-2 flex items-center space-x-2">
                <Link href={`/recruiter/jobs/${job.id}/edit`} className="w-full">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    Edit
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Evaluation Modal */}
      {selectedApplication && (
        <CandidateReviewModal
          isOpen={!!selectedApplication}
          onClose={() => setSelectedApplication(null)}
          application={selectedApplication}
          onStatusChange={handleStatusChange}
          onOpenScheduleInterview={(app) => setInterviewApplication(app)}
        />
      )}

      {/* Interview Scheduling Modal */}
      {interviewApplication && (
        <InterviewModal
          isOpen={!!interviewApplication}
          onClose={() => setInterviewApplication(null)}
          applicationId={interviewApplication.id}
          candidateName={interviewApplication.candidate.name}
          jobTitle={interviewApplication.job.title}
          onSuccess={async () => {
            await fetchData();
          }}
        />
      )}
    </div>
  );
}
