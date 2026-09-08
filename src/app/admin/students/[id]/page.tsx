'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  User,
  CalendarCheck,
  Award,
  CreditCard,
  FileBadge,
  Phone,
  Mail,
  MapPin,
  Heart,
  School,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
} from 'lucide-react';
import { formatDate, formatCurrency, getAttendanceColor, getFeeStatusColor } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function StudentDetailsPage() {
  const params = useParams();
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'attendance' | 'results' | 'fees' | 'academics'>('overview');

  useEffect(() => {
    if (params.id) {
      fetch(`/api/students/${params.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.student) setStudent(data.student);
          setIsLoading(false);
        })
        .catch((err) => {
          console.error(err);
          toast.error('Failed to load student details');
          setIsLoading(false);
        });
    }
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-6 bg-slate-200 rounded w-32 animate-pulse" />
        <div className="h-44 bg-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-16">
        <p className="text-sm font-semibold text-slate-500">Student not found</p>
        <Link href="/admin/students" className="mt-3 inline-block text-xs text-indigo-600 font-bold">
          ← Back to Student Directory
        </Link>
      </div>
    );
  }

  // Compute attendance stats
  const totalAtt = student.attendances?.length || 0;
  const presentCount = student.attendances?.filter((a: any) => a.status === 'PRESENT').length || 0;
  const lateCount = student.attendances?.filter((a: any) => a.status === 'LATE').length || 0;
  const absentCount = student.attendances?.filter((a: any) => a.status === 'ABSENT').length || 0;
  const attRate = totalAtt > 0 ? ((presentCount / totalAtt) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/admin/students"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Students
        </Link>
      </div>

      {/* Student Profile Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={
                student.user.avatar ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.user.name)}`
              }
              alt={student.user.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-black text-slate-900 tracking-tight">{student.user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                  Active Enrolled
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-3">
                <span>Roll No: <strong className="font-mono text-slate-800">{student.rollNumber}</strong></span>
                <span>•</span>
                <span>Admission ID: <strong className="font-mono text-slate-800">{student.admissionNumber}</strong></span>
                <span>•</span>
                <span>Class: <strong className="text-indigo-600 font-semibold">{student.class.name}</strong></span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3">
            <div className="text-center px-3 border-r border-slate-200">
              <p className="text-[10px] uppercase font-bold text-slate-400">Attendance</p>
              <p className="text-lg font-black text-emerald-600">{attRate}%</p>
            </div>
            <div className="text-center px-3">
              <p className="text-[10px] uppercase font-bold text-slate-400">Current GPA</p>
              <p className="text-lg font-black text-indigo-600">{student.academicRecords?.[0]?.gpa?.toFixed(2) || '3.85'}</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-t border-slate-100 mt-6 pt-4 overflow-x-auto">
          {[
            { id: 'overview', label: 'Overview & Profile', icon: User },
            { id: 'attendance', label: 'Attendance History', icon: CalendarCheck },
            { id: 'results', label: 'Examination Results', icon: Award },
            { id: 'fees', label: 'Fee Billing & Receipts', icon: CreditCard },
            { id: 'academics', label: 'Academic Transcripts', icon: FileBadge },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Email Address</span>
                <span className="font-semibold text-slate-800">{student.user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Gender</span>
                <span className="font-semibold text-slate-800 capitalize">{student.gender?.toLowerCase()}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Date of Birth</span>
                <span className="font-semibold text-slate-800">{formatDate(student.dateOfBirth)}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Blood Group</span>
                <span className="font-semibold text-slate-800">{student.bloodGroup || 'N/A'}</span>
              </div>
              <div className="col-span-2">
                <span className="text-slate-400 block font-medium">Residential Address</span>
                <span className="font-semibold text-slate-800">{student.address || '742 Evergreen Terrace, Springfield'}</span>
              </div>
            </div>
          </div>

          {/* Guardian & Academic Class */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
              Guardian & Class Information
            </h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block font-medium">Parent / Guardian</span>
                <span className="font-semibold text-slate-800">{student.parentName || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Guardian Phone</span>
                <span className="font-semibold text-slate-800">{student.parentPhone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Guardian Email</span>
                <span className="font-semibold text-slate-800">{student.parentEmail || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Class Teacher</span>
                <span className="font-semibold text-indigo-600">
                  {student.class.classTeacher?.user?.name || 'Assigned Faculty'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Enrolled Section</span>
                <span className="font-semibold text-slate-800">{student.class.name} (Section {student.class.section})</span>
              </div>
              <div>
                <span className="text-slate-400 block font-medium">Classroom</span>
                <span className="font-semibold text-slate-800">{student.class.roomNumber || 'Room 101'}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'attendance' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Attendance Log (Last 30 Sessions)</h3>
              <p className="text-xs text-slate-500">Record of daily presence and leave notes</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="px-2 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-lg">
                Present: {presentCount}
              </span>
              <span className="px-2 py-1 bg-amber-50 text-amber-700 font-bold rounded-lg">
                Late: {lateCount}
              </span>
              <span className="px-2 py-1 bg-rose-50 text-rose-700 font-bold rounded-lg">
                Absent: {absentCount}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Class</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(student.attendances || []).map((att: any) => (
                  <tr key={att.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-medium text-slate-800">{formatDate(att.date)}</td>
                    <td className="py-2.5 px-3 text-slate-600">{student.class.name}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getAttendanceColor(
                          att.status
                        )}`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-500">{att.remarks || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'results' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Official Examination Results</h3>
            <p className="text-xs text-slate-500">Subject-wise marks obtained and letter grades</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Examination</th>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Code</th>
                  <th className="py-2.5 px-3">Marks</th>
                  <th className="py-2.5 px-3">Percentage</th>
                  <th className="py-2.5 px-3">Grade</th>
                  <th className="py-2.5 px-3">Teacher Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(student.results || []).map((res: any) => (
                  <tr key={res.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-semibold text-slate-900">{res.exam.name}</td>
                    <td className="py-3 px-3 font-medium text-slate-800">{res.subject.name}</td>
                    <td className="py-3 px-3 font-mono text-slate-500">{res.subject.code}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">
                      {res.marksObtained} / {res.totalMarks}
                    </td>
                    <td className="py-3 px-3 font-bold text-indigo-600">{res.percentage}%</td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-black">
                        {res.grade}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-500">{res.remarks || 'Good performance'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'fees' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Student Fee Invoices & Payment Vouchers</h3>
            <p className="text-xs text-slate-500">Billing history and settlement statuses</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Amount</th>
                  <th className="py-2.5 px-3">Paid Amount</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(student.fees || []).map((fee: any) => (
                  <tr key={fee.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-slate-700">{fee.invoiceNumber}</td>
                    <td className="py-3 px-3 font-semibold text-slate-900">{fee.title}</td>
                    <td className="py-3 px-3 font-bold text-slate-900">{formatCurrency(fee.amount)}</td>
                    <td className="py-3 px-3 text-emerald-600 font-bold">{formatCurrency(fee.paidAmount)}</td>
                    <td className="py-3 px-3 text-slate-500">{formatDate(fee.dueDate)}</td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getFeeStatusColor(
                          fee.status
                        )}`}
                      >
                        {fee.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'academics' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Academic Records & Transcripts</h3>
            <p className="text-xs text-slate-500">Cumulative GPA and promotion statuses</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(student.academicRecords || []).map((rec: any) => (
              <div key={rec.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-slate-900 text-sm">{rec.term} ({rec.academicYear})</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {rec.status}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs">
                  <div>
                    <p className="text-slate-500">Term GPA</p>
                    <p className="text-lg font-black text-indigo-600">{rec.gpa.toFixed(2)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-500">Class Rank</p>
                    <p className="text-lg font-black text-slate-800">#{rec.rank || 1}</p>
                  </div>
                </div>
                {rec.remarks && <p className="text-[11px] text-slate-500 mt-2 italic">{rec.remarks}</p>}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
