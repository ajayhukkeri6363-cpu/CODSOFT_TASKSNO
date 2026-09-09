'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Briefcase,
  KanbanSquare,
  PlusCircle,
  Building2,
  Users,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { name: 'My Job Listings', href: '/recruiter/jobs', icon: Briefcase },
  { name: 'Post New Job', href: '/recruiter/jobs/new', icon: PlusCircle },
  { name: 'ATS Kanban Pipeline', href: '/recruiter/applications', icon: KanbanSquare },
  { name: 'Company Profile', href: '/recruiter/company', icon: Building2 },
];

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-[90vh] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Recruiter Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
              {/* Recruiter header */}
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  {user?.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user?.name?.charAt(0) || 'R'
                  )}
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Recruiter'}</h3>
                  <p className="text-[11px] text-indigo-600 font-semibold">Recruiter Workspace</p>
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
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
