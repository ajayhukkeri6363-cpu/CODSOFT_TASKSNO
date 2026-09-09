'use client';

import React from 'react';
import { ApplicationWithDetails, ApplicationStatus } from '@/lib/types';
import { timeAgo, getStatusBadgeVariant } from '@/lib/utils';
import {
  User,
  Star,
  FileText,
  Calendar,
  MoreVertical,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

interface KanbanBoardProps {
  applications: ApplicationWithDetails[];
  onSelectApplication: (app: ApplicationWithDetails) => void;
  onStatusChange: (appId: string, newStatus: ApplicationStatus) => Promise<void>;
  onScheduleInterview: (app: ApplicationWithDetails) => void;
}

const COLUMNS: { id: ApplicationStatus; title: string; color: string }[] = [
  { id: 'APPLIED', title: 'Applied', color: 'border-blue-300 bg-blue-50/40 text-blue-700' },
  { id: 'UNDER_REVIEW', title: 'Under Review', color: 'border-amber-300 bg-amber-50/40 text-amber-700' },
  { id: 'SHORTLISTED', title: 'Shortlisted', color: 'border-purple-300 bg-purple-50/40 text-purple-700' },
  { id: 'INTERVIEW', title: 'Interview', color: 'border-indigo-300 bg-indigo-50/40 text-indigo-700' },
  { id: 'SELECTED', title: 'Selected / Hired', color: 'border-emerald-300 bg-emerald-50/40 text-emerald-700' },
  { id: 'REJECTED', title: 'Rejected', color: 'border-rose-300 bg-rose-50/40 text-rose-700' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  applications,
  onSelectApplication,
  onStatusChange,
  onScheduleInterview,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 overflow-x-auto pb-4">
      {COLUMNS.map((col) => {
        const colApps = applications.filter((a) => a.status === col.id);

        return (
          <div
            key={col.id}
            className="flex flex-col rounded-2xl bg-slate-100/80 border border-slate-200/80 p-3 min-h-[500px]"
          >
            {/* Column Header */}
            <div className="flex items-center justify-between px-2 py-2 mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-800">{col.title}</span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${col.color}`}
                >
                  {colApps.length}
                </span>
              </div>
            </div>

            {/* Applications List */}
            <div className="flex-1 space-y-2.5 overflow-y-auto">
              {colApps.map((app) => {
                const profile = app.candidate.candidateProfile;

                return (
                  <div
                    key={app.id}
                    onClick={() => onSelectApplication(app)}
                    className="group relative bg-white rounded-xl p-3.5 border border-slate-200 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer space-y-2.5"
                  >
                    {/* Top Row: Candidate info */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                          {app.candidate.avatar ? (
                            <img
                              src={app.candidate.avatar}
                              alt={app.candidate.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            app.candidate.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {app.candidate.name}
                          </h4>
                          <p className="text-[10px] text-slate-500 line-clamp-1">
                            {app.job.title}
                          </p>
                        </div>
                      </div>

                      {/* Rating if set */}
                      {(app.rating || 0) > 0 && (
                        <div className="flex items-center space-x-0.5 text-amber-500 text-[10px] font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{app.rating}</span>
                        </div>
                      )}
                    </div>

                    {/* Headline or skills preview */}
                    {profile?.headline && (
                      <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                        {profile.headline}
                      </p>
                    )}

                    {/* Scheduled interview pill if any */}
                    {app.interview && (
                      <div className="p-1.5 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-between text-[10px] text-indigo-700">
                        <span className="flex items-center space-x-1 font-semibold truncate">
                          <Calendar className="w-3 h-3 shrink-0" />
                          <span>Interview Scheduled</span>
                        </span>
                      </div>
                    )}

                    {/* Footer: Date & Quick Actions */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10px] text-slate-400">
                      <span>{timeAgo(app.createdAt)}</span>

                      <div className="flex items-center space-x-1">
                        {col.id !== 'INTERVIEW' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onScheduleInterview(app);
                            }}
                            title="Schedule Interview"
                            className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded"
                          >
                            <Calendar className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <span className="text-indigo-600 font-semibold group-hover:underline flex items-center">
                          Review <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {colApps.length === 0 && (
                <div className="h-28 rounded-xl border border-dashed border-slate-200 flex items-center justify-center text-center p-3">
                  <p className="text-[11px] text-slate-400">No applicants</p>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
