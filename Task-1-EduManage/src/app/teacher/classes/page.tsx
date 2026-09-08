'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  School,
  Users,
  CalendarCheck,
  Award,
  BookOpen,
  DoorOpen,
  ArrowRight,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function TeacherClassesPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes) setClasses(data.classes);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load classes');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Assigned Classes</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View your assigned classrooms, student capacities, and curriculum subjects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          [1, 2, 3].map((i) => <div key={i} className="h-56 bg-slate-200 rounded-2xl animate-pulse" />)
        ) : classes.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400">
            No classes assigned.
          </div>
        ) : (
          classes.map((cls) => (
            <div
              key={cls.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {cls.gradeLevel} • Section {cls.section}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">{cls.roomNumber || 'Room 101'}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-lg mb-2">{cls.name}</h3>

                <div className="space-y-2 text-xs text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> Enrolled Students
                    </span>
                    <span className="font-bold text-slate-800">{cls._count?.students || 0} Students</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <BookOpen className="w-3.5 h-3.5" /> Subjects Taught
                    </span>
                    <span className="font-bold text-emerald-600">{cls.subjects?.length || 0} Subjects</span>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-1.5">Class Subjects</p>
                  <div className="flex flex-wrap gap-1.5">
                    {(cls.subjects || []).map((sub: any) => (
                      <span
                        key={sub.id}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-semibold"
                      >
                        {sub.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                <Link
                  href="/teacher/attendance"
                  className="flex-1 text-center py-2 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Take Attendance
                </Link>
                <Link
                  href="/teacher/results"
                  className="flex-1 text-center py-2 px-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors"
                >
                  Enter Marks
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
