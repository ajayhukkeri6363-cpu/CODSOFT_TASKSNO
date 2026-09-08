'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  Calendar,
  LayoutGrid,
  TrendingUp,
  UtensilsCrossed,
  Users,
  Flame,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { formatCurrency } from '@/lib/utils';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const PIE_COLORS = ['#f59e0b', '#059669', '#3b82f6', '#ef4444', '#8b5cf6'];

export default function AdminAnalyticsDashboard() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics')
      .then((r) => (r.ok ? r.json() : null))
      .then((res) => {
        setData(res);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-slate-200 rounded-xl w-1/3 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-white rounded-3xl animate-pulse border border-slate-100" />
          ))}
        </div>
      </div>
    );
  }

  const { summary, topSellingDishes, ordersByType, ordersByStatus } = data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Executive Performance Intelligence
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Restaurant Operations & Revenue
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time culinary analytics, table turnover rates, and gross sales reporting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/menu"
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <UtensilsCrossed className="w-3.5 h-3.5 text-amber-400" />
            <span>Manage Menu</span>
          </Link>
          <Link
            href="/staff"
            className="px-4 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Open KDS</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Gross Sales Revenue"
          value={formatCurrency(summary.grossRevenue)}
          subtitle={`Today: ${formatCurrency(summary.todayRevenue)}`}
          icon={DollarSign}
          trend={{ value: '+14.2%', isPositive: true }}
          colorScheme="amber"
        />

        <StatsCard
          title="Total Orders"
          value={summary.totalOrders}
          subtitle={`Today: ${summary.todayOrders} orders`}
          icon={ShoppingBag}
          trend={{ value: '+8.5%', isPositive: true }}
          colorScheme="blue"
        />

        <StatsCard
          title="Average Order Value"
          value={formatCurrency(summary.averageOrderValue)}
          subtitle="Per dining ticket"
          icon={TrendingUp}
          colorScheme="emerald"
        />

        <StatsCard
          title="Table Occupancy"
          value={`${summary.occupancyRate}%`}
          subtitle={`${summary.availableTables} of ${summary.totalTables} tables free`}
          icon={LayoutGrid}
          colorScheme="indigo"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Chart: Top Selling Dishes by Volume */}
        <div className="lg:col-span-7 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Best-Selling Dishes (By Volume)
              </h3>
              <p className="text-[11px] text-slate-400">Total units prepared and sold across all channels</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topSellingDishes} layout="vertical" margin={{ left: 20, right: 20 }}>
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" width={110} tick={{ fontSize: 10 }} />
                <Tooltip
                  formatter={(value: any, name: any) => [`${value} orders`, 'Units Sold']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Bar dataKey="quantity" fill="#f59e0b" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Chart: Channel Breakdown (Dine-in, Takeaway, Delivery) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Orders by Dining Channel
              </h3>
              <p className="text-[11px] text-slate-400">Volume distribution across service types</p>
            </div>
          </div>

          <div className="h-64 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={ordersByType}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {ordersByType.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val: any) => [`${val} orders`, 'Volume']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Operational Highlights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-400 uppercase">Active Reservations</span>
            <Calendar className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black">{summary.activeReservationsCount}</p>
          <p className="text-xs text-slate-400">Parties booked for dining service</p>
          <Link
            href="/admin/reservations"
            className="text-xs font-bold text-amber-400 hover:text-amber-300 inline-flex items-center gap-1 pt-2"
          >
            <span>View reservation ledger</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Pending In-Kitchen</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.pendingOrdersCount}</p>
          <p className="text-xs text-slate-400">Tickets currently in queue or preparation</p>
          <Link
            href="/staff"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 inline-flex items-center gap-1 pt-2"
          >
            <span>Switch to KDS screen</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase">Dining Floor Tables</span>
            <LayoutGrid className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-3xl font-black text-slate-900">{summary.totalTables}</p>
          <p className="text-xs text-slate-400">{summary.occupiedTables} occupied / {summary.availableTables} available</p>
          <Link
            href="/admin/tables"
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 inline-flex items-center gap-1 pt-2"
          >
            <span>Manage tables & capacities</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
