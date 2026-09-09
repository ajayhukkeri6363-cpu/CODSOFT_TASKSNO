'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatDate, timeAgo } from '@/lib/utils';
import { Button } from '@/ui/Button';
import {
  Shield,
  Users,
  Briefcase,
  FileCheck2,
  Building2,
  TrendingUp,
  Award,
  ArrowRight,
} from 'lucide-react';

interface StatsData {
  totalUsers: number;
  totalCandidates: number;
  totalRecruiters: number;
  totalCompanies: number;
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  selectedApplications: number;
  placementRate: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setRecentUsers(data.recentUsers || []);
          setRecentApplications(data.recentApplications || []);
        }
      } catch {
        // Handle
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />;
  }

  return (
    <div className="space-y-8">
      {/* Admin Hero */}
      <div className="bg-gradient-to-r from-slate-900 via-rose-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-rose-300">
          <Shield className="w-3.5 h-3.5 text-rose-400" />
          <span>System Administration & Platform Governance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          CareerHub Global Administration
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
          Monitor system metrics, enforce listing guidelines, manage user accounts, and oversee hiring throughput.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalUsers || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Platform Users ({stats?.totalCandidates} Candidates, {stats?.totalRecruiters} Recruiters)
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats?.activeJobs || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Job Listings ({stats?.totalJobs} Total)
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <FileCheck2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats?.totalApplications || 0}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Applications Processed
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-2">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <p className="text-2xl font-black text-slate-900">{stats?.placementRate || 0}%</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Hiring Placement Rate
            </p>
          </div>
        </div>
      </div>

      {/* Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Registrations */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent User Signups</h2>
            <Link href="/admin/users" className="text-xs font-bold text-rose-600 hover:underline flex items-center">
              <span>Manage Users</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentUsers.map((u) => (
              <div key={u.id} className="py-3 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-900">{u.name}</p>
                  <p className="text-[11px] text-slate-400">{u.email}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[10px] font-bold text-slate-700">
                    {u.role}
                  </span>
                  <span className={`w-2 h-2 rounded-full ${u.isActive ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Application Activity */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Recent Platform Activity</h2>
            <Link href="/admin/applications" className="text-xs font-bold text-rose-600 hover:underline flex items-center">
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentApplications.map((app) => (
              <div key={app.id} className="py-3 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold text-slate-900">{app.candidate.name}</p>
                  <span className="text-[10px] text-slate-400">{timeAgo(app.createdAt)}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Applied for <strong>{app.job.title}</strong> at {app.job.company.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
