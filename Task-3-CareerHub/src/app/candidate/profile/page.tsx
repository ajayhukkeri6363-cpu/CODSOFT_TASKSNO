'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { Button } from '@/ui/Button';
import { Input } from '@/ui/Input';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Globe,
  Github,
  Linkedin,
  Briefcase,
  GraduationCap,
  Plus,
  Trash2,
  Save,
} from 'lucide-react';

export default function CandidateProfilePage() {
  const { user, refreshUser } = useAuth();
  const { success, error } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [github, setGithub] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [experienceYears, setExperienceYears] = useState('0');
  const [currentCompany, setCurrentCompany] = useState('');
  const [currentRole, setCurrentRole] = useState('');

  // Skills
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkillInput, setNewSkillInput] = useState('');

  // Experience & Education items
  const [experienceList, setExperienceList] = useState<Array<{ title: string; company: string; years: string }>>([]);
  const [educationList, setEducationList] = useState<Array<{ degree: string; school: string; year: string }>>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/candidate/profile');
        if (res.ok) {
          const data = await res.json();
          const dbUser = data.user;
          const profile = data.profile;

          if (dbUser) {
            setName(dbUser.name || '');
            setPhone(dbUser.phone || '');
          }

          if (profile) {
            setHeadline(profile.headline || '');
            setBio(profile.bio || '');
            setLocation(profile.location || '');
            setWebsite(profile.website || '');
            setGithub(profile.github || '');
            setLinkedin(profile.linkedin || '');
            setExperienceYears(profile.experienceYears?.toString() || '0');
            setCurrentCompany(profile.currentCompany || '');
            setCurrentRole(profile.currentRole || '');

            if (profile.skills) {
              try {
                setSkills(JSON.parse(profile.skills));
              } catch {}
            }

            if (profile.experience) {
              try {
                setExperienceList(JSON.parse(profile.experience));
              } catch {}
            }

            if (profile.education) {
              try {
                setEducationList(JSON.parse(profile.education));
              } catch {}
            }
          }
        }
      } catch {
        // Handle
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleAddSkill = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    if (newSkillInput.trim() && !skills.includes(newSkillInput.trim())) {
      setSkills([...skills, newSkillInput.trim()]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleAddExperience = () => {
    setExperienceList([...experienceList, { title: '', company: '', years: '' }]);
  };

  const handleAddEducation = () => {
    setEducationList([...educationList, { degree: '', school: '', year: '' }]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/candidate/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          phone,
          headline,
          bio,
          location,
          website,
          github,
          linkedin,
          experienceYears: parseInt(experienceYears) || 0,
          currentCompany,
          currentRole,
          skills,
          experience: experienceList.filter((e) => e.title || e.company),
          education: educationList.filter((e) => e.degree || e.school),
        }),
      });

      if (res.ok) {
        success('Candidate profile updated successfully!');
        await refreshUser();
      } else {
        error('Failed to update profile');
      }
    } catch {
      error('Network error saving profile');
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
        <h1 className="text-xl font-bold text-slate-900">Candidate Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-1">
          Keep your professional details up to date to stand out to verified tech recruiters.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Basic Info */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />
            <Input
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
            <Input
              label="Location (City, Country)"
              placeholder="e.g. San Francisco, CA"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              leftIcon={<MapPin className="w-4 h-4" />}
            />
            <Input
              label="Years of Experience"
              type="number"
              value={experienceYears}
              onChange={(e) => setExperienceYears(e.target.value)}
              leftIcon={<Briefcase className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Professional Headline & Bio */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Headline & Professional Bio
          </h3>
          <Input
            label="Professional Headline"
            placeholder="e.g. Senior Full-Stack Engineer | React, Node.js, PostgreSQL & AWS"
            value={headline}
            onChange={(e) => setHeadline(e.target.value)}
          />
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Bio / About Me</label>
            <textarea
              rows={4}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Describe your engineering passions, accomplishments, and tech stack..."
              className="w-full rounded-xl border border-slate-300 p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>

        {/* Skills Tag Input */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Technical Skills & Specialties
          </h3>
          <div className="flex space-x-2">
            <Input
              placeholder="Type skill and press Enter (e.g. TypeScript, Docker, PyTorch)..."
              value={newSkillInput}
              onChange={(e) => setNewSkillInput(e.target.value)}
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
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 text-xs font-semibold border border-indigo-200"
              >
                <span>{s}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(s)}
                  className="hover:text-rose-600 font-bold ml-1"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Social & Portfolio Links */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Online Presence & Links
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="GitHub Profile URL"
              placeholder="https://github.com/username"
              value={github}
              onChange={(e) => setGithub(e.target.value)}
              leftIcon={<Github className="w-4 h-4" />}
            />
            <Input
              label="LinkedIn Profile URL"
              placeholder="https://linkedin.com/in/username"
              value={linkedin}
              onChange={(e) => setLinkedin(e.target.value)}
              leftIcon={<Linkedin className="w-4 h-4" />}
            />
            <Input
              label="Personal Portfolio / Website"
              placeholder="https://yourportfolio.dev"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              leftIcon={<Globe className="w-4 h-4" />}
            />
          </div>
        </div>

        {/* Experience History */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Work Experience
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddExperience}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Experience
            </Button>
          </div>

          <div className="space-y-3">
            {experienceList.map((exp, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setExperienceList(experienceList.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                  <Input
                    label="Job Title / Role"
                    placeholder="e.g. Frontend Engineer"
                    value={exp.title}
                    onChange={(e) => {
                      const updated = [...experienceList];
                      updated[idx].title = e.target.value;
                      setExperienceList(updated);
                    }}
                  />
                  <Input
                    label="Company Name"
                    placeholder="e.g. Acme Labs"
                    value={exp.company}
                    onChange={(e) => {
                      const updated = [...experienceList];
                      updated[idx].company = e.target.value;
                      setExperienceList(updated);
                    }}
                  />
                  <Input
                    label="Years / Duration"
                    placeholder="e.g. 2021 - Present"
                    value={exp.years}
                    onChange={(e) => {
                      const updated = [...experienceList];
                      updated[idx].years = e.target.value;
                      setExperienceList(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Education History */}
        <div className="space-y-4 pt-6 border-t border-slate-100">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Education & Degrees
            </h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddEducation}
              leftIcon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Education
            </Button>
          </div>

          <div className="space-y-3">
            {educationList.map((edu, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 relative">
                <button
                  type="button"
                  onClick={() => setEducationList(educationList.filter((_, i) => i !== idx))}
                  className="absolute top-4 right-4 text-slate-400 hover:text-rose-600"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pr-8">
                  <Input
                    label="Degree / Major"
                    placeholder="e.g. B.S. Computer Science"
                    value={edu.degree}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[idx].degree = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                  <Input
                    label="University / Institution"
                    placeholder="e.g. UC Berkeley"
                    value={edu.school}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[idx].school = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                  <Input
                    label="Graduation Year"
                    placeholder="e.g. 2022"
                    value={edu.year}
                    onChange={(e) => {
                      const updated = [...educationList];
                      updated[idx].year = e.target.value;
                      setEducationList(updated);
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-4 border-t border-slate-100">
          <Button
            type="submit"
            size="lg"
            isLoading={saving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Profile Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
