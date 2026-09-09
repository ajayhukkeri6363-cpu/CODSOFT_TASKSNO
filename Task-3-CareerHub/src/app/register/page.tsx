'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Role } from '@/lib/types';
import { Briefcase, Lock, Mail, User, Phone, Building2, UserCheck, Shield } from 'lucide-react';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialRole = (searchParams.get('role') as Role) || 'CANDIDATE';

  const { register } = useAuth();
  const { success, error } = useToast();

  const [role, setRole] = useState<Role>(initialRole);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [position, setPosition] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get('role');
    if (roleParam === 'RECRUITER' || roleParam === 'CANDIDATE') {
      setRole(roleParam);
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await register({
        name,
        email,
        phone: phone || undefined,
        password,
        role,
        companyName: role === 'RECRUITER' ? companyName : undefined,
        position: role === 'RECRUITER' ? position : undefined,
      });

      if (res.success) {
        success('Account created successfully! Welcome to CareerHub.');
        if (role === 'RECRUITER') {
          router.push('/recruiter/dashboard');
        } else {
          router.push('/candidate/dashboard');
        }
      } else {
        error(res.error || 'Registration failed');
      }
    } catch (err: any) {
      error(err.message || 'Error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-md w-full space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <Link href="/" className="inline-flex items-center space-x-2.5 mb-4 group">
            <div className="w-11 h-11 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100 group-hover:scale-105 transition-transform">
              <Briefcase className="w-6 h-6" />
            </div>
          </Link>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Create your Career<span className="text-indigo-600">Hub</span> Account
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            Join thousands of talent & companies shaping the future of tech.
          </p>
        </div>

        {/* Role Toggle Tabs */}
        <div className="p-1 bg-slate-200/80 rounded-2xl flex">
          <button
            type="button"
            onClick={() => setRole('CANDIDATE')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              role === 'CANDIDATE'
                ? 'bg-white text-indigo-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            <span>Job Seeker</span>
          </button>
          <button
            type="button"
            onClick={() => setRole('RECRUITER')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
              role === 'RECRUITER'
                ? 'bg-white text-indigo-700 shadow-md'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Employer / Recruiter</span>
          </button>
        </div>

        {/* Form Card */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Full Name"
              type="text"
              required
              placeholder="e.g. Jane Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Email Address"
              type="email"
              required
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 000-0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />

            {role === 'RECRUITER' && (
              <>
                <Input
                  label="Company / Organization Name"
                  type="text"
                  required
                  placeholder="e.g. Acme Innovations"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  leftIcon={<Building2 className="w-4 h-4" />}
                />

                <Input
                  label="Your Role / Title"
                  type="text"
                  placeholder="e.g. Lead Technical Recruiter"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  leftIcon={<Briefcase className="w-4 h-4" />}
                />
              </>
            )}

            <Input
              label="Password (min. 6 characters)"
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button type="submit" size="lg" className="w-full mt-2" isLoading={loading}>
              Create {role === 'RECRUITER' ? 'Recruiter' : 'Candidate'} Account
            </Button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-bold text-indigo-600 hover:text-indigo-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-[85vh] flex items-center justify-center"><div className="w-8 h-8 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin" /></div>}>
      <RegisterForm />
    </Suspense>
  );
}
