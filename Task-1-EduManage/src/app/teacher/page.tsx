'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  School,
  Users,
  CalendarCheck,
  Award,
  BookOpen,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatDate } from '@/lib/utils';

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Greeting Banner */}
      <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-emerald-700/15 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 border border-white/20 text-emerald-100 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" /> Faculty Academic Portal
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Welcome back, Educator!
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-emerald-100/90 leading-relaxed font-normal">
            Track your student attendance, publish examination scorecards, and review classroom academic progress.
          </p>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Assigned Classes"
          value={stats?.totalClasses || 1}
          icon={School}
          subtitle="Primary Class Cohorts"
          colorClass="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Total Students Taught"
          value={stats?.totalAssignedStudents || 35}
          icon={Users}
          subtitle="Enrolled under guidance"
          colorClass="from-blue-600 to-indigo-600"
        />
        <StatsCard
          title="Curriculum Subjects"
          value={stats?.totalSubjects || 2}
          icon={BookOpen}
          subtitle="Assigned Teaching Units"
          colorClass="from-purple-600 to-violet-600"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Managed Classes Grid */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Your Assigned Class Cohorts</h2>
              <p className="text-xs text-slate-500">Classes under your direct instruction</p>
            </div>
            <Link
              href="/teacher/classes"
              className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(stats?.managedClasses || []).map((cls: any) => (
              <div
                key={cls.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {cls.gradeLevel}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">{cls.roomNumber || 'Room 101'}</span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">{cls.name}</h3>
                  <p className="text-xs text-slate-500 mt-1 mb-4">
                    Capacity: {cls.capacity} students (Section {cls.section})
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  <Link
                    href={`/teacher/attendance`}
                    className="flex-1 text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                  >
                    Take Attendance
                  </Link>
                  <Link
                    href={`/teacher/results`}
                    className="flex-1 text-center py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
                  >
                    Enter Marks
                  </Link>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Daily Faculty Shortcuts
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Link
                href="/teacher/attendance"
                className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 hover:bg-emerald-100 text-left transition-colors flex items-center gap-3"
              >
                <div className="p-2 bg-emerald-600 text-white rounded-lg">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-950">Roll Call</p>
                  <p className="text-[10px] text-emerald-700">Mark daily presence</p>
                </div>
              </Link>

              <Link
                href="/teacher/results"
                className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200/80 hover:bg-indigo-100 text-left transition-colors flex items-center gap-3"
              >
                <div className="p-2 bg-indigo-600 text-white rounded-lg">
                  <Award className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-indigo-950">Gradebook</p>
                  <p className="text-[10px] text-indigo-700">Record exam marks</p>
                </div>
              </Link>

              <Link
                href="/teacher/students"
                className="p-3.5 rounded-xl bg-purple-50/70 border border-purple-200/80 hover:bg-purple-100 text-left transition-colors flex items-center gap-3"
              >
                <div className="p-2 bg-purple-600 text-white rounded-lg">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-purple-950">Student Roster</p>
                  <p className="text-[10px] text-purple-700">View performance</p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Results & Announcements */}
        <div className="space-y-6">
          {/* Recent Marks */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 mb-1">Recent Exam Marks</h3>
            <p className="text-xs text-slate-500 mb-3">Scores recently entered</p>

            <div className="space-y-2.5">
              {(stats?.recentResults || []).length === 0 ? (
                <p className="text-xs text-slate-400 italic">No score records yet.</p>
              ) : (
                stats.recentResults.map((r: any) => (
                  <div
                    key={r.id}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{r.student?.user?.name}</p>
                      <p className="text-[10px] text-slate-400">{r.subject?.name}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-slate-900">{r.marksObtained}/100</span>
                      <span className="block text-[10px] font-bold text-emerald-600">{r.grade}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Institutional Noticeboard */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Faculty Notices</h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Official
              </span>
            </div>

            <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-100/70 text-xs">
              <p className="font-bold text-emerald-950">📋 Term 2 Audit Submission</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Please finalize all continuous assessment marks by this Friday at 4:00 PM.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
