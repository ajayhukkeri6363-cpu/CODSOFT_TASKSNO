'use client';

import React, { useState, useEffect } from 'react';
import {
  LayoutGrid,
  Users,
  CheckCircle2,
  Clock,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { getTableStatusBadge } from '@/lib/utils';
import { TableStatus } from '@/lib/types';

export default function StaffTableManager() {
  const { success, error } = useToast();
  const [tables, setTables] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTables = () => {
    fetch('/api/tables')
      .then((r) => (r.ok ? r.json() : { tables: [] }))
      .then((data) => {
        setTables(data.tables);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchTables();
    const interval = setInterval(fetchTables, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleStatusChange = async (tableId: string, newStatus: TableStatus) => {
    try {
      const res = await fetch(`/api/tables/${tableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success(data.message || 'Status updated');
        fetchTables();
      } else {
        error(data.error || 'Failed to update table status');
      }
    } catch {
      error('Error updating table status');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Dining Room Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Live Floor Plan & Table Occupancy
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time table seating, active orders, and turnover statuses.
          </p>
        </div>

        <button
          onClick={fetchTables}
          className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Floor Plan</span>
        </button>
      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => {
          const badge = getTableStatusBadge(table.status);
          const activeOrder = table.orders && table.orders.length > 0 ? table.orders[0] : null;

          return (
            <div
              key={table.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm transition space-y-4 ${
                table.status === 'OCCUPIED'
                  ? 'border-rose-300 ring-2 ring-rose-500/10'
                  : table.status === 'RESERVED'
                  ? 'border-amber-300'
                  : table.status === 'CLEANING'
                  ? 'border-indigo-300'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900">{table.tableNumber}</h3>
                  <span className="text-[11px] font-semibold text-slate-400">
                    {table.location.replace('_', ' ')}
                  </span>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-bold ${badge.color}`}>
                  {badge.label}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl">
                <span className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-slate-400" />
                  <span className="font-bold">{table.capacity} Seats</span>
                </span>
                {activeOrder && (
                  <span className="text-amber-600 font-bold truncate">
                    Ticket: {activeOrder.orderNumber}
                  </span>
                )}
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                  Quick State Toggle:
                </label>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <button
                    onClick={() => handleStatusChange(table.id, 'AVAILABLE')}
                    className={`py-1.5 rounded-lg border transition ${
                      table.status === 'AVAILABLE'
                        ? 'bg-emerald-600 text-white border-emerald-600 font-black'
                        : 'bg-slate-50 hover:bg-emerald-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleStatusChange(table.id, 'OCCUPIED')}
                    className={`py-1.5 rounded-lg border transition ${
                      table.status === 'OCCUPIED'
                        ? 'bg-rose-600 text-white border-rose-600 font-black'
                        : 'bg-slate-50 hover:bg-rose-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Occupied
                  </button>
                  <button
                    onClick={() => handleStatusChange(table.id, 'RESERVED')}
                    className={`py-1.5 rounded-lg border transition ${
                      table.status === 'RESERVED'
                        ? 'bg-amber-500 text-slate-950 border-amber-500 font-black'
                        : 'bg-slate-50 hover:bg-amber-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Reserved
                  </button>
                  <button
                    onClick={() => handleStatusChange(table.id, 'CLEANING')}
                    className={`py-1.5 rounded-lg border transition ${
                      table.status === 'CLEANING'
                        ? 'bg-indigo-600 text-white border-indigo-600 font-black'
                        : 'bg-slate-50 hover:bg-indigo-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    Cleaning
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
