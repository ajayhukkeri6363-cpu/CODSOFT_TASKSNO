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
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { ClassWithDetails } from '@/lib/types';

export default function TeacherAttendancePage() {
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

  useEffect(() => {
    fetch('/api/classes')
      .then((res) => res.json())
      .then((data) => {
        if (data.classes?.length > 0) {
          setClasses(data.classes);
          setSelectedClassId(data.classes[0].id);
        }
      });
  }, []);

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

  const handleSave = async () => {
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
        toast.success(`Attendance saved for ${records.length} students!`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save attendance');
      }
    } catch (err) {
      toast.error('Failed to submit attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Class Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Take roll call for your assigned class cohorts.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isSaving || students.length === 0}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {isSaving ? 'Submitting...' : 'Submit Attendance'}
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Select Class</label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            >
              {classes.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Date</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => markAll('PRESENT')}
            className="px-3 py-2 bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 text-xs font-bold rounded-xl"
          >
            Mark All Present
          </button>
          <button
            onClick={() => markAll('ABSENT')}
            className="px-3 py-2 bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 text-xs font-bold rounded-xl"
          >
            Mark All Absent
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Roll No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Remarks</th>
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
                    No students in this class.
                  </td>
                </tr>
              ) : (
                students.map((student) => {
                  const currentStatus = attendanceMap[student.id]?.status || 'PRESENT';
                  const currentRemarks = attendanceMap[student.id]?.remarks || '';

                  return (
                    <tr key={student.id} className="hover:bg-slate-50/70">
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
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                              currentStatus === 'PRESENT'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                              currentStatus === 'ABSENT'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'LATE')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                              currentStatus === 'LATE'
                                ? 'bg-amber-500 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                            className={`px-3 py-1.5 rounded-xl font-bold text-xs ${
                              currentStatus === 'EXCUSED'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            Excused
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <input
                          type="text"
                          placeholder="Optional remarks..."
                          value={currentRemarks}
                          onChange={(e) => handleRemarksChange(student.id, e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
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
