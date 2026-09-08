'use client';

import React, { useEffect, useState } from 'react';
import { Users, Search, Filter, Mail, Phone, Eye } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { StudentWithDetails } from '@/lib/types';

export default function TeacherStudentsPage() {
  const { toast } = useToast();
  const [students, setStudents] = useState<StudentWithDetails[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes?.length > 0) {
          setClasses(data.classes);
        }
      });
  }, []);

  useEffect(() => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (selectedClass) params.append('classId', selectedClass);

    fetch(`/api/students?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.students) setStudents(data.students);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load students');
        setIsLoading(false);
      });
  }, [searchTerm, selectedClass]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Roster</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          View enrolled learners in your classes, guardian contacts, and attendance history.
        </p>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student by name, roll number, admission ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2 focus:ring-emerald-500 w-full sm:w-auto font-medium"
        >
          <option value="">All Assigned Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3.5 px-4">Student</th>
                <th className="py-3.5 px-4">Roll No</th>
                <th className="py-3.5 px-4">Class</th>
                <th className="py-3.5 px-4">Parent Guardian</th>
                <th className="py-3.5 px-4">Parent Contact</th>
                <th className="py-3.5 px-4">Current Term GPA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    Loading student roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-slate-400">
                    No students found.
                  </td>
                </tr>
              ) : (
                students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 flex items-center gap-3">
                      <img
                        src={
                          st.user.avatar ||
                          `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(st.user.name)}`
                        }
                        alt={st.user.name}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-slate-900">{st.user.name}</p>
                        <p className="text-[10px] text-slate-400">{st.user.email}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{st.rollNumber}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                        {st.class.name}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800">{st.parentName || 'N/A'}</td>
                    <td className="py-3 px-4 text-slate-500">{st.parentPhone || st.user.phone || 'N/A'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-indigo-50 text-indigo-700 font-black">
                        {st.academicRecords?.[0]?.gpa?.toFixed(2) || '3.80'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
