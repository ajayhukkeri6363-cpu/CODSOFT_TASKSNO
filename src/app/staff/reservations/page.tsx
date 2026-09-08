'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Users,
  CheckCircle2,
  Clock,
  Search,
  Check,
  X,
  MapPin,
  RefreshCw,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatDate } from '@/lib/utils';

export default function StaffReservationReception() {
  const { success, error } = useToast();
  const [reservations, setReservations] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState(() => new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReservations = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (dateFilter) params.append('date', dateFilter);

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
  }, [dateFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/reservations/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Reservation marked as ${newStatus}`);
        fetchReservations();
      } else {
        error(data.error || 'Failed to update reservation');
      }
    } catch {
      error('Error updating reservation');
    }
  };

  const filtered = reservations.filter((r) =>
    search
      ? r.customerName.toLowerCase().includes(search.toLowerCase()) ||
        r.customerPhone.includes(search)
      : true
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Hostess & Maître D' Stand
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Guest Check-In & Reservations
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Check-in arriving parties, seat guests at designated tables, and manage attendance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <button
            onClick={fetchReservations}
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition shadow-sm"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by guest name or phone number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* Reservation Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-24" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Calendar className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No bookings for selected date</h3>
          <p className="text-xs text-slate-400">All reservations for {formatDate(dateFilter)} have been processed or none booked.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((res) => (
            <div
              key={res.id}
              className={`bg-white rounded-3xl p-6 border shadow-sm transition space-y-4 ${
                res.status === 'SEATED'
                  ? 'border-emerald-300'
                  : res.status === 'CONFIRMED'
                  ? 'border-amber-300'
                  : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-base font-black text-slate-900">{res.customerName}</h4>
                  <p className="text-xs text-slate-500 font-medium">{res.customerPhone}</p>
                </div>
                <span
                  className={`text-[10px] font-black px-2.5 py-1 rounded-full uppercase ${
                    res.status === 'SEATED'
                      ? 'bg-emerald-100 text-emerald-800'
                      : res.status === 'CONFIRMED'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {res.status}
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl text-xs space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Seating Time:</span>
                  <span className="font-bold text-slate-900">{res.timeSlot}</span>
                </div>
                <div className="flex justify-between">
                  <span>Party Size:</span>
                  <span className="font-bold text-slate-900">{res.guestCount} Guests</span>
                </div>
                {res.table && (
                  <div className="flex justify-between text-amber-700 font-bold">
                    <span>Table Assigned:</span>
                    <span>{res.table.tableNumber} ({res.table.location.replace('_', ' ')})</span>
                  </div>
                )}
                {res.specialRequests && (
                  <p className="text-[11px] text-slate-500 italic pt-1 border-t border-slate-200/60 mt-1">
                    "{res.specialRequests}"
                  </p>
                )}
              </div>

              {/* Hostess Action Buttons */}
              <div className="flex gap-2 pt-1 border-t border-slate-100">
                {res.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(res.id, 'SEATED')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Seat Party</span>
                  </button>
                )}
                {res.status === 'SEATED' && (
                  <button
                    onClick={() => handleUpdateStatus(res.id, 'COMPLETED')}
                    className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-slate-900 hover:bg-slate-800 text-white transition"
                  >
                    Mark Completed
                  </button>
                )}
                <button
                  onClick={() => handleUpdateStatus(res.id, 'CANCELLED')}
                  className="py-2 px-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                  title="Cancel booking"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
