'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Briefcase, Lock, Mail, Sparkles, UserCheck, Shield, Users } from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect');
  const { login } = useAuth();
  const { success, error } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success && res.user) {
        success(`Welcome back, ${res.user.name}!`);

        if (redirectUrl) {
          router.push(redirectUrl);
        } else if (res.user.role === 'ADMIN') {
          router.push('/admin/dashboard');
        } else if (res.user.role === 'RECRUITER') {
          router.push('/recruiter/dashboard');
        } else {
          router.push('/candidate/dashboard');
        }
      } else {
        error(res.error || 'Invalid credentials');
      }
    } catch (err: any) {
      error(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Sign in to Career<span className="text-indigo-600">Hub</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Access your candidate applications, recruiter ATS, or admin panel.
          </p>
        </div>

        {/* Demo Fast-Login Pills */}
        <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-indigo-900">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>1-Click Demo Accounts (CodSoft Evaluation):</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickFill('alex.morgan@example.com', 'candidate123')}
              className="px-2 py-1.5 rounded-xl bg-white border border-indigo-200 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center space-x-1 shadow-xs"
            >
              <UserCheck className="w-3 h-3" />
              <span>Candidate</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('sarah.connor@techcorp.com', 'recruiter123')}
              className="px-2 py-1.5 rounded-xl bg-white border border-indigo-200 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center space-x-1 shadow-xs"
            >
              <Users className="w-3 h-3" />
              <span>Recruiter</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin@careerhub.com', 'admin123')}
              className="px-2 py-1.5 rounded-xl bg-white border border-indigo-200 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-600 hover:text-white transition-colors flex items-center justify-center space-x-1 shadow-xs"
            >
              <Shield className="w-3 h-3" />
              <span>Admin</span>
            </button>
          </div>
        </div>

        {/* Login Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              placeholder="you@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Password"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading}>
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account yet?{' '}
              <Link href="/register" className="font-bold text-indigo-600 hover:text-indigo-700">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /></div>}>
      <LoginForm />
    </Suspense>
  );
}
