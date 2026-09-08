'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  CalendarCheck,
  CreditCard,
  Award,
  PlusCircle,
  ArrowUpRight,
  TrendingUp,
  School,
  FileCheck,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

export default function AdminDashboardPage() {
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
        <div className="h-8 bg-slate-200 rounded-lg w-48 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Institutional Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time academic metrics, attendance overview, and financial reconciliation.
          </p>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/students"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            Add Student
          </Link>
          <Link
            href="/admin/attendance"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <CalendarCheck className="w-4 h-4 text-emerald-600" />
            Mark Attendance
          </Link>
          <Link
            href="/admin/fees"
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <CreditCard className="w-4 h-4 text-purple-600" />
            Fee Invoices
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard
          title="Total Students"
          value={stats?.totalStudents || 0}
          icon={Users}
          change="+12% this term"
          changeType="positive"
          subtitle="Enrolled learners"
          colorClass="from-blue-600 to-indigo-600"
        />
        <StatsCard
          title="Faculty Members"
          value={stats?.totalTeachers || 0}
          icon={UserCheck}
          subtitle="Active educators"
          colorClass="from-emerald-600 to-teal-600"
        />
        <StatsCard
          title="Attendance Rate"
          value={stats?.attendanceRate || '95%'}
          icon={CalendarCheck}
          change="+2.4% avg"
          changeType="positive"
          subtitle="Last 30 days"
          colorClass="from-amber-500 to-orange-600"
        />
        <StatsCard
          title="Fees Collected"
          value={formatCurrency(stats?.totalFeePaid || 0)}
          icon={CreditCard}
          subtitle={`Total Billed: ${formatCurrency(stats?.totalFeeAmount || 0)}`}
          colorClass="from-purple-600 to-violet-600"
        />
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attendance Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Attendance Activity Trend</h2>
              <p className="text-xs text-slate-500">Daily student presence over recent sessions</p>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              <TrendingUp className="w-3.5 h-3.5" /> High Consistency
            </span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.attendanceChart || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} tickLine={false} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '12px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="present" name="Present" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" name="Absent" fill="#f43f5e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="late" name="Late/Excused" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Fee Collection Status */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Fee Invoices Breakdown</h2>
            <p className="text-xs text-slate-500 mb-4">Collection and pending dues balance</p>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.feeDistribution || []}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {(stats?.feeDistribution || []).map((entry: any, index: number) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Unsettled Invoices</span>
            <span className="font-bold text-rose-600">{stats?.pendingFeesCount || 0} Dues</span>
          </div>
        </div>
      </div>

      {/* Grade Distribution & Recent Students */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Grade Distribution */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Examination Grade Spread</h2>
              <p className="text-xs text-slate-500">Mid-term score distributions</p>
            </div>
            <Award className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.gradeDistribution || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="grade" tick={{ fontSize: 11 }} tickLine={false} stroke="#94a3b8" />
                <YAxis tick={{ fontSize: 11 }} tickLine={false} stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    border: 'none',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="count" name="Students" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Students Table */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">Recently Enrolled Students</h2>
                <p className="text-xs text-slate-500">Quick student directory preview</p>
              </div>
              <Link
                href="/admin/students"
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3">Student</th>
                    <th className="pb-3">Roll No</th>
                    <th className="pb-3">Class</th>
                    <th className="pb-3">Admission ID</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(stats?.recentStudents || []).map((s: any) => (
                    <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 font-medium text-slate-900 flex items-center gap-2.5">
                        <img
                          src={s.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.user.name}`}
                          alt={s.user.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <div>
                          <div>{s.user.name}</div>
                          <div className="text-[10px] text-slate-400 font-normal">{s.user.email}</div>
                        </div>
                      </td>
                      <td className="py-3 text-slate-600 font-mono">{s.rollNumber}</td>
                      <td className="py-3">
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold">
                          {s.class.name}
                        </span>
                      </td>
                      <td className="py-3 text-slate-500">{s.admissionNumber}</td>
                      <td className="py-3 text-right">
                        <Link
                          href={`/admin/students/${s.id}`}
                          className="text-indigo-600 hover:text-indigo-800 font-semibold"
                        >
                          Profile →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
