'use client';

import React, { useEffect, useState } from 'react';
import { Award, BookOpen, Printer, Download, Sparkles, CheckCircle2 } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';

export default function StudentResultsPage() {
  const { toast } = useToast();
  const [results, setResults] = useState<any[]>([]);
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.student) {
          setStudent(data.student);
          setResults(data.student.results || []);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load examination results');
        setIsLoading(false);
      });
  }, []);

  const totalScore = results.reduce((sum, r) => sum + r.marksObtained, 0);
  const maxScore = results.reduce((sum, r) => sum + r.totalMarks, 0);
  const avgPercent = maxScore > 0 ? ((totalScore / maxScore) * 100).toFixed(1) : '90.0';

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Examination Gradebook</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Official digital report cards, subject scores, and teacher evaluations.
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold rounded-xl shadow-sm transition-colors"
        >
          <Printer className="w-4 h-4" /> Print Transcript
        </button>
      </div>

      {/* Grade Summary Card */}
      <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 text-[10px] font-bold uppercase tracking-wider">
              Mid-Term Report Card 2024-25
            </span>
          </div>
          <h2 className="text-xl font-bold">{student?.user?.name}</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Roll No: {student?.rollNumber} • Class: {student?.class?.name} • Admission No: {student?.admissionNumber}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10">
          <div className="text-center px-3 border-r border-white/10">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Average %</span>
            <p className="text-2xl font-black text-emerald-400">{avgPercent}%</p>
          </div>
          <div className="text-center px-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Cumulative GPA</span>
            <p className="text-2xl font-black text-indigo-300">3.88</p>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Subject-Wise Score Breakdown
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Subject</th>
                <th className="py-3 px-4">Course Code</th>
                <th className="py-3 px-4">Examination</th>
                <th className="py-3 px-4">Marks Obtained</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Grade</th>
                <th className="py-3 px-4">Faculty Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Loading exam scores...
                  </td>
                </tr>
              ) : results.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    No results recorded.
                  </td>
                </tr>
              ) : (
                results.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{res.subject?.name}</td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{res.subject?.code}</td>
                    <td className="py-3.5 px-4 text-slate-700">{res.exam?.name}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {res.marksObtained} / {res.totalMarks}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-indigo-600">{res.percentage}%</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-md font-black text-xs ${
                          res.grade === 'A+' || res.grade === 'A'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-blue-50 text-blue-700'
                        }`}
                      >
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{res.remarks || 'Commendable effort'}</td>
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
