'use client';

import React, { useEffect, useState } from 'react';
import { CalendarCheck, CheckCircle2, Clock, XCircle, AlertCircle } from 'lucide-react';
import { formatDate, getAttendanceColor } from '@/lib/utils';
import { useToast } from '@/components/ui/Toast';

export default function StudentAttendancePage() {
  const { toast } = useToast();
  const [attendances, setAttendances] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.student?.attendances) {
          setAttendances(data.student.attendances);
        }
        setIsLoading(false);
      })
      .catch((err) => {
        console.error(err);
        toast.error('Failed to load attendance history');
        setIsLoading(false);
      });
  }, []);

  const total = attendances.length;
  const present = attendances.filter((a) => a.status === 'PRESENT').length;
  const late = attendances.filter((a) => a.status === 'LATE').length;
  const absent = attendances.filter((a) => a.status === 'ABSENT').length;
  const percent = total > 0 ? ((present / total) * 100).toFixed(1) : '100.0';

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Attendance Record</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track your daily classroom presence, punctuality, and leave logs.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
          <span className="text-[10px] uppercase font-bold text-slate-400">Attendance Rate</span>
          <p className="text-2xl font-black text-emerald-600 mt-1">{percent}%</p>
          <span className="text-[11px] text-emerald-700 font-semibold">Good Academic Standing</span>
        </div>
        <div className="bg-emerald-50/70 border border-emerald-200/80 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-emerald-700">Present Days</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">{present}</p>
          <span className="text-[11px] text-emerald-600">Attended Sessions</span>
        </div>
        <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-amber-700">Late / Excused</span>
          <p className="text-2xl font-black text-amber-700 mt-1">{late}</p>
          <span className="text-[11px] text-amber-600">Recorded with remark</span>
        </div>
        <div className="bg-rose-50/70 border border-rose-200/80 p-4 rounded-2xl">
          <span className="text-[10px] uppercase font-bold text-rose-700">Unexcused Absent</span>
          <p className="text-2xl font-black text-rose-700 mt-1">{absent}</p>
          <span className="text-[11px] text-rose-600">Missed Sessions</span>
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Daily Attendance Activity Log (Last 30 Days)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Notes / Leave Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-slate-400">
                    Loading attendance history...
                  </td>
                </tr>
              ) : attendances.length === 0 ? (
                <tr>
                  <td colSpan={3} className="text-center py-12 text-slate-400">
                    No attendance records logged yet.
                  </td>
                </tr>
              ) : (
                attendances.map((att) => (
                  <tr key={att.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-bold text-slate-800">{formatDate(att.date)}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full font-bold border text-[10px] ${getAttendanceColor(
                          att.status
                        )}`}
                      >
                        {att.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{att.remarks || 'Regular presence recorded'}</td>
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
