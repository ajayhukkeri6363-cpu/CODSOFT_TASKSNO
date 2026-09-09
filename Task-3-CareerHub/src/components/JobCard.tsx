'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { JobWithDetails } from '@/lib/types';
import { formatSalary, formatJobType, formatRemote, formatExperience, timeAgo } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  MapPin,
  Building2,
  DollarSign,
  Bookmark,
  Clock,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

interface JobCardProps {
  job: JobWithDetails;
  isSavedInitial?: boolean;
  onBookmarkToggle?: (jobId: string, saved: boolean) => void;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  isSavedInitial = false,
  onBookmarkToggle,
}) => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [isSaved, setIsSaved] = useState(isSavedInitial);
  const [saving, setSaving] = useState(false);

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      error('Please sign in as a candidate to save jobs');
      return;
    }

    if (user.role !== 'CANDIDATE') {
      error('Only candidate accounts can save jobs');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/saved-jobs', {
        method: isSaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId: job.id }),
      });

      if (res.ok) {
        const nextSaved = !isSaved;
        setIsSaved(nextSaved);
        if (nextSaved) {
          success(`Saved "${job.title}" to your bookmarks`);
        } else {
          success(`Removed "${job.title}" from your bookmarks`);
        }
        if (onBookmarkToggle) {
          onBookmarkToggle(job.id, nextSaved);
        }
      } else {
        error('Failed to update bookmark');
      }
    } catch {
      error('Network error updating bookmark');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`group relative bg-white rounded-2xl border transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 ${
      job.isFeatured ? 'border-indigo-200 bg-gradient-to-b from-indigo-50/20 to-white shadow-sm' : 'border-slate-200 hover:border-slate-300'
    } p-6`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 group-hover:border-indigo-200 transition-colors">
            {job.company.logo ? (
              <img src={job.company.logo} alt={job.company.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 className="w-6 h-6 text-slate-400" />
            )}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {job.company.name}
              </span>
              {job.isFeatured && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-700">
                  <Sparkles className="w-2.5 h-2.5 mr-1" /> Featured
                </span>
              )}
            </div>
            <Link href={`/jobs/${job.id}`} className="block">
              <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {job.title}
              </h3>
            </Link>
          </div>
        </div>

        {/* Save Bookmark Button */}
        <button
          onClick={handleToggleSave}
          disabled={saving}
          title={isSaved ? 'Remove from saved' : 'Save job'}
          className={`p-2 rounded-xl border transition-colors ${
            isSaved
              ? 'bg-indigo-50 border-indigo-200 text-indigo-600 hover:bg-indigo-100'
              : 'border-slate-200 text-slate-400 hover:text-indigo-600 hover:border-slate-300 hover:bg-slate-50'
          }`}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-indigo-600' : ''}`} />
        </button>
      </div>

      {/* Meta tags */}
      <div className="mt-4 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-slate-600">
        <div className="flex items-center space-x-1.5">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span>{job.location}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <DollarSign className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-semibold text-slate-900">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>{timeAgo(job.createdAt)}</span>
        </div>
      </div>

      {/* Badges */}
      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700">
          {formatJobType(job.jobType)}
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-blue-50 text-blue-700">
          {formatRemote(job.remoteStatus)}
        </span>
        <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-50 text-purple-700">
          {formatExperience(job.experienceLevel)}
        </span>
      </div>

      {/* Skills */}
      {job.skills && job.skills.length > 0 && (
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {job.skills.slice(0, 4).map((s) => (
              <span key={s.id} className="text-[11px] font-medium text-slate-600 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                {s.skillName}
              </span>
            ))}
            {job.skills.length > 4 && (
              <span className="text-[11px] font-medium text-slate-400 px-1 py-0.5">
                +{job.skills.length - 4} more
              </span>
            )}
          </div>

          <Link
            href={`/jobs/${job.id}`}
            className="inline-flex items-center text-xs font-bold text-indigo-600 hover:text-indigo-700 group-hover:translate-x-0.5 transition-transform"
          >
            <span>Apply Now</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      )}
    </div>
  );
};
