'use client';

import React, { useEffect, useState } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Save,
  Users,
  Sparkles,
  Search,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ClassWithDetails } from '@/lib/types';
import { formatDate } from '@/lib/utils';

export default function AttendanceManagementPage() {
  const { toast } = useToast();
  const [classes, setClasses] = useState<ClassWithDetails[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [students, setStudents] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<
    Record<string, { status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks: string }>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch classes
  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes?.length > 0) {
          setClasses(data.classes);
          setSelectedClassId(data.classes[0].id);
        }
      })
      .catch(console.error);
  }, []);

  // Fetch class students and existing attendance for date
  useEffect(() => {
    if (!selectedClassId) return;

    setIsLoading(true);

    Promise.all([
      fetch(`/api/classes/${selectedClassId}`).then((r) => r.json()),
      fetch(`/api/attendance?classId=${selectedClassId}&date=${selectedDate}`).then((r) => r.json()),
    ])
      .then(([classData, attData]) => {
        const studentList = classData.class?.students || [];
        setStudents(studentList);

        // Build status map
        const existingAtt = attData.attendances || [];
        const map: Record<string, { status: any; remarks: string }> = {};

        studentList.forEach((st: any) => {
          const match = existingAtt.find((a: any) => a.studentId === st.id);
          map[st.id] = {
            status: match ? match.status : 'PRESENT',
            remarks: match ? match.remarks || '' : '',
          };
        });

        setAttendanceMap(map);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load class attendance');
        setIsLoading(false);
      });
  }, [selectedClassId, selectedDate]);

  const handleStatusChange = (
    studentId: string,
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'
  ) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        status,
      },
    }));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    setAttendanceMap((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        remarks,
      },
    }));
  };

  const markAll = (status: 'PRESENT' | 'ABSENT') => {
    const updated: Record<string, any> = {};
    students.forEach((st) => {
      updated[st.id] = {
        status,
        remarks: attendanceMap[st.id]?.remarks || '',
      };
    });
    setAttendanceMap(updated);
    toast.info(`Marked all students as ${status}`);
  };

  const handleSaveAttendance = async () => {
    if (!selectedClassId || students.length === 0) return;
    setIsSaving(true);

    const records = Object.entries(attendanceMap).map(([studentId, data]) => ({
      studentId,
      status: data.status,
      remarks: data.remarks || null,
    }));

    try {
      const res = await fetch('/api/attendance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classId: selectedClassId,
          date: selectedDate,
          records,
        }),
      });

      if (res.ok) {
        toast.success(`Attendance successfully recorded for ${records.length} students!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save attendance');
      }
    } catch (err) {
      toast.error('Network error saving attendance');
    } finally {
      setIsSaving(false);
    }
  };

  // Stats calculation
  const totalCount = students.length;
  const presentCount = Object.values(attendanceMap).filter((v) => v.status === 'PRESENT').length;
  const absentCount = Object.values(attendanceMap).filter((v) => v.status === 'ABSENT').length;
  const lateCount = Object.values(attendanceMap).filter((v) => v.status === 'LATE').length;
  const excusedCount = Object.values(attendanceMap).filter((v) => v.status === 'EXCUSED').length;
  const attendanceRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 100;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Take and update daily roll call attendance across grade cohorts with instant metrics.
          </p>
        </div>

        <button
          onClick={handleSaveAttendance}
          disabled={isSaving || students.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Saving Records...' : 'Save Attendance'}
        </button>
      </div>

      {/* Class & Date Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c._count?.students || 0} students)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Session Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Quick Batch Marking Buttons */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            onClick={() => markAll('PRESENT')}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Mark All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
          >
            <XCircle className="w-3.5 h-3.5" /> Mark All Absent
          </button>
        </div>
      </div>

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="bg-white border border-slate-200 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-slate-400">Total Roster</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{totalCount}</p>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-emerald-700">Present</span>
          <p className="text-xl font-black text-emerald-700 mt-0.5">{presentCount}</p>
        </div>
        <div className="bg-rose-50/70 border border-rose-200/80 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-rose-700">Absent</span>
          <p className="text-xl font-black text-rose-700 mt-0.5">{absentCount}</p>
        </div>
        <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl">
          <span className="text-[10px] font-bold uppercase text-amber-700">Late / Excused</span>
          <p className="text-xl font-black text-amber-700 mt-0.5">{lateCount + excusedCount}</p>
        </div>
        <div className="bg-indigo-50/70 border border-indigo-200/80 p-3.5 rounded-2xl col-span-2 sm:col-span-1">
          <span className="text-[10px] font-bold uppercase text-indigo-700">Daily Presence</span>
          <p className="text-xl font-black text-indigo-700 mt-0.5">{attendanceRate}%</p>
        </div>
      </div>

      {/* Roll Call Student Roster Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4 text-center">Status Action</th>
                <th className="py-3 px-4">Remarks / Excuse Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    Loading class roster...
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-slate-400">
                    No students currently enrolled in this class.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                  const currentRemarks = attendanceMap[student.id]?.remarks || '';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">{student.rollNumber}</td>
                      <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2.5">
                        <img
                          src={
                            student.user?.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(
                              student.user?.name || 'Student'
                            )}`
                          }
                          alt={student.user?.name}
                          className="w-7 h-7 rounded-full object-cover"
                        />
                        <span>{student.user?.name}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-amber-50 hover:text-amber-700'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional remarks (e.g. Doctor note)..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:ring-1 focus:ring-indigo-500"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
