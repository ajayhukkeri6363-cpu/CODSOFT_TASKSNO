'use client';

import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  ArrowDownRight,
} from 'lucide-react';
import { formatCurrency, formatDateTime } from '@/lib/utils';

export default function AdminPaymentLedger() {
  const [payments, setPayments] = useState<any[]>([]);
  const [totalCollected, setTotalCollected] = useState(0);
  const [methodFilter, setMethodFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (methodFilter) params.append('method', methodFilter);
    if (statusFilter) params.append('status', statusFilter);

    fetch(`/api/payments?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { payments: [], totalCollected: 0 }))
      .then((data) => {
        setPayments(data.payments);
        setTotalCollected(data.totalCollected);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchPayments();
  }, [methodFilter, statusFilter]);

  const filtered = payments.filter((p) =>
    search
      ? p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        p.order?.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        p.order?.customerName.toLowerCase().includes(search.toLowerCase())
      : true
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Financial Audit & Ledger
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Payment Transactions
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit gateway settlements, payment methods, and dining invoices.
          </p>
        </div>

        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl border border-slate-800 shadow-md">
          <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
            Total Settled Collections
          </span>
          <span className="text-xl font-black text-white">{formatCurrency(totalCollected)}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search txn ID, ticket, or guest..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="">All Methods</option>
              <option value="CARD">CARD</option>
              <option value="CASH">CASH</option>
              <option value="ONLINE">ONLINE</option>
              <option value="UPI">UPI</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <CreditCard className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No payment transactions found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Transaction ID</th>
                  <th className="py-4 px-6">Order Reference</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Payment Method</th>
                  <th className="py-4 px-6">Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Settled Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-900">
                      {p.transactionId}
                    </td>

                    <td className="py-4 px-6 font-mono text-amber-600 font-bold">
                      {p.order?.orderNumber || '—'}
                    </td>

                    <td className="py-4 px-6 font-bold text-slate-800">
                      {p.order?.customerName || 'Walk-in Guest'}
                    </td>

                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 font-bold text-slate-700">
                        {p.paymentMethod}
                      </span>
                    </td>

                    <td className="py-4 px-6 font-black text-slate-900 text-sm">
                      {formatCurrency(p.amount)}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-right text-slate-400">
                      {formatDateTime(p.createdAt)}
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
