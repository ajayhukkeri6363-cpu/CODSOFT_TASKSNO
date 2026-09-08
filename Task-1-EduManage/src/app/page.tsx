'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  Users,
  CalendarCheck,
  Award,
  CreditCard,
  FileBadge,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Lock,
  Layers,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LandingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loadingRole, setLoadingRole] = useState<string | null>(null);

  const handleQuickDemoLogin = async (role: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    setLoadingRole(role);
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Logged in as ${role} demo user!`);
        if (role === 'ADMIN') router.push('/admin');
        else if (role === 'TEACHER') router.push('/teacher');
        else router.push('/student');
      } else {
        toast.error(data.error || 'Failed to login demo user');
      }
    } catch (error) {
      toast.error('Network error occurred during demo login');
    } finally {
      setLoadingRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-900/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25">
              <GraduationCap className="h-6 w-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight text-white">EduManage</span>
              <span className="text-[10px] block text-indigo-400 font-semibold tracking-wider uppercase -mt-1">
                SIS Suite
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="px-4 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={() => handleQuickDemoLogin('ADMIN')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 rounded-lg shadow-md shadow-indigo-600/30 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Live Demo Login
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden">
        {/* Glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-600/20 blur-[120px] pointer-events-none rounded-full" />
        <div className="absolute top-1/3 right-10 w-[300px] h-[250px] bg-violet-600/15 blur-[100px] pointer-events-none rounded-full" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
            CodSoft Full Stack Internship • Task 1 Submission
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15]">
            Complete Digital Operating System for{' '}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">
              Educational Institutions
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            EduManage connects Students, Teachers, and Administrators with full-stack role-based workflows for
            attendance, examination gradebooks, fee invoicing, and academic transcripts.
          </p>

          {/* 1-Click Interactive Demo Access Cards */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="text-xs font-bold uppercase tracking-widest text-indigo-400 mb-4 flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Instant 1-Click Demo Evaluation Portals
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-left">
              {/* Admin Demo Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 hover:border-rose-500/50 rounded-2xl p-5 shadow-xl transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300">
                    Admin
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-rose-300 transition-colors">
                  Administrator
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Full CRUD on students, teachers, classes, exams, fee billing & statistics.
                </p>
                <button
                  onClick={() => handleQuickDemoLogin('ADMIN')}
                  disabled={loadingRole !== null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all disabled:opacity-50"
                >
                  {loadingRole === 'ADMIN' ? 'Launching...' : 'Launch Admin Demo'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Teacher Demo Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 hover:border-emerald-500/50 rounded-2xl p-5 shadow-xl transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300">
                    Faculty
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-emerald-300 transition-colors">
                  Teacher Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Assigned class rosters, daily attendance marker, and exam marks grading.
                </p>
                <button
                  onClick={() => handleQuickDemoLogin('TEACHER')}
                  disabled={loadingRole !== null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-lg shadow-emerald-600/30 transition-all disabled:opacity-50"
                >
                  {loadingRole === 'TEACHER' ? 'Launching...' : 'Launch Teacher Demo'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Student Demo Card */}
              <div className="bg-slate-800/80 border border-slate-700/80 hover:border-blue-500/50 rounded-2xl p-5 shadow-xl transition-all hover:-translate-y-1 group">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300">
                    Student
                  </span>
                </div>
                <h3 className="font-bold text-white text-base group-hover:text-blue-300 transition-colors">
                  Student Portal
                </h3>
                <p className="text-xs text-slate-400 mt-1 mb-4 leading-relaxed">
                  Personal attendance breakdown, report cards, fee receipts & course history.
                </p>
                <button
                  onClick={() => handleQuickDemoLogin('STUDENT')}
                  disabled={loadingRole !== null}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs shadow-lg shadow-blue-600/30 transition-all disabled:opacity-50"
                >
                  {loadingRole === 'STUDENT' ? 'Launching...' : 'Launch Student Demo'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Modules Grid */}
      <section className="py-16 bg-slate-950/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Complete Educational Administration Suite
            </h2>
            <p className="text-sm text-slate-400 mt-2">
              Every workflow engineered with real database relationships, type safety, and responsive UI.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Student & Teacher Management */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Student & Faculty Directory</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Complete CRUD for student and teacher profiles, enrollment records, parent contact details, and department allocations.
              </p>
            </div>

            {/* Attendance System */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4">
                <CalendarCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Smart Attendance Tracking</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Daily attendance manager with 1-click batch marking, date filters, leave remarks, and automated attendance percentage metrics.
              </p>
            </div>

            {/* Examinations & Gradebook */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4">
                <Award className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Examinations & Gradebook</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Schedule exams, enter subject marks, auto-calculate letter grades (A+, A, B...) and percentages with official report card generation.
              </p>
            </div>

            {/* Fee Billing */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-4">
                <CreditCard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Fee Billing & Invoicing</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Generate student invoices, record payments (Paid, Partial, Pending, Overdue), track receipts, and view institutional revenue breakdown.
              </p>
            </div>

            {/* Academic Records */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-4">
                <FileBadge className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Transcripts & GPA Records</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Term-wise GPA calculation, class rankings, student promotion status, and downloadable transcript summaries.
              </p>
            </div>

            {/* Role-based Security */}
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4">
                <Lock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Role-Based Access (RBAC)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Secure JWT cookie authentication, bcrypt hashing, Next.js middleware guards preventing unauthorized cross-portal access.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Summary */}
      <section className="py-12 border-t border-slate-800 bg-slate-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
            Engineered with Modern Production Tech Stack
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-slate-300 text-sm font-semibold">
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              Next.js 14 App Router
            </span>
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              PostgreSQL & Prisma ORM
            </span>
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              TypeScript (Strict)
            </span>
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              Tailwind CSS & Recharts
            </span>
            <span className="flex items-center gap-2 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700">
              JWT & RBAC Middleware
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-800 text-center text-xs text-slate-500">
        <p>EduManage • Built for CodSoft Full Stack Web Development Internship (Task 1)</p>
      </footer>
    </div>
  );
}
