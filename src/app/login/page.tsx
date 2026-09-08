'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  UtensilsCrossed,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Flame,
  User,
  AlertCircle,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

const DEMO_ACCOUNTS = [
  {
    role: 'CUSTOMER',
    name: 'Sophia Miller (Customer)',
    email: 'sophia.miller@example.com',
    password: 'customer123',
    icon: User,
    color: 'bg-amber-100 text-amber-800 border-amber-300',
  },
  {
    role: 'STAFF',
    name: 'Chef Marco (Kitchen Staff)',
    email: 'chef.marco@dinedesk.com',
    password: 'staff123',
    icon: Flame,
    color: 'bg-orange-100 text-orange-800 border-orange-300',
  },
  {
    role: 'ADMIN',
    name: 'Chef Alessandro (Admin/GM)',
    email: 'admin@dinedesk.com',
    password: 'admin123',
    icon: ShieldCheck,
    color: 'bg-slate-900 text-amber-400 border-slate-700',
  },
];

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/';
  const { success, error: toastError } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please enter both email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        success(`Welcome back, ${data.user.name}!`);
        if (callbackUrl && callbackUrl !== '/login') {
          router.push(callbackUrl);
        } else if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else if (data.user.role === 'STAFF') {
          router.push('/staff');
        } else {
          router.push('/menu');
        }
        router.refresh();
      } else {
        setErrorMessage(data.error || 'Invalid credentials.');
        toastError(data.error || 'Login failed.');
      }
    } catch {
      setErrorMessage('Server connection failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofill = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage('');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-slate-100 shadow-xl space-y-8 animate-slide-up">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2.5 group mb-2">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black text-slate-900">
              Dine<span className="text-amber-600">Desk</span>
            </span>
          </Link>
          <h2 className="text-xl font-black text-slate-900">Sign in to your account</h2>
          <p className="text-xs text-slate-400">Access your personalized portal and culinary orders.</p>
        </div>

        {/* Demo Quick Fill Pills */}
        <div className="space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block text-center">
            Click to Autofill Demo Accounts:
          </span>
          <div className="grid grid-cols-3 gap-2">
            {DEMO_ACCOUNTS.map((acc) => {
              const Icon = acc.icon;
              return (
                <button
                  key={acc.role}
                  type="button"
                  onClick={() => handleAutofill(acc)}
                  className={`p-2 rounded-xl text-center border text-[11px] font-bold transition flex flex-col items-center gap-1 ${acc.color}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{acc.role}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                required
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3.5 rounded-2xl text-xs font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-md shadow-amber-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing In...' : 'Sign In to DineDesk'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center pt-2 text-xs text-slate-500">
          Don't have an account yet?{' '}
          <Link href="/register" className="font-bold text-amber-600 hover:text-amber-700 underline">
            Create account
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-slate-400">Loading sign in...</div>}>
      <LoginForm />
    </Suspense>
  );
}
