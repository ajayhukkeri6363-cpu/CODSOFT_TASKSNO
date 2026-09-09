'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { useToast } from '@/context/ToastContext';
import { Briefcase, ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';

export default function NewJobPage() {
  const router = useRouter();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [remoteStatus, setRemoteStatus] = useState('HYBRID');
  const [location, setLocation] = useState('San Francisco, CA');
  const [salaryMin, setSalaryMin] = useState('100000');
  const [salaryMax, setSalaryMax] = useState('140000');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [status, setStatus] = useState('PUBLISHED');

  // Skills
  const [skills, setSkills] = useState<string[]>(['TypeScript', 'React', 'Node.js']);
  const [newSkill, setNewSkill] = useState('');

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      error('Job title and description are required');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          category,
          jobType,
          experienceLevel,
          remoteStatus,
          location,
          salaryMin: parseFloat(salaryMin) || 0,
          salaryMax: parseFloat(salaryMax) || 0,
          deadline: deadline || undefined,
          description,
          responsibilities,
          requirements,
          benefits,
          status,
          skills,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success('Job published successfully!');
        router.push('/recruiter/jobs');
      } else {
        error(data.error || 'Failed to create job');
      }
    } catch {
      error('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div>
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center text-xs font-bold text-slate-400 hover:text-indigo-600 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" />
            <span>Back to Job Listings</span>
          </Link>
          <h1 className="text-xl font-bold text-slate-900">Post a New Job Opportunity</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Job Details */}
        <div className="space-y-4">
          <Input
            label="Job Title"
            required
            placeholder="e.g. Senior Distributed Systems Engineer (Go / Rust)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Department / Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Engineering', label: 'Engineering' },
                { value: 'Data Science', label: 'Data Science & AI' },
                { value: 'DevOps', label: 'DevOps & SRE' },
                { value: 'Design', label: 'Design & UI/UX' },
                { value: 'Product', label: 'Product Management' },
                { value: 'Marketing', label: 'Marketing' },
              ]}
            />

            <Select
              label="Employment Type"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
              options={[
                { value: 'FULL_TIME', label: 'Full-time' },
                { value: 'PART_TIME', label: 'Part-time' },
                { value: 'CONTRACT', label: 'Contract' },
                { value: 'INTERNSHIP', label: 'Internship' },
                { value: 'FREELANCE', label: 'Freelance' },
              ]}
            />

            <Select
              label="Experience Level"
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value)}
              options={[
                { value: 'ENTRY', label: 'Entry Level (0-2 yrs)' },
                { value: 'MID', label: 'Mid Level (2-4 yrs)' },
                { value: 'SENIOR', label: 'Senior (5+ yrs)' },
                { value: 'LEAD', label: 'Lead / Principal' },
                { value: 'EXECUTIVE', label: 'Executive / Director' },
              ]}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Workplace Setting"
              value={remoteStatus}
              onChange={(e) => setRemoteStatus(e.target.value)}
              options={[
                { value: 'REMOTE', label: 'Remote Only' },
                { value: 'HYBRID', label: 'Hybrid' },
                { value: 'ON_SITE', label: 'On-site' },
              ]}
            />

            <Input
              label="Location"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Input
              label="Application Deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Minimum Salary (USD/yr)"
              type="number"
              placeholder="100000"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <Input
              label="Maximum Salary (USD/yr)"
              type="number"
              placeholder="150000"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>
        </div>

        {/* Required Skills Tags */}
        <div className="space-y-2 pt-6 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Skills & Technologies
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Type a skill and press Enter (e.g. Next.js, Kubernetes, AWS)..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleAddSkill}
            />
            <Button type="button" variant="secondary" onClick={handleAddSkill}>
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {skills.map((s) => (
              <span
                key={s}
                className="inline-flex items-center px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => setSkills(skills.filter((sk) => sk !== s))}
                  className="ml-1.5 font-bold hover:text-rose-600"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Job Content Areas */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Role Overview & Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={4}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="High-level description of what your team is building and the impact of this role..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Core Responsibilities
            </label>
            <textarea
              rows={4}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="• Architect scalable microservices&#10;• Optimize database query performance&#10;• Lead sprint design reviews..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Requirements & Qualifications
            </label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="• 4+ years in TypeScript, React, and Node.js&#10;• Strong foundation in relational database modeling&#10;• Experience with Docker and CI/CD pipelines..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Benefits & Perks
            </label>
            <textarea
              rows={3}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              placeholder="• Health, dental & vision insurance&#10;• 401(k) matching up to 5%&#10;• Unlimited PTO & flexible work schedule..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Status Selection & Submit */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-700">Listing Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="PUBLISHED">Published (Visible on Marketplace)</option>
              <option value="DRAFT">Save as Draft (Private)</option>
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/recruiter/jobs')}
            >
              Cancel
            </Button>
            <Button type="submit" size="lg" isLoading={loading} leftIcon={<Save className="w-4 h-4" />}>
              Publish Job Listing
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
