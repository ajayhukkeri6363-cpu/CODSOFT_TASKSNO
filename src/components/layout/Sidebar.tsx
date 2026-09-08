'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  School,
  CalendarCheck,
  FileText,
  Award,
  CreditCard,
  FileBadge,
  User,
  BookOpen,
  X,
  GraduationCap,
} from 'lucide-react';
import { Role } from '@/lib/types';

interface SidebarProps {
  role?: Role;
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ role = 'ADMIN', isOpen = false, onClose }) => {
  const pathname = usePathname();

  const adminNav = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Students', href: '/admin/students', icon: Users },
    { label: 'Teachers', href: '/admin/teachers', icon: UserCheck },
    { label: 'Classes & Courses', href: '/admin/classes', icon: School },
    { label: 'Attendance', href: '/admin/attendance', icon: CalendarCheck },
    { label: 'Examinations', href: '/admin/examinations', icon: FileText },
    { label: 'Exam Results', href: '/admin/results', icon: Award },
    { label: 'Fees & Invoices', href: '/admin/fees', icon: CreditCard },
    { label: 'Academic Records', href: '/admin/academic-records', icon: FileBadge },
  ];

  const teacherNav = [
    { label: 'Dashboard', href: '/teacher', icon: LayoutDashboard },
    { label: 'My Classes', href: '/teacher/classes', icon: School },
    { label: 'Students Roster', href: '/teacher/students', icon: Users },
    { label: 'Attendance Entry', href: '/teacher/attendance', icon: CalendarCheck },
    { label: 'Gradebook & Marks', href: '/teacher/results', icon: Award },
  ];

  const studentNav = [
    { label: 'Dashboard', href: '/student', icon: LayoutDashboard },
    { label: 'My Profile', href: '/student/profile', icon: User },
    { label: 'My Attendance', href: '/student/attendance', icon: CalendarCheck },
    { label: 'Exam Results', href: '/student/results', icon: Award },
    { label: 'Fee Dues & Receipts', href: '/student/fees', icon: CreditCard },
    { label: 'Academic Overview', href: '/student/academics', icon: BookOpen },
  ];

  const navItems = role === 'ADMIN' ? adminNav : role === 'TEACHER' ? teacherNav : studentNav;

  const getPortalInfo = () => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin Workspace', tag: 'Full Control', badge: 'bg-rose-100 text-rose-800' };
      case 'TEACHER':
        return { label: 'Teacher Workspace', tag: 'Faculty', badge: 'bg-emerald-100 text-emerald-800' };
      case 'STUDENT':
        return { label: 'Student Workspace', tag: 'Learner', badge: 'bg-blue-100 text-blue-800' };
      default:
        return { label: 'EduManage', tag: 'Portal', badge: 'bg-indigo-100 text-indigo-800' };
    }
  };

  const portal = getPortalInfo();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white shadow-lg lg:shadow-none transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-100">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <span className="font-extrabold text-slate-900 tracking-tight text-lg">EduManage</span>
              <span className="text-[10px] block text-indigo-600 font-semibold tracking-wide uppercase -mt-1">
                SIS Platform
              </span>
            </div>
          </Link>
          {onClose && (
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Portal status banner */}
        <div className="px-4 py-3 mx-3 mt-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-800">{portal.label}</p>
            <p className="text-[10px] text-slate-500">Academic Year 2024-25</p>
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${portal.badge}`}>
            {portal.tag}
          </span>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && item.href !== '/teacher' && item.href !== '/student' && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{item.label}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <div className="rounded-xl p-3 bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100/80">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-[11px] font-bold text-slate-800">CodSoft Task 1</span>
            </div>
            <p className="text-[10px] text-slate-500">EduManage v1.0.0 • Full Stack SIS</p>
          </div>
        </div>
      </aside>
    </>
  );
};
