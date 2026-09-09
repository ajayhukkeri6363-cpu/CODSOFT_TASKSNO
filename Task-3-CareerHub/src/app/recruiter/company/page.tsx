'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import { Select } from '@/ui/Select';
import { useToast } from '@/context/ToastContext';
import { Building2, Globe, MapPin, Save, ShieldCheck } from 'lucide-react';

export default function RecruiterCompanyPage() {
  const { success, error } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [logo, setLogo] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');
  const [industry, setIndustry] = useState('');
  const [location, setLocation] = useState('');
  const [companySize, setCompanySize] = useState('50-200');
  const [foundedYear, setFoundedYear] = useState('2020');

  useEffect(() => {
    const fetchCompany = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/recruiter/company');
        if (res.ok) {
          const data = await res.json();
          const c = data.company;
          if (c) {
            setName(c.name || '');
            setLogo(c.logo || '');
            setWebsite(c.website || '');
            setDescription(c.description || '');
            setIndustry(c.industry || 'Technology & Cloud');
            setLocation(c.location || 'San Francisco, CA');
            setCompanySize(c.companySize || '50-200');
            setFoundedYear(c.foundedYear?.toString() || '2020');
          }
        }
      } catch {
        // Handle
      } finally {
        setLoading(false);
      }
    };
    fetchCompany();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/recruiter/company', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          logo,
          website,
          description,
          industry,
          location,
          companySize,
          foundedYear: parseInt(foundedYear) || undefined,
        }),
      });

      if (res.ok) {
        success('Company profile updated successfully!');
      } else {
        error('Failed to update company');
      }
    } catch {
      error('Network error saving company');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="h-96 rounded-3xl bg-white border border-slate-200 animate-pulse" />;
  }

  return (
    <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-8">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Company Branding & Profile</h1>
        <p className="text-xs text-slate-500 mt-1">
          Customise your company brand showcase seen by job seekers across the marketplace.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="space-y-4">
          <Input
            label="Company Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<Building2 className="w-4 h-4" />}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Logo Image URL"
              placeholder="https://images.unsplash.com/photo-..."
              value={logo}
              onChange={(e) => setLogo(e.target.value)}
            />
            <Input
              label="Website URL"
              placeholder="https://yourcompany.com"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Industry / Domain"
              placeholder="e.g. Enterprise Cloud Software"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
            />
            <Input
              label="Headquarters Location"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            <Select
              label="Company Size (Employees)"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              options={[
                { value: '1-10', label: '1 - 10 employees' },
                { value: '11-50', label: '11 - 50 employees' },
                { value: '50-200', label: '50 - 200 employees' },
                { value: '200-500', label: '200 - 500 employees' },
                { value: '500+', label: '500+ employees' },
              ]}
            />
          </div>

          <Input
            label="Founded Year"
            type="number"
            value={foundedYear}
            onChange={(e) => setFoundedYear(e.target.value)}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-slate-800">
              Company Bio & Mission
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share your company vision, product domain, and workplace culture..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button type="submit" size="lg" isLoading={saving} leftIcon={<Save className="w-4 h-4" />}>
            Save Company Details
          </Button>
        </div>
      </form>
    </div>
  );
}
