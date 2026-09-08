'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Award, School, UserCheck, CheckCircle2, Sparkles } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function StudentAcademicsPage() {
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
        toast.error('Failed to load academic records');
        setIsLoading(false);
      });
  }, []);

  const subjects = student?.class?.subjects || [];
  const academicRecords = student?.academicRecords || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Academics & Enrolled Courses</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Curriculum course list, instructors, syllabus credits, and cumulative transcripts.
        </p>
      </div>

      {/* Enrolled Courses Grid */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" /> Active Enrolled Subjects ({subjects.length})
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {isLoading ? (
            [1, 2, 3].map((i) => <div key={i} className="h-40 bg-slate-200 rounded-2xl animate-pulse" />)
          ) : subjects.length === 0 ? (
            <div className="col-span-full py-12 text-center text-slate-400">
              No subjects registered.
            </div>
          ) : (
            subjects.map((sub: any) => (
              <div
                key={sub.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded font-mono font-bold bg-indigo-50 text-indigo-700 text-xs">
                    {sub.code}
                  </span>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    Core Subject
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{sub.name}</h3>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5 text-slate-500">
                    <UserCheck className="w-3.5 h-3.5" /> Instructor
                  </span>
                  <span className="font-semibold text-slate-800">
                    {sub.teacher?.user?.name || 'Faculty Member'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Academic Term Transcripts */}
      <div className="space-y-4 pt-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Award className="w-4 h-4 text-indigo-600" /> Term Performance History
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {academicRecords.map((rec: any) => (
            <div
              key={rec.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{rec.term}</h3>
                    <p className="text-[10px] text-slate-400">Academic Year {rec.academicYear}</p>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                    {rec.status}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-xl text-center mb-3">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Term GPA</span>
                    <p className="text-xl font-black text-indigo-600 mt-0.5">{rec.gpa?.toFixed(2)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Class Rank</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">#{rec.rank || 1}</p>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Credits</span>
                    <p className="text-xl font-black text-slate-900 mt-0.5">{rec.totalCredits || 22}</p>
                  </div>
                </div>

                {rec.remarks && <p className="text-xs text-slate-500 italic">"{rec.remarks}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
