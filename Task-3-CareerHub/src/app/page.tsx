'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { JobCard } from '@/components/JobCard';
import { JobWithDetails } from '@/lib/types';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import {
  Search,
  MapPin,
  Sparkles,
  TrendingUp,
  Briefcase,
  Code2,
  Cpu,
  Palette,
  Cloud,
  Layers,
  LineChart,
  ShieldCheck,
  Building2,
  Users,
  CheckCircle,
  ArrowRight,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'Engineering', count: '10+ Jobs', icon: Code2, color: 'bg-blue-500/10 text-blue-600' },
  { name: 'Data Science & AI', count: '4+ Jobs', icon: Cpu, color: 'bg-purple-500/10 text-purple-600' },
  { name: 'DevOps & SRE', count: '3+ Jobs', icon: Cloud, color: 'bg-indigo-500/10 text-indigo-600' },
  { name: 'Design & UI/UX', count: '3+ Jobs', icon: Palette, color: 'bg-pink-500/10 text-pink-600' },
  { name: 'Product Management', count: '2+ Jobs', icon: Layers, color: 'bg-amber-500/10 text-amber-600' },
  { name: 'Marketing & DevRel', count: '2+ Jobs', icon: LineChart, color: 'bg-emerald-500/10 text-emerald-600' },
];

export default function HomePage() {
  const router = useRouter();
  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [featuredJobs, setFeaturedJobs] = useState<JobWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await fetch('/api/jobs?limit=6');
        if (res.ok) {
          const data = await res.json();
          setFeaturedJobs(data.jobs || []);
        }
      } catch {
        // Handle gracefully
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (keyword.trim()) params.set('search', keyword.trim());
    if (location.trim()) params.set('location', location.trim());
    router.push(`/jobs?${params.toString()}`);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 bg-gradient-to-b from-indigo-50/70 via-white to-slate-50">
        <div className="absolute inset-0 bg-[radial-gradient(#e0e7ff_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Internship Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-8 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>CodSoft Full Stack Web Development Internship — Task 3</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
            Find Your Next Breakthrough <span className="text-indigo-600">Tech Career</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            CareerHub connects top-tier software engineers, architects, and designers with innovative technology companies through transparent recruitment pipelines.
          </p>

          {/* Interactive Search Bar Box */}
          <div className="mt-10 max-w-3xl mx-auto">
            <form
              onSubmit={handleSearchSubmit}
              className="p-2 sm:p-3 bg-white rounded-2xl shadow-xl border border-slate-200/80 flex flex-col sm:flex-row gap-2"
            >
              <div className="flex-1 relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Job title, keywords, or company..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none focus:bg-slate-50/50 text-slate-900 placeholder-slate-400"
                />
              </div>

              <div className="hidden sm:block w-px bg-slate-200 my-2" />

              <div className="flex-1 relative flex items-center">
                <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
                <input
                  type="text"
                  placeholder="Location or 'Remote'..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 text-sm rounded-xl focus:outline-none focus:bg-slate-50/50 text-slate-900 placeholder-slate-400"
                />
              </div>

              <Button type="submit" size="lg" className="shrink-0 shadow-md">
                Search Jobs
              </Button>
            </form>

            {/* Quick Keyword Pills */}
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Popular:</span>
              {['Next.js', 'React', 'AI / ML', 'Kubernetes', 'Remote', 'Full Stack', 'Design Systems'].map(
                (term) => (
                  <button
                    key={term}
                    type="button"
                    onClick={() => {
                      setKeyword(term);
                      router.push(`/jobs?search=${encodeURIComponent(term)}`);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-indigo-400 hover:text-indigo-600 transition-colors shadow-xs"
                  >
                    {term}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-4xl mx-auto pt-8 border-t border-slate-200/60 text-center">
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">15+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Active Tech Jobs</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">5+</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Verified Companies</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">6 Stages</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Kanban ATS Pipeline</p>
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-indigo-600">100%</p>
              <p className="text-xs font-semibold text-slate-500 mt-1 uppercase tracking-wider">Cloud Resume Storage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories */}
      <section className="py-16 bg-white border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                Explore by Role & Specialty
              </h2>
              <p className="text-sm text-slate-500 mt-1">
                Browse positions curated across engineering disciplines and product functions.
              </p>
            </div>
            <Link
              href="/jobs"
              className="mt-4 sm:mt-0 text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <span>View All Categories</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/jobs?category=${encodeURIComponent(cat.name.split(' ')[0])}`}
                  className="group p-5 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:border-indigo-300 hover:shadow-lg transition-all text-center flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform ${cat.color}`}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-1 font-medium">{cat.count}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="py-16 lg:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10">
            <div>
              <div className="flex items-center space-x-2 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Featured Positions</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                High-Impact Roles at Top Companies
              </h2>
            </div>
            <Link
              href="/jobs"
              className="mt-4 sm:mt-0 text-sm font-bold text-indigo-600 hover:text-indigo-700 flex items-center"
            >
              <span>Explore 15+ Open Positions</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 rounded-2xl bg-white border border-slate-200 animate-pulse p-6" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredJobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Why CareerHub / Features Grid */}
      <section className="py-16 lg:py-24 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for High-Velocity Modern Hiring
            </h2>
            <p className="mt-3 text-base text-slate-600">
              Everything candidates and recruiting teams need to match skills, evaluate portfolios, and schedule interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-100">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Kanban ATS Recruitment Pipeline</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recruiters can effortlessly advance applicants through 6 stages: Applied, Under Review, Shortlisted, Interview, Selected, or Rejected.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md shadow-purple-100">
                <Cloud className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Cloud Resume Storage Abstraction</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Clean separation of binary file storage from PostgreSQL. Fast resume uploads with instant recruiter PDF review and preview.
              </p>
            </div>

            <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-100">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Direct Interview Scheduling</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Recruiters schedule interview rounds with customized meeting links (Google Meet / Zoom). Candidates track status live on their portal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Dual CTA Section */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Candidate CTA */}
            <div className="p-8 sm:p-10 rounded-3xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold uppercase tracking-wider">
                  For Job Seekers
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Ready to accelerate your career?
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Create your profile, upload your resume, and apply to top engineering and design opportunities in seconds.
                </p>
              </div>
              <div className="pt-8">
                <Link href="/register?role=CANDIDATE">
                  <Button size="lg" className="w-full sm:w-auto">
                    Create Candidate Profile
                  </Button>
                </Link>
              </div>
            </div>

            {/* Recruiter CTA */}
            <div className="p-8 sm:p-10 rounded-3xl bg-indigo-950/60 border border-indigo-800/60 flex flex-col justify-between">
              <div className="space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-400/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  For Employers & Recruiters
                </span>
                <h3 className="text-2xl font-bold tracking-tight text-white">
                  Looking to hire top technical talent?
                </h3>
                <p className="text-sm text-indigo-200/80 leading-relaxed">
                  Publish openings, organize candidate pipelines with our ATS Kanban board, and schedule interviews effortlessly.
                </p>
              </div>
              <div className="pt-8">
                <Link href="/register?role=RECRUITER">
                  <Button size="lg" variant="secondary" className="w-full sm:w-auto bg-white text-slate-900 hover:bg-slate-100">
                    Post a Job Opening
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
