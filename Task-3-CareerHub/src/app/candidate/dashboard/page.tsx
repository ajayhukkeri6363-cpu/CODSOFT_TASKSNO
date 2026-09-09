'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationWithDetails, JobWithDetails } from '@/lib/types';
import { formatDate, timeAgo, formatSalary } from '@/lib/utils';
import { Button } from '@/ui/Button';
import {
  FileCheck2,
  Clock,
  CheckCircle2,
  Bookmark,
  Calendar,
  Sparkles,
  ArrowRight,
  Video,
  Building2,
} from 'lucide-react';

export default function CandidateDashboardPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationWithDetails[]>([]);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [interviews, setInterviews] = useState<any[]>([]);
  const [recommendedJobs, setRecommendedJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [appsRes, savedRes, interviewsRes, jobsRes] = await Promise.all([
          fetch('/api/applications'),
          fetch('/api/saved-jobs'),
          fetch('/api/interviews'),
          fetch('/api/jobs?limit=3'),
        ]);

        if (appsRes.ok) {
          const data = await appsRes.json();
          setApplications(data.applications || []);
        }

        if (savedRes.ok) {
          const data = await savedRes.json();
          setSavedJobsCount(data.savedJobs?.length || 0);
        }

        if (interviewsRes.ok) {
          const data = await interviewsRes.json();
          setInterviews(data.interviews || []);
        }

        if (jobsRes.ok) {
          const data = await jobsRes.json();
          setRecommendedJobs(data.jobs || []);
        }
      } catch {
        // Handle gracefully
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalApps = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'UNDER_REVIEW').length;
  const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
  const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-300" />
            <span>Candidate Career Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, {user?.name || 'Developer'}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-200 max-w-xl">
            Track all your active job applications, review interview schedules, and explore newly published tech opportunities.
          </p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{totalApps}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Applied</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{underReviewCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Under Review</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{shortlistedCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Shortlisted / Interview</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Bookmark className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{savedJobsCount}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Saved Jobs</p>
          </div>
        </div>
      </div>

      {/* Upcoming Scheduled Interviews */}
      {interviews.length > 0 && (
        <div className="bg-white rounded-3xl border border-indigo-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Upcoming Scheduled Interviews</h2>
            </div>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
              {interviews.length} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {interviews.map((iv) => (
              <div
                key={iv.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{iv.application.job.title}</h3>
                    <p className="text-xs text-slate-500">{iv.application.job.company.name}</p>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[10px] font-bold">
                    {iv.meetingType}
                  </span>
                </div>

                <div className="text-xs space-y-1 text-slate-600">
                  <p className="font-semibold text-indigo-900">
                    📅 {formatDate(iv.scheduledDate)} at {iv.timeSlot}
                  </p>
                  {iv.notes && <p className="text-[11px] text-slate-500 italic">&ldquo;{iv.notes}&rdquo;</p>}
                </div>

                <div className="pt-2">
                  <a
                    href={iv.meetingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-sm"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Meeting Room</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Applications Table */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Recent Applications</h2>
          <Link
            href="/candidate/applications"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {applications.length > 0 ? (
          <div className="divide-y divide-slate-100">
            {applications.slice(0, 5).map((app) => (
              <div key={app.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <Link href={`/jobs/${app.job.id}`} className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">
                    {app.job.title}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {app.job.company.name} • Applied {timeAgo(app.createdAt)}
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <StatusBadge status={app.status} />
                  <Link href="/candidate/applications">
                    <Button variant="ghost" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-xs text-slate-400">
            No applications submitted yet. Browse jobs to apply!
          </div>
        )}
      </div>

      {/* Recommended Jobs */}
      {recommendedJobs.length > 0 && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recommended for You</h2>
            <Link
              href="/jobs"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedJobs.map((rj) => (
              <div
                key={rj.id}
                className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xs font-bold text-slate-900 line-clamp-1">{rj.title}</h3>
                  <p className="text-[11px] text-slate-500">{rj.company.name}</p>
                  <p className="text-xs font-semibold text-slate-800 mt-1">
                    {formatSalary(rj.salaryMin, rj.salaryMax)}
                  </p>
                </div>
                <Link href={`/jobs/${rj.id}`} className="pt-2">
                  <Button variant="outline" size="sm" className="w-full text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
