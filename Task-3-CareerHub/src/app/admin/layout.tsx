'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  FileCheck2,
  Shield,
} from 'lucide-react';

const NAV_ITEMS = [
  { name: 'Platform Overview', href: '/admin/dashboard', icon: LayoutDashboard },
  { name: 'User Management', href: '/admin/users', icon: Users },
  { name: 'Job Moderation', href: '/admin/jobs', icon: ShieldAlert },
  { name: 'Application Oversight', href: '/admin/applications', icon: FileCheck2 },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user } = useAuth();

  return (
    <div className="min-h-[90vh] bg-slate-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Admin Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-sm space-y-5">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
                <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-base overflow-hidden shrink-0">
                  <Shield className="w-6 h-6" />
                </div>
                <div className="overflow-hidden">
                  <h3 className="text-sm font-bold text-slate-900 truncate">{user?.name || 'Administrator'}</h3>
                  <p className="text-[11px] text-rose-600 font-semibold">Superadmin Panel</p>
                </div>
              </div>

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
                          ? 'bg-rose-600 text-white shadow-md shadow-rose-100'
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

          {/* Main Admin Area */}
          <main className="lg:col-span-4">{children}</main>
        </div>
      </div>
    </div>
  );
}
