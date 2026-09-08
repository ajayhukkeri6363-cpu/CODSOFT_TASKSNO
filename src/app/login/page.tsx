'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  GraduationCap,
  ShieldCheck,
  BookOpen,
  User,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('admin@edumanage.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || 'Authentication failed');
        toast.error(data.error || 'Invalid credentials');
        setIsLoading(false);
        return;
      }

      toast.success(`Welcome back, ${data.user.name}!`);

      if (data.user.role === 'ADMIN') {
        router.push('/admin');
      } else if (data.user.role === 'TEACHER') {
        router.push('/teacher');
      } else {
        router.push('/student');
      }
      router.refresh();
    } catch (err: any) {
      setErrorMessage('Network error occurred. Please try again.');
      toast.error('Network connection error');
      setIsLoading(false);
    }
  };

  const autofill = (role: 'ADMIN' | 'TEACHER' | 'STUDENT') => {
    if (role === 'ADMIN') {
      setEmail('admin@edumanage.com');
      setPassword('admin123');
    } else if (role === 'TEACHER') {
      setEmail('sarah.jenkins@edumanage.com');
      setPassword('teacher123');
    } else {
      setEmail('alex.morgan@edumanage.com');
      setPassword('student123');
    }
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/20 blur-[120px] pointer-events-none rounded-full" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center relative z-10">
        <Link href="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/30">
            <GraduationCap className="h-7 w-7" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white">EduManage</span>
        </Link>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
          Sign in to your Academic Portal
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter credentials or choose a quick demo account below
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4 sm:px-0">
        <div className="bg-slate-900/90 border border-slate-800 backdrop-blur-xl py-8 px-6 shadow-2xl rounded-2xl sm:px-10">
          {/* Quick autofill pills */}
          <div className="mb-6">
            <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Quick Demo Accounts
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => autofill('ADMIN')}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-rose-950/40 border border-rose-800/40 text-rose-300 hover:bg-rose-900/40 text-xs font-semibold transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin
              </button>
              <button
                type="button"
                onClick={() => autofill('TEACHER')}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-emerald-300 hover:bg-emerald-900/40 text-xs font-semibold transition-colors"
              >
                <BookOpen className="w-3.5 h-3.5" />
                Teacher
              </button>
              <button
                type="button"
                onClick={() => autofill('STUDENT')}
                className="flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl bg-blue-950/40 border border-blue-800/40 text-blue-300 hover:bg-blue-900/40 text-xs font-semibold transition-colors"
              >
                <User className="w-3.5 h-3.5" />
                Student
              </button>
            </div>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@edumanage.com"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-800/80 border border-slate-700 text-white rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50 mt-2"
            >
              {isLoading ? (
                <span>Verifying credentials...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-slate-800 text-center">
            <Link
              href="/"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              ← Return to EduManage Overview
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
