'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  CalendarCheck,
  Award,
  CreditCard,
  BookOpen,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function StudentDashboardPage() {
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
        <div className="h-32 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  const student = stats?.student;

  return (
    <div className="space-y-8">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-violet-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-700/15 relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <img
              src={
                student?.user?.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                  student?.user?.name || 'Student'
                )}`
              }
              alt={student?.user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg"
            />
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/15 text-blue-100 text-[11px] font-bold mb-1">
                <Sparkles className="w-3 h-3" /> Student Portal • Academic Session 2024-25
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">{student?.user?.name}</h1>
              <p className="text-xs sm:text-sm text-blue-100/90 mt-0.5 flex flex-wrap items-center gap-2">
                <span>Class: <strong>{student?.class?.name}</strong></span>
                <span>•</span>
                <span>Roll No: <strong className="font-mono">{student?.rollNumber}</strong></span>
                <span>•</span>
                <span>Admission ID: <strong className="font-mono">{student?.admissionNumber}</strong></span>
              </p>
            </div>
          </div>

          <Link
            href="/student/profile"
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-xl text-xs font-bold transition-all border border-white/20 shadow-sm"
          >
            View Full Profile →
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatsCard
          title="Attendance Rate"
          value={stats?.attendancePercent || '100%'}
          icon={CalendarCheck}
          subtitle="Recent classroom presence"
          colorClass="from-emerald-500 to-teal-600"
        />
        <StatsCard
          title="Cumulative GPA"
          value={stats?.gpa?.toFixed(2) || '3.85'}
          icon={Award}
          subtitle="Top Tier Standing"
          colorClass="from-indigo-600 to-violet-600"
        />
        <StatsCard
          title="Fee Status"
          value={
            stats?.pendingFeesCount > 0
              ? `${formatCurrency(stats?.totalPendingFeeAmount || 0)} Due`
              : 'All Cleared'
          }
          icon={CreditCard}
          subtitle={stats?.pendingFeesCount > 0 ? `${stats?.pendingFeesCount} Pending Invoices` : 'No Dues'}
          colorClass={stats?.pendingFeesCount > 0 ? 'from-rose-500 to-pink-600' : 'from-emerald-600 to-teal-600'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Exam Results */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Latest Examination Scorecards</h2>
              <p className="text-xs text-slate-500">Official graded results from Mid-Term exams</p>
            </div>
            <Link
              href="/student/results"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Full Report Card <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Exam Term</th>
                  <th className="py-2.5 px-3">Marks</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Grade</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(stats?.recentResults || []).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-slate-400">
                      No examination results recorded yet.
                    </td>
                  </tr>
                ) : (
                  (stats?.recentResults || []).map((res: any) => (
                    <tr key={res.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-3 font-bold text-slate-900">{res.subject?.name}</td>
                      <td className="py-3 px-3 text-slate-600">{res.exam?.name}</td>
                      <td className="py-3 px-3 font-bold text-slate-900">
                        {res.marksObtained} / {res.totalMarks}
                      </td>
                      <td className="py-3 px-3 font-bold text-indigo-600">{res.percentage}%</td>
                      <td className="py-3 px-3">
                        <span className="px-2.5 py-0.5 rounded-md font-black text-xs bg-indigo-50 text-indigo-700">
                          {res.grade}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Notices */}
        <div className="space-y-6">
          {/* Quick Shortcuts */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Student Quick Access
            </h3>

            <Link
              href="/student/attendance"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-100 text-emerald-700">
                  <CalendarCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Attendance Calendar</p>
                  <p className="text-[10px] text-slate-500">Track monthly presence</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/student/fees"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-100 text-purple-700">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Fee Invoices & Dues</p>
                  <p className="text-[10px] text-slate-500">Download payment receipts</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>

            <Link
              href="/student/academics"
              className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Enrolled Courses</p>
                  <p className="text-[10px] text-slate-500">Subject teachers & syllabus</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-400" />
            </Link>
          </div>

          {/* Student Notices */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-sm font-bold text-slate-900">Campus Notices</h3>
            <div className="p-3 bg-indigo-50/60 rounded-xl text-xs">
              <p className="font-bold text-indigo-950">🚀 Science Fair Submissions</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Robotics and science exhibition registration closes November 10th.
              </p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl text-xs">
              <p className="font-bold text-slate-900">📑 Library Returns</p>
              <p className="text-slate-600 text-[11px] mt-0.5">
                Return term textbooks by Friday to avoid overdue fines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
