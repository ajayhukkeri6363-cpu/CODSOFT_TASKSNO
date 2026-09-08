'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  ShoppingBag,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';

export default function AdminCustomerDirectory() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/customers')
      .then((r) => (r.ok ? r.json() : { customers: [] }))
      .then((data) => {
        setCustomers(data.customers);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const filtered = customers.filter((c) =>
    search
      ? c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.email.toLowerCase().includes(search.toLowerCase()) ||
        (c.phone && c.phone.includes(search))
      : true
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Guest Relationship Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Customer Directory & Loyalty
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit registered diners, cumulative order volumes, and lifetime culinary spending.
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="max-w-md">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers by name, email, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm"
          />
        </div>
      </div>

      {/* Customers Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <Users className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No customers found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Contact Info</th>
                  <th className="py-4 px-6">Total Orders</th>
                  <th className="py-4 px-6">Lifetime Spend</th>
                  <th className="py-4 px-6">Table Bookings</th>
                  <th className="py-4 px-6">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <img
                          src={c.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                          alt={c.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 shadow-sm"
                        />
                        <div>
                          <p className="font-bold text-slate-900">{c.name}</p>
                          <span className="text-[10px] text-amber-600 font-bold uppercase">Customer</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      <p className="flex items-center gap-1.5 font-medium">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span>{c.email}</span>
                      </p>
                      {c.phone && (
                        <p className="flex items-center gap-1.5 text-slate-400 text-[11px] mt-0.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{c.phone}</span>
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-900">
                      {c.totalOrders} orders
                    </td>

                    <td className="py-4 px-6 font-black text-emerald-600 text-sm">
                      {formatCurrency(c.lifetimeSpend)}
                    </td>

                    <td className="py-4 px-6 font-semibold text-slate-700">
                      {c.totalReservations} reservations
                    </td>

                    <td className="py-4 px-6 text-slate-400">
                      {formatDate(c.createdAt)}
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
