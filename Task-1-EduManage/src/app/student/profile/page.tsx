'use client';

import React, { useEffect, useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  School,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function StudentProfilePage() {
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.student) setStudent(data.student);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load profile');
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-44 bg-slate-200 rounded-3xl animate-pulse" />
        <div className="h-64 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
        <img
          src={
            student?.user?.avatar ||
            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
              student?.user?.name || 'Student'
            )}`
          }
          alt={student?.user?.name}
          className="w-24 h-24 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
        />
        <div className="flex-1">
          <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-bold border border-emerald-200 mb-1.5">
            Active Student Account
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student?.user?.name}</h1>
          <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span>Roll Number: <strong className="font-mono text-slate-800">{student?.rollNumber}</strong></span>
            <span>•</span>
            <span>Admission No: <strong className="font-mono text-slate-800">{student?.admissionNumber}</strong></span>
            <span>•</span>
            <span>Class: <strong className="text-indigo-600 font-semibold">{student?.class?.name}</strong></span>
          </p>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <User className="w-4 h-4 text-indigo-600" /> Personal Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Email Address</span>
              <span className="font-semibold text-slate-800">{student?.user?.email}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Gender</span>
              <span className="font-semibold text-slate-800 capitalize">{student?.gender?.toLowerCase()}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Date of Birth</span>
              <span className="font-semibold text-slate-800">{formatDate(student?.dateOfBirth)}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Blood Group</span>
              <span className="font-semibold text-slate-800">{student?.bloodGroup || 'O+'}</span>
            </div>
            <div className="col-span-2">
              <span className="text-slate-400 block font-medium">Residential Address</span>
              <span className="font-semibold text-slate-800">
                {student?.address || '742 Evergreen Terrace, Springfield'}
              </span>
            </div>
          </div>
        </div>

        {/* Guardian & School Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 flex items-center gap-2">
            <School className="w-4 h-4 text-emerald-600" /> Parent & Class Information
          </h2>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 block font-medium">Parent / Guardian</span>
              <span className="font-semibold text-slate-800">{student?.parentName || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Guardian Phone</span>
              <span className="font-semibold text-slate-800">{student?.parentPhone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Guardian Email</span>
              <span className="font-semibold text-slate-800">{student?.parentEmail || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Class Cohort</span>
              <span className="font-semibold text-indigo-600">{student?.class?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Room Number</span>
              <span className="font-semibold text-slate-800">{student?.class?.roomNumber || 'Room 101'}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-medium">Enrolled Since</span>
              <span className="font-semibold text-slate-800">{formatDate(student?.admissionDate)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
