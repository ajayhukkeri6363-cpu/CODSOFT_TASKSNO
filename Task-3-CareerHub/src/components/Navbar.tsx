'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import {
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  FileText,
  Bookmark,
  PlusCircle,
  Users,
  Building2,
  Shield,
  LayoutDashboard,
  KanbanSquare,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin/dashboard';
    if (user.role === 'RECRUITER') return '/recruiter/dashboard';
    return '/candidate/dashboard';
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                <Briefcase className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
                  Career<span className="text-indigo-600">Hub</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-0.5">
                  Talent Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center pl-8 space-x-1">
              <Link
                href="/jobs"
                className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/jobs'
                    ? 'text-indigo-600 bg-indigo-50 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Browse Jobs
              </Link>

              {user?.role === 'CANDIDATE' && (
                <>
                  <Link
                    href="/candidate/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/candidate/dashboard')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/candidate/applications"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/candidate/applications')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Applications
                  </Link>
                  <Link
                    href="/candidate/saved-jobs"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/candidate/saved-jobs')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Saved Jobs
                  </Link>
                </>
              )}

              {user?.role === 'RECRUITER' && (
                <>
                  <Link
                    href="/recruiter/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/recruiter/dashboard'
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link
                    href="/recruiter/jobs"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/recruiter/jobs')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    My Jobs
                  </Link>
                  <Link
                    href="/recruiter/applications"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/recruiter/applications')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    ATS Pipeline
                  </Link>
                </>
              )}

              {user?.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin/dashboard"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname === '/admin/dashboard'
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Admin Overview
                  </Link>
                  <Link
                    href="/admin/users"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin/users')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Users
                  </Link>
                  <Link
                    href="/admin/jobs"
                    className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                      pathname.startsWith('/admin/jobs')
                        ? 'text-indigo-600 bg-indigo-50 font-semibold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    Job Moderation
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action buttons */}
          <div className="hidden md:flex items-center space-x-3">
            {!user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:text-indigo-600 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register?role=RECRUITER"
                  className="px-3.5 py-2 text-sm font-medium text-slate-600 border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Post a Job
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm shadow-indigo-100 transition-all hover:shadow"
                >
                  Create Account
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center space-x-3 p-1.5 pl-3 rounded-full border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-sm"
                >
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">{user.name}</p>
                    <p className="text-[10px] font-medium text-indigo-600 capitalize">
                      {user.role.toLowerCase()}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs uppercase">
                    {user.avatar ? (
                      <img src={user.avatar} alt={user.name} className="w-8 h-8 rounded-full object-cover" />
                    ) : (
                      user.name.charAt(0)
                    )}
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-56 rounded-2xl bg-white p-2 shadow-2xl border border-slate-100 z-50 animate-in fade-in zoom-in-95"
                    onClick={() => setProfileDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-100 mb-1">
                      <p className="text-xs font-medium text-slate-500">Signed in as</p>
                      <p className="text-sm font-semibold text-slate-900 truncate">{user.email}</p>
                    </div>

                    <Link
                      href={getDashboardLink()}
                      className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4 text-slate-400" />
                      <span>Dashboard</span>
                    </Link>

                    {user.role === 'CANDIDATE' && (
                      <>
                        <Link
                          href="/candidate/profile"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          <span>My Profile</span>
                        </Link>
                        <Link
                          href="/candidate/resume"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <FileText className="w-4 h-4 text-slate-400" />
                          <span>Resume & Documents</span>
                        </Link>
                        <Link
                          href="/candidate/saved-jobs"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Bookmark className="w-4 h-4 text-slate-400" />
                          <span>Saved Jobs</span>
                        </Link>
                      </>
                    )}

                    {user.role === 'RECRUITER' && (
                      <>
                        <Link
                          href="/recruiter/jobs/new"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <PlusCircle className="w-4 h-4 text-slate-400" />
                          <span>Post New Job</span>
                        </Link>
                        <Link
                          href="/recruiter/applications"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <KanbanSquare className="w-4 h-4 text-slate-400" />
                          <span>ATS Pipeline</span>
                        </Link>
                        <Link
                          href="/recruiter/company"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Building2 className="w-4 h-4 text-slate-400" />
                          <span>Company Profile</span>
                        </Link>
                      </>
                    )}

                    {user.role === 'ADMIN' && (
                      <>
                        <Link
                          href="/admin/users"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Users className="w-4 h-4 text-slate-400" />
                          <span>Manage Users</span>
                        </Link>
                        <Link
                          href="/admin/jobs"
                          className="flex items-center space-x-2.5 px-3 py-2 text-sm text-slate-700 rounded-xl hover:bg-slate-50 transition-colors"
                        >
                          <Shield className="w-4 h-4 text-slate-400" />
                          <span>Job Moderation</span>
                        </Link>
                      </>
                    )}

                    <div className="border-t border-slate-100 my-1" />

                    <button
                      onClick={() => logout()}
                      className="flex w-full items-center space-x-2.5 px-3 py-2 text-sm text-rose-600 rounded-xl hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            href="/jobs"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
          >
            Browse Jobs
          </Link>

          {user ? (
            <>
              <Link
                href={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-base font-medium text-indigo-600 bg-indigo-50"
              >
                Dashboard ({user.name})
              </Link>
              {user.role === 'CANDIDATE' && (
                <>
                  <Link
                    href="/candidate/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    My Applications
                  </Link>
                  <Link
                    href="/candidate/saved-jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Saved Jobs
                  </Link>
                  <Link
                    href="/candidate/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Profile Settings
                  </Link>
                </>
              )}
              {user.role === 'RECRUITER' && (
                <>
                  <Link
                    href="/recruiter/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Manage Job Listings
                  </Link>
                  <Link
                    href="/recruiter/applications"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    ATS Pipeline
                  </Link>
                  <Link
                    href="/recruiter/jobs/new"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Post New Job
                  </Link>
                </>
              )}
              {user.role === 'ADMIN' && (
                <>
                  <Link
                    href="/admin/users"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    User Management
                  </Link>
                  <Link
                    href="/admin/jobs"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-3 py-2 rounded-lg text-base font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Job Moderation
                  </Link>
                </>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left block px-3 py-2 rounded-lg text-base font-medium text-rose-600 hover:bg-rose-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center px-4 py-2.5 rounded-xl bg-indigo-600 text-sm font-medium text-white shadow-sm"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};
