'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User,
  Mail,
  Phone,
  Calendar,
  ShoppingBag,
  CreditCard,
  UtensilsCrossed,
  Clock,
  Sparkles,
  Shield,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { UserSessionPayload } from '@/lib/types';

export default function ProfilePage() {
  const [user, setUser] = useState<UserSessionPayload | null>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [reservations, setReservations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then((r) => (r.ok ? r.json() : { user: null })),
      fetch('/api/orders').then((r) => (r.ok ? r.json() : { orders: [] })),
      fetch('/api/reservations').then((r) => (r.ok ? r.json() : { reservations: [] })),
    ])
      .then(([userData, orderData, resData]) => {
        setUser(userData.user);
        setOrders(orderData.orders || []);
        setReservations(resData.reservations || []);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold">Please sign in to view your profile</h2>
        <Link
          href="/login"
          className="inline-block px-6 py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs"
        >
          Go to Sign In
        </Link>
      </div>
    );
  }

  const lifetimeSpend = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center gap-6">
        <img
          src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200'}
          alt={user.name}
          className="w-24 h-24 rounded-3xl object-cover shadow-md border-2 border-amber-500/30"
        />

        <div className="text-center sm:text-left space-y-2">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <h1 className="text-2xl font-black text-slate-900">{user.name}</h1>
            <span className="text-[11px] font-bold px-3 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase tracking-wide">
              {user.role} Account
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" /> {user.email}
            </span>
            {user.phone && (
              <span className="flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-slate-400" /> {user.phone}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Account Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Orders</span>
            <ShoppingBag className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{orders.length}</p>
          <span className="text-[11px] text-slate-400">Lifetime culinary tickets</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Total Spend</span>
            <CreditCard className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(lifetimeSpend)}</p>
          <span className="text-[11px] text-slate-400">Accumulated rewards base</span>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400">
            <span>Table Bookings</span>
            <Calendar className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-3xl font-black text-slate-900 mt-2">{reservations.length}</p>
          <span className="text-[11px] text-slate-400">Confirmed dining experiences</span>
        </div>
      </div>

      {/* Quick Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-600" />
            <span>Recent Orders</span>
          </h3>

          {orders.length === 0 ? (
            <p className="text-xs text-slate-400">No recent orders placed yet.</p>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 3).map((o) => (
                <div key={o.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 block">{o.orderNumber}</span>
                    <span className="text-slate-400">{formatDate(o.createdAt)}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-slate-900 block">{formatCurrency(o.total)}</span>
                    <span className="text-[10px] font-bold text-amber-600">{o.status}</span>
                  </div>
                </div>
              ))}
              <Link href="/orders" className="text-xs font-bold text-amber-600 hover:text-amber-700 block text-right pt-1">
                View all orders →
              </Link>
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-600" />
            <span>Upcoming Reservations</span>
          </h3>

          {reservations.length === 0 ? (
            <p className="text-xs text-slate-400">No active table reservations.</p>
          ) : (
            <div className="space-y-3">
              {reservations.slice(0, 3).map((r) => (
                <div key={r.id} className="flex items-center justify-between text-xs border-b border-slate-100 pb-2">
                  <div>
                    <span className="font-bold text-slate-900 block">{r.timeSlot} • {r.guestCount} Guests</span>
                    <span className="text-slate-400">{formatDate(r.reservationDate)}</span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    {r.status}
                  </span>
                </div>
              ))}
              <Link href="/reservations" className="text-xs font-bold text-amber-600 hover:text-amber-700 block text-right pt-1">
                Book a new table →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
