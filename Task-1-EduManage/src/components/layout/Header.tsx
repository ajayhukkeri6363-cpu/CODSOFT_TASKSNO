'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Bell,
  Menu,
  LogOut,
  User,
  ShieldCheck,
  GraduationCap,
  BookOpen,
  ChevronDown,
  Sparkles,
} from 'lucide-react';
import { UserSummary } from '@/lib/types';
import { useToast } from '../ui/Toast';

interface HeaderProps {
  user: UserSummary | null;
  onMenuToggle?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuToggle }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showRoleSwitcher, setShowRoleSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast.info('Logged out successfully');
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error(error);
    }
  };

  const handleQuickSwitch = async (role: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    setShowRoleSwitcher(false);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      if (res.ok) {
        toast.success(`Switched role to ${role}`);
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
        router.refresh();
      }
    } catch (err) {
      toast.error('Failed to switch role');
    }
  };

  const getRoleBadge = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return {
          label: 'Admin Portal',
          color: 'bg-rose-50 text-rose-700 border-rose-200',
          icon: ShieldCheck,
        };
      case 'TEACHER':
        return {
          label: 'Faculty Portal',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: BookOpen,
        };
      case 'STUDENT':
        return {
          label: 'Student Portal',
          color: 'bg-blue-50 text-blue-700 border-blue-200',
          icon: GraduationCap,
        };
      default:
        return {
          label: 'EduManage',
          color: 'bg-indigo-50 text-indigo-700 border-indigo-200',
          icon: GraduationCap,
        };
    }
  };

  const roleInfo = getRoleBadge(user?.role);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 md:px-6 backdrop-blur transition-all">
      <div className="flex items-center gap-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-500/20">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 tracking-tight text-base">EduManage</span>
            <span className="text-[10px] block text-slate-500 font-medium -mt-1">Academic Suite</span>
          </div>
        </div>

        <div className="hidden md:flex items-center ml-4">
          <span
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}`}
          >
            <RoleIcon className="w-3.5 h-3.5" />
            {roleInfo.label}
          </span>
        </div>
      </div>

      {/* Right controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Role Switcher (Crucial for evaluation/demo) */}
        <div className="relative">
          <button
            onClick={() => {
              setShowRoleSwitcher(!showRoleSwitcher);
              setShowUserMenu(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-indigo-50/70 text-indigo-700 hover:bg-indigo-100 text-xs font-semibold transition-all shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
            <span className="hidden sm:inline">Role Switcher</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {showRoleSwitcher && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 text-slate-800 z-50 animate-slide-up">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Instant Role Demo
              </div>
              <button
                onClick={() => handleQuickSwitch('ADMIN')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                  user?.role === 'ADMIN' ? 'bg-rose-50 text-rose-700' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-rose-600" />
                <div>
                  <div>Administrator</div>
                  <div className="text-[10px] text-slate-500 font-normal">Full institutional access</div>
                </div>
              </button>
              <button
                onClick={() => handleQuickSwitch('TEACHER')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                  user?.role === 'TEACHER' ? 'bg-emerald-50 text-emerald-700' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <div>
                  <div>Faculty / Teacher</div>
                  <div className="text-[10px] text-slate-500 font-normal">Gradebook & attendance</div>
                </div>
              </button>
              <button
                onClick={() => handleQuickSwitch('STUDENT')}
                className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold rounded-lg text-left transition-colors ${
                  user?.role === 'STUDENT' ? 'bg-blue-50 text-blue-700' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4 text-blue-600" />
                <div>
                  <div>Student Portal</div>
                  <div className="text-[10px] text-slate-500 font-normal">Scores, fees & profile</div>
                </div>
              </button>
            </div>
          )}
        </div>

        {/* Notifications Popover */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowRoleSwitcher(false);
              setShowUserMenu(false);
            }}
            className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-white"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-white p-3 shadow-xl border border-slate-100 text-slate-800 z-50 animate-slide-up">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">Notices</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-semibold px-1.5 py-0.5 rounded">
                  3 New
                </span>
              </div>
              <div className="space-y-2">
                <div className="p-2 bg-indigo-50/60 rounded-lg text-xs">
                  <p className="font-semibold text-indigo-900">🚀 Annual Science Exhibition 2025</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Submissions open for robotics projects.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-xs">
                  <p className="font-semibold text-slate-900">📊 Mid-Term Results Published</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Individual report cards are now accessible.</p>
                </div>
                <div className="p-2 bg-slate-50 rounded-lg text-xs">
                  <p className="font-semibold text-slate-900">📋 Academic Review Notice</p>
                  <p className="text-slate-600 text-[11px] mt-0.5">Faculty audit this Friday at 4 PM.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile dropdown */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowRoleSwitcher(false);
              setShowNotifications(false);
            }}
            className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <img
              src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
              alt={user?.name || 'User'}
              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200"
            />
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-800 truncate max-w-[120px]">{user?.name || 'Account'}</p>
              <p className="text-[10px] text-slate-500 capitalize">{user?.role?.toLowerCase() || 'Guest'}</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-xl bg-white p-2 shadow-xl border border-slate-100 text-slate-800 z-50 animate-slide-up">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
              </div>

              {user?.role === 'STUDENT' && (
                <Link
                  href="/student/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-lg hover:bg-slate-50 text-slate-700"
                >
                  <User className="w-4 h-4 text-slate-400" />
                  My Profile
                </Link>
              )}

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
