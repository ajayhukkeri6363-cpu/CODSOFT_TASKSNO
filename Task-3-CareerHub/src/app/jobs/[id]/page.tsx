'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { JobWithDetails } from '@/lib/types';
import { formatSalary, formatJobType, formatRemote, formatExperience, formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/ui/Button';
import { ApplicationModal } from '@/components/ApplicationModal';
import { JobCard } from '@/components/JobCard';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Bookmark,
  Calendar,
  Share2,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Sparkles,
  Users,
  Eye,
  ShieldCheck,
} from 'lucide-react';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { success, error } = useToast();

  const id = params?.id as string;
  const [job, setJob] = useState<JobWithDetails | null>(null);
  const [similarJobs, setSimilarJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchJobData = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (res.ok) {
          const data = await res.json();
          setJob(data.job);
          setSimilarJobs(data.similarJobs || []);
        } else {
          setJob(null);
        }
      } catch {
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchJobData();
    }
  }, [id]);

  const handleToggleSave = async () => {
    if (!user) {
      error('Please sign in as a candidate to save jobs');
      return;
    }
    if (user.role !== 'CANDIDATE') {
      error('Only candidate accounts can bookmark jobs');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/saved-jobs', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job?.id }),
      });

      if (res.ok) {
        setIsSaved(!isSaved);
        if (!isSaved) success('Job saved to your bookmarks');
        else success('Job removed from bookmarks');
      }
    } catch {
      error('Failed to update bookmark');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      success('Job link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />
      </div>
    );
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-2xl font-bold text-slate-900">Job Listing Not Found</h2>
        <p className="text-slate-500 text-sm">
          The position you are looking for may have expired, been closed, or moved.
        </p>
        <Link href="/jobs">
          <Button variant="outline">Back to Job Marketplace</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Back Link */}
        <Link
          href="/jobs"
          className="inline-flex items-center text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to All Jobs</span>
        </Link>

        {/* Job Header Hero Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 lg:p-10 shadow-sm relative overflow-hidden">
          {job.isFeatured && (
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-extrabold uppercase px-6 py-1 rounded-bl-2xl shadow-sm flex items-center space-x-1">
              <Sparkles className="w-3 h-3" />
              <span>Featured Job</span>
            </div>
          )}

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex items-start space-x-4">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {job.company.logo ? (
                  <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                ) : (
                  <Building2 className="w-8 h-8 text-slate-400" />
                )}
              </div>

              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-bold text-slate-600">
                    {job.company.name}
                  </span>
                  {job.company.verified && (
                    <span title="Verified Company">
                      <ShieldCheck className="w-4 h-4 text-indigo-600" />
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {job.title}
                </h1>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.location}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-bold text-slate-800">
                      {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                    </span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Posted {timeAgo(job.createdAt)}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-slate-400" />
                    <span>{job.viewsCount} views</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Header Action CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                variant="outline"
                size="md"
                onClick={handleToggleSave}
                isLoading={saving}
                leftIcon={<Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600 text-indigo-600' : ''}`} />}
              >
                {isSaved ? 'Saved' : 'Save'}
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={handleShare}
                leftIcon={<Share2 className="w-4 h-4" />}
              >
                Share
              </Button>

              <Button
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
                className="shadow-md shadow-indigo-100"
              >
                Apply Now
              </Button>
            </div>
          </div>

          {/* Quick Badges Bar */}
          <div className="mt-6 pt-6 border-t border-slate-100 flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-indigo-50 text-indigo-700">
              {formatJobType(job.jobType)}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-blue-50 text-blue-700">
              {formatRemote(job.remoteStatus)}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-purple-50 text-purple-700">
              {formatExperience(job.experienceLevel)}
            </span>
            <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700">
              {job.category}
            </span>
            {job.deadline && (
              <span className="px-3 py-1 rounded-xl text-xs font-semibold bg-amber-50 text-amber-800">
                Deadline: {formatDate(job.deadline)}
              </span>
            )}
          </div>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Details Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview / Description */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6">
              <div className="space-y-3">
                <h3 className="text-lg font-bold text-slate-900">About the Role</h3>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Key Responsibilities</h3>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {job.responsibilities}
                  </div>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Requirements & Qualifications</h3>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {job.requirements}
                  </div>
                </div>
              )}

              {/* Benefits */}
              {job.benefits && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Compensation & Perks</h3>
                  <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                    {job.benefits}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              {job.skills && job.skills.length > 0 && (
                <div className="space-y-3 pt-6 border-t border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Required Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((s) => (
                      <span
                        key={s.id}
                        className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200"
                      >
                        {s.skillName}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Apply Card */}
            <div className="bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 text-white flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
              <div>
                <h3 className="text-xl font-bold">Ready to apply for this role?</h3>
                <p className="text-xs text-indigo-200 mt-1">
                  Submit your resume and candidate profile directly to {job.company.name}.
                </p>
              </div>
              <Button
                size="lg"
                onClick={() => setIsApplyModalOpen(true)}
                className="bg-white text-indigo-900 hover:bg-slate-100 shrink-0 font-bold"
              >
                Apply Now
              </Button>
            </div>
          </div>

          {/* Sidebar Info Column */}
          <div className="space-y-6">
            {/* Company Info Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-5">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                About the Company
              </h3>

              <div className="flex items-center space-x-3.5">
                <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                  {job.company.logo ? (
                    <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-6 h-6 text-slate-400" />
                  )}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{job.company.name}</h4>
                  <p className="text-xs text-slate-500">{job.company.industry}</p>
                </div>
              </div>

              {job.company.description && (
                <p className="text-xs text-slate-600 leading-relaxed">
                  {job.company.description}
                </p>
              )}

              <div className="space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Location:</span>
                  <span className="font-semibold text-slate-800">{job.company.location}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Company Size:</span>
                  <span className="font-semibold text-slate-800">{job.company.companySize} employees</span>
                </div>
                {job.company.foundedYear && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">Founded:</span>
                    <span className="font-semibold text-slate-800">{job.company.foundedYear}</span>
                  </div>
                )}
              </div>

              {job.company.website && (
                <div className="pt-2">
                  <a
                    href={job.company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-1.5 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    <span>Visit Company Website</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>

            {/* Similar Jobs */}
            {similarJobs.length > 0 && (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 space-y-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Similar {job.category} Roles
                </h3>
                <div className="space-y-3">
                  {similarJobs.map((simJob) => (
                    <Link
                      key={simJob.id}
                      href={`/jobs/${simJob.id}`}
                      className="block p-3.5 rounded-2xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-indigo-200 transition-all space-y-1 group"
                    >
                      <h5 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                        {simJob.title}
                      </h5>
                      <p className="text-[11px] text-slate-500">{simJob.company.name} • {simJob.location}</p>
                      <p className="text-[11px] font-semibold text-slate-800">
                        {formatSalary(simJob.salaryMin, simJob.salaryMax)}
                      </p>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        job={{
          id: job.id,
          title: job.title,
          company: { name: job.company.name },
        }}
        onSuccess={() => {
          // Refresh or give feedback
        }}
      />
    </div>
  );
}
