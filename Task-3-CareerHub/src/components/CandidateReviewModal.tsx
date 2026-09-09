'use client';

import React, { useState } from 'react';
import { Modal } from '@/ui/Modal';
import { Button } from '@/ui/Button';
import { StatusBadge } from '@/components/StatusBadge';
import { ApplicationWithDetails } from '@/lib/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/context/ToastContext';
import {
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Calendar,
  Star,
  ExternalLink,
  Briefcase,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

interface CandidateReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: ApplicationWithDetails;
  onStatusChange: (applicationId: string, newStatus: string) => Promise<void>;
  onOpenScheduleInterview: (application: ApplicationWithDetails) => void;
}

export const CandidateReviewModal: React.FC<CandidateReviewModalProps> = ({
  isOpen,
  onClose,
  application,
  onStatusChange,
  onOpenScheduleInterview,
}) => {
  const { success, error } = useToast();
  const [rating, setRating] = useState<number>(application.rating || 0);
  const [recruiterNotes, setRecruiterNotes] = useState<string>(application.recruiterNotes || '');
  const [savingNotes, setSavingNotes] = useState(false);

  // Parse candidate profile JSON fields safely
  const candidate = application.candidate;
  const profile = candidate.candidateProfile;

  let skillsList: string[] = [];
  try {
    if (profile?.skills) {
      skillsList = JSON.parse(profile.skills);
    }
  } catch {}

  const handleSaveNotes = async () => {
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/applications/${application.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          recruiterNotes,
        }),
      });
      if (res.ok) {
        success('Recruiter notes & rating updated successfully');
      } else {
        error('Failed to update notes');
      }
    } catch {
      error('Network error saving notes');
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Candidate Review & ATS Evaluation"
      description={`Application for ${application.job.title}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Top Header Card */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
          <div className="flex items-center space-x-3.5">
            <div className="w-14 h-14 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg overflow-hidden shrink-0">
              {candidate.avatar ? (
                <img src={candidate.avatar} alt={candidate.name} className="w-full h-full object-cover" />
              ) : (
                candidate.name.charAt(0)
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h4 className="text-base font-bold text-slate-900">{candidate.name}</h4>
                <StatusBadge status={application.status} size="sm" />
              </div>
              <p className="text-xs text-slate-600 font-medium">
                {profile?.headline || 'Candidate Applicant'}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3 h-3 text-slate-400" />
                  <span>{candidate.email}</span>
                </span>
                {candidate.phone && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{candidate.phone}</span>
                  </span>
                )}
                {profile?.location && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{profile.location}</span>
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex flex-col items-end shrink-0">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
              Rating
            </span>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className="text-amber-400 hover:scale-110 transition-transform focus:outline-none"
                >
                  <Star
                    className={`w-5 h-5 ${
                      star <= rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stage Progression Buttons */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
            Move Stage
          </label>
          <div className="flex flex-wrap gap-2">
            {['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'INTERVIEW', 'SELECTED', 'REJECTED'].map(
              (stage) => (
                <button
                  key={stage}
                  onClick={() => onStatusChange(application.id, stage)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    application.status === stage
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {stage.replace('_', ' ')}
                </button>
              )
            )}
          </div>
        </div>

        {/* Resume Preview Box */}
        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-white text-indigo-600 shadow-sm border border-indigo-100">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">
                {application.resume?.fileName || 'Candidate_Resume.pdf'}
              </p>
              <p className="text-[11px] text-slate-500">
                Uploaded {formatDate(application.resume?.uploadedAt || application.createdAt)}
              </p>
            </div>
          </div>

          <a
            href={application.resume?.fileUrl || '#'}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-white border border-indigo-200 text-xs font-semibold text-indigo-700 hover:bg-indigo-50 transition-colors shadow-sm"
          >
            <span>View Resume</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Cover Letter */}
        {application.coverLetter && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Cover Letter & Candidate Notes
            </h5>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {application.coverLetter}
            </div>
          </div>
        )}

        {/* Candidate Bio & Skills */}
        {profile?.bio && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">About</h5>
            <p className="text-xs text-slate-600 leading-relaxed">{profile.bio}</p>
          </div>
        )}

        {skillsList.length > 0 && (
          <div className="space-y-1.5">
            <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Candidate Skills
            </h5>
            <div className="flex flex-wrap gap-1.5">
              {skillsList.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Interview Banner if any */}
        {application.interview && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-1.5">
                  <Calendar className="w-4 h-4 text-indigo-200" />
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                    Scheduled Interview
                  </span>
                </div>
                <h5 className="text-sm font-bold mt-1">
                  {formatDate(application.interview.scheduledDate)} at {application.interview.timeSlot}
                </h5>
                <p className="text-xs text-indigo-100 mt-0.5">
                  Type: {application.interview.meetingType}
                </p>
              </div>

              <a
                href={application.interview.meetingUrl}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 rounded-xl bg-white text-indigo-600 text-xs font-bold hover:bg-indigo-50 transition-colors shadow-sm"
              >
                Join Meeting
              </a>
            </div>
          </div>
        )}

        {/* Recruiter Internal Notes */}
        <div className="space-y-2 pt-2 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Internal Recruiter Evaluation Notes
            </label>
            <span className="text-[10px] text-slate-400">Private to recruitment team</span>
          </div>
          <textarea
            rows={3}
            value={recruiterNotes}
            onChange={(e) => setRecruiterNotes(e.target.value)}
            placeholder="Document interview feedback, salary expectations, technical strengths..."
            className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <div className="flex justify-end">
            <Button
              size="sm"
              variant="secondary"
              onClick={handleSaveNotes}
              isLoading={savingNotes}
            >
              Save Notes & Rating
            </Button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
          <Button
            variant="outline"
            leftIcon={<Calendar className="w-4 h-4" />}
            onClick={() => {
              onClose();
              onOpenScheduleInterview(application);
            }}
          >
            Schedule Interview
          </Button>

          <div className="flex items-center space-x-2">
            <Button variant="ghost" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
