'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { JobCard } from '@/components/JobCard';
import { JobWithDetails } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import {
  Search,
  MapPin,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Layers,
} from 'lucide-react';

function JobsListContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [jobs, setJobs] = useState<JobWithDetails[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filter States
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'ALL');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'ALL');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || 'ALL');
  const [remoteStatus, setRemoteStatus] = useState(searchParams.get('remoteStatus') || 'ALL');
  const [minSalary, setMinSalary] = useState(searchParams.get('minSalary') || '0');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page') || '1'));

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (location.trim()) params.set('location', location.trim());
      if (category !== 'ALL') params.set('category', category);
      if (jobType !== 'ALL') params.set('jobType', jobType);
      if (experienceLevel !== 'ALL') params.set('experienceLevel', experienceLevel);
      if (remoteStatus !== 'ALL') params.set('remoteStatus', remoteStatus);
      if (parseInt(minSalary) > 0) params.set('minSalary', minSalary);
      params.set('sort', sort);
      params.set('page', page.toString());
      params.set('limit', '9');

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setJobs(data.jobs || []);
        setTotalCount(data.pagination?.total || 0);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [search, location, category, jobType, experienceLevel, remoteStatus, minSalary, sort, page]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleResetFilters = () => {
    setSearch('');
    setLocation('');
    setCategory('ALL');
    setJobType('ALL');
    setExperienceLevel('ALL');
    setRemoteStatus('ALL');
    setMinSalary('0');
    setSort('newest');
    setPage(1);
    router.push('/jobs');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Top Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Explore Open Tech Positions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Discover verified jobs across engineering, design, AI/ML, DevOps, and product.
          </p>
        </div>

        {/* Global Search Bar Card */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-8 space-y-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              fetchJobs();
            }}
            className="grid grid-cols-1 md:grid-cols-12 gap-3"
          >
            <div className="md:col-span-5 relative flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Job title, keywords, or company..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200"
              />
            </div>

            <div className="md:col-span-4 relative flex items-center">
              <MapPin className="w-5 h-5 text-slate-400 absolute left-3.5" />
              <input
                type="text"
                placeholder="Location (e.g. San Francisco, Remote)..."
                value={location}
                onChange={(e) => {
                  setLocation(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-11 pr-4 py-2.5 text-sm rounded-xl focus:outline-none focus:bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200"
              />
            </div>

            <div className="md:col-span-3 flex items-center space-x-2">
              <Button
                type="submit"
                variant="secondary"
                className="w-full"
              >
                Search
              </Button>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                className="lg:hidden p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50"
              >
                <SlidersHorizontal className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Quick Popular Keyword Chips */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs text-slate-500">
            <span className="font-semibold text-slate-400 mr-1">Popular:</span>
            {['Engineering', 'Full Stack', 'Frontend', 'React', 'Python', 'DevOps', 'Design', 'Remote'].map((keyword) => (
              <button
                key={keyword}
                type="button"
                onClick={() => {
                  setSearch(keyword);
                  setPage(1);
                }}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 text-slate-600 transition-colors font-medium text-xs"
              >
                {keyword}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <aside className={`lg:block ${mobileFilterOpen ? 'block' : 'hidden'} lg:col-span-1 space-y-6`}>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2 font-bold text-slate-900 text-sm">
                  <Filter className="w-4 h-4 text-indigo-600" />
                  <span>Filters</span>
                </div>
                <button
                  onClick={handleResetFilters}
                  className="text-xs text-indigo-600 hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset</span>
                </button>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Category
                </label>
                <Select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Categories' },
                    { value: 'Engineering', label: 'Engineering' },
                    { value: 'Data Science', label: 'Data Science & AI' },
                    { value: 'DevOps', label: 'DevOps & Cloud' },
                    { value: 'Design', label: 'Design & UI/UX' },
                    { value: 'Product', label: 'Product Management' },
                    { value: 'Marketing', label: 'Marketing' },
                  ]}
                />
              </div>

              {/* Job Type */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Employment Type
                </label>
                <Select
                  value={jobType}
                  onChange={(e) => {
                    setJobType(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Types' },
                    { value: 'FULL_TIME', label: 'Full-time' },
                    { value: 'PART_TIME', label: 'Part-time' },
                    { value: 'CONTRACT', label: 'Contract' },
                    { value: 'INTERNSHIP', label: 'Internship' },
                    { value: 'FREELANCE', label: 'Freelance' },
                  ]}
                />
              </div>

              {/* Remote Status */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Workplace
                </label>
                <Select
                  value={remoteStatus}
                  onChange={(e) => {
                    setRemoteStatus(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Workplaces' },
                    { value: 'REMOTE', label: 'Remote Only' },
                    { value: 'HYBRID', label: 'Hybrid' },
                    { value: 'ON_SITE', label: 'On-site' },
                  ]}
                />
              </div>

              {/* Experience Level */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Experience Level
                </label>
                <Select
                  value={experienceLevel}
                  onChange={(e) => {
                    setExperienceLevel(e.target.value);
                    setPage(1);
                  }}
                  options={[
                    { value: 'ALL', label: 'All Experience Levels' },
                    { value: 'ENTRY', label: 'Entry Level (0-2 yrs)' },
                    { value: 'MID', label: 'Mid Level (2-4 yrs)' },
                    { value: 'SENIOR', label: 'Senior (5+ yrs)' },
                    { value: 'LEAD', label: 'Lead / Principal' },
                    { value: 'EXECUTIVE', label: 'Executive' },
                  ]}
                />
              </div>

              {/* Min Salary */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-slate-700 uppercase tracking-wider">
                  <span>Min Salary</span>
                  <span className="text-indigo-600 font-bold">${parseInt(minSalary).toLocaleString()}/yr</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="200000"
                  step="10000"
                  value={minSalary}
                  onChange={(e) => {
                    setMinSalary(e.target.value);
                    setPage(1);
                  }}
                  className="w-full accent-indigo-600"
                />
              </div>
            </div>
          </aside>

          {/* Main Job Results Feed */}
          <main className="lg:col-span-3 space-y-6">
            {/* Results bar & Sorting */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-slate-900">
                  {totalCount} {totalCount === 1 ? 'Job Opening' : 'Job Openings'} Found
                </span>
                {(category !== 'ALL' || jobType !== 'ALL' || remoteStatus !== 'ALL') && (
                  <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-md">
                    Filters Active
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-2 text-xs">
                <span className="text-slate-500 font-medium">Sort by:</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none"
                >
                  <option value="newest">Newest First</option>
                  <option value="salary">Highest Salary</option>
                  <option value="popular">Most Popular</option>
                </select>
              </div>
            </div>

            {/* Jobs List / Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="h-60 rounded-2xl bg-white border border-slate-200 animate-pulse p-6" />
                ))}
              </div>
            ) : jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-5">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <Briefcase className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">No matching jobs found</h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                    Try checking your spelling, relaxing search filters, or exploring popular tech roles below.
                  </p>
                </div>

                <div className="flex flex-wrap justify-center items-center gap-2 pt-1">
                  <span className="text-xs font-bold text-slate-400">Try searching:</span>
                  {['Engineering', 'Developer', 'Full Stack', 'Remote'].map((sug) => (
                    <button
                      key={sug}
                      type="button"
                      onClick={() => {
                        setSearch(sug);
                        setCategory('ALL');
                        setJobType('ALL');
                        setRemoteStatus('ALL');
                        setExperienceLevel('ALL');
                        setMinSalary('0');
                        setPage(1);
                      }}
                      className="px-3 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-semibold transition-colors"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                <div className="pt-2">
                  <Button variant="outline" onClick={handleResetFilters}>
                    Clear All Filters & Show All Jobs
                  </Button>
                </div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center space-x-2 pt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                >
                  Previous
                </Button>

                <span className="text-xs font-semibold text-slate-600 px-3">
                  Page {page} of {totalPages}
                </span>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  rightIcon={<ChevronRight className="w-4 h-4" />}
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

export default function JobsPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-16"><div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" /></div>}>
      <JobsListContent />
    </Suspense>
  );
}
