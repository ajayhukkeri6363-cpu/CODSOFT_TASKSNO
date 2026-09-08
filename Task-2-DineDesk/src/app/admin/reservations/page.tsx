'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function AdminReservationLedger() {
  const { success, error } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.append('status', statusFilter);

    fetch(`/api/reservations?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { reservations: [] }))
      .then((data) => {
        setReservations(data.reservations);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchReservations();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Reservation updated to ${newStatus}`);
        fetchReservations();
      } else {
        error(data.error || 'Failed to update reservation');
      }
    } catch {
      error('Error updating reservation');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this reservation?')) return;
    try {
      const res = await fetch(`/api/reservations/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        success('Reservation deleted');
        fetchReservations();
      } else {
        error(data.error || 'Failed to delete');
      }
    } catch {
      error('Error deleting reservation');
    }
  };

  const filtered = reservations.filter((r) =>
    search
      ? r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.customerPhone.includes(search) ||
        (r.customerEmail && r.customerEmail.toLowerCase().includes(search.toLowerCase()))
      : true
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Guest Concierge Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Master Table Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit all customer table bookings, seat sizes, and dining preferences.
          </p>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest, phone, or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">Status:</span>
          {['ALL', 'CONFIRMED', 'SEATED', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                statusFilter === st
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No reservations found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Guest Details</th>
                  <th className="py-4 px-6">Date & Time</th>
                  <th className="py-4 px-6">Party Size</th>
                  <th className="py-4 px-6">Assigned Table</th>
                  <th className="py-4 px-6">Special Notes</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{res.customerName}</p>
                      <p className="text-[11px] text-slate-400">{res.customerPhone}</p>
                      {res.customerEmail && <p className="text-[11px] text-slate-400">{res.customerEmail}</p>}
                    </td>

                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-900">{formatDate(res.reservationDate)}</p>
                      <p className="text-[11px] text-amber-600 font-bold">{res.timeSlot}</p>
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-700">
                      {res.guestCount} Guests
                    </td>

                    <td className="py-4 px-6">
                      {res.table ? (
                        <span className="font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg">
                          {res.table.tableNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-500 max-w-xs truncate">
                      {res.specialRequests || '—'}
                    </td>

                    <td className="py-4 px-6">
                      <select
                        value={res.status}
                        onChange={(e) => handleUpdateStatus(res.id, e.target.value)}
                        className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${
                          res.status === 'CONFIRMED'
                            ? 'bg-amber-50 text-amber-800 border-amber-300'
                            : res.status === 'SEATED'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : res.status === 'COMPLETED'
                            ? 'bg-slate-100 text-slate-700 border-slate-300'
                            : 'bg-rose-50 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="SEATED">SEATED</option>
                        <option value="COMPLETED">COMPLETED</option>
                        <option value="CANCELLED">CANCELLED</option>
                      </select>
                    </td>

                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDelete(res.id)}
                        className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Reservation"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
