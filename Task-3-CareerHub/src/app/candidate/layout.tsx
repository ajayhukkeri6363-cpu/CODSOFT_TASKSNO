'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  FileCheck2,
  Bookmark,
  User,
  FileText,
  Briefcase,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/candidate/dashboard', icon: LayoutDashboard },
  { name: 'My Applications', href: '/candidate/applications', icon: FileCheck2 },
  { name: 'Saved Jobs', href: '/candidate/saved-jobs', icon: Bookmark },
  { name: 'Profile & Skills', href: '/candidate/profile', icon: User },
  { name: 'Resumes & CV', href: '/candidate/resume', icon: FileText },
];

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-[90vh] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Candidate Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
              {/* User header */}
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || 'C'
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Candidate'}</h3>
                  <p className="text-[11px] text-indigo-600 font-semibold">Job Seeker Portal</p>
                </div>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{item.name}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="pt-2">
                <Link
                  href="/jobs"
                  className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-2xl border border-indigo-200 bg-indigo-50 text-indigo-700 text-xs font-bold hover:bg-indigo-100 transition-colors"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Browse Jobs</span>
                </Link>
              </div>
            </div>
          </aside>

          {/* Main Workspace Area */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
