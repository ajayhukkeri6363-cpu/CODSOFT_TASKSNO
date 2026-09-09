'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function EditJobPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { success, error } = useToast();

  const [fetching, setFetching] = useState(true);
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Engineering');
  const [jobType, setJobType] = useState('FULL_TIME');
  const [experienceLevel, setExperienceLevel] = useState('MID');
  const [remoteStatus, setRemoteStatus] = useState('HYBRID');
  const [location, setLocation] = useState('');
  const [salaryMin, setSalaryMin] = useState('0');
  const [salaryMax, setSalaryMax] = useState('0');
  const [deadline, setDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');
  const [benefits, setBenefits] = useState('');
  const [status, setStatus] = useState('PUBLISHED');
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');

  useEffect(() => {
    const fetchJob = async () => {
      setFetching(true);
      try {
        const res = await fetch(`/api/jobs/${id}`);
        if (res.ok) {
          const data = await res.json();
          const j = data.job;
          setTitle(j.title || '');
          setCategory(j.category || 'Engineering');
          setJobType(j.jobType || 'FULL_TIME');
          setExperienceLevel(j.experienceLevel || 'MID');
          setRemoteStatus(j.remoteStatus || 'HYBRID');
          setLocation(j.location || '');
          setSalaryMin(j.salaryMin?.toString() || '0');
          setSalaryMax(j.salaryMax?.toString() || '0');
          setDeadline(j.deadline ? new Date(j.deadline).toISOString().split('T')[0] : '');
          setDescription(j.description || '');
          setResponsibilities(j.responsibilities || '');
          setRequirements(j.requirements || '');
          setBenefits(j.benefits || '');
          setStatus(j.status || 'PUBLISHED');
          setSkills(j.skills ? j.skills.map((s: any) => s.skillName) : []);
        } else {
          error('Failed to load job details');
        }
      } catch {
        error('Network error loading job');
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchJob();
  }, [id]);

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
    setLoading(true);
    try {
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PUT',
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
          deadline: deadline || null,
          description,
          responsibilities,
          requirements,
          benefits,
          status,
          skills,
        }),
      });

      if (res.ok) {
        success('Job listing updated successfully!');
        router.push('/recruiter/jobs');
      } else {
        error('Failed to update job');
      }
    } catch {
      error('Network error updating job');
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />;
  }

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
          <h1 className="text-xl font-bold text-slate-900">Edit Job Listing</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Job Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select
              label="Category"
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
                { value: 'EXECUTIVE', label: 'Executive' },
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
              label="Min Salary (USD/yr)"
              type="number"
              value={salaryMin}
              onChange={(e) => setSalaryMin(e.target.value)}
            />
            <Input
              label="Max Salary (USD/yr)"
              type="number"
              value={salaryMax}
              onChange={(e) => setSalaryMax(e.target.value)}
            />
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2 pt-6 border-t border-slate-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Skills & Technologies
          </label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add skill..."
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

        {/* Descriptions */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Summary</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Responsibilities</label>
            <textarea
              rows={4}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Requirements</label>
            <textarea
              rows={4}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">Benefits</label>
            <textarea
              rows={3}
              value={benefits}
              onChange={(e) => setBenefits(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Status and Action Buttons */}
        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <label className="text-xs font-bold text-slate-700">Listing Status:</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="rounded-xl border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none"
            >
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
              <option value="CLOSED">Closed</option>
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
              Save Changes
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
