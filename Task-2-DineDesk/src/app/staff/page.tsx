'use client';

import React, { useState, useEffect } from 'react';
import {
  Flame,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  Check,
  RotateCcw,
  UtensilsCrossed,
  Truck,
  ShoppingBasket,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatTime, getOrderStatusBadge } from '@/lib/utils';

export default function KitchenKDSDashboard() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('ALL');

  const fetchKitchenOrders = () => {
    fetch('/api/orders')
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => {
        setOrders(data.orders);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchKitchenOrders();
    // Live polling every 5 seconds for incoming kitchen tickets
    const interval = setInterval(fetchKitchenOrders, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Ticket updated to ${newStatus}`);
        fetchKitchenOrders();
      } else {
        error(data.error || 'Failed to update ticket status');
      }
    } catch {
      error('Error updating order');
    }
  };

  const filteredOrders = orders.filter((o) =>
    filterType === 'ALL' ? true : o.orderType === filterType
  );

  const incomingOrders = filteredOrders.filter((o) => o.status === 'PLACED');
  const inPrepOrders = filteredOrders.filter(
    (o) => o.status === 'CONFIRMED' || o.status === 'PREPARING'
  );
  const readyOrders = filteredOrders.filter((o) => o.status === 'READY');
  const recentCompleted = filteredOrders
    .filter((o) => o.status === 'COMPLETED')
    .slice(0, 4);

  return (
    <div className="space-y-8">
      {/* KDS Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-md">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-orange-500/30">
            <Flame className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                Live Kitchen Display System (KDS)
              </h1>
              <span className="flex items-center gap-1 text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-full">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Feed
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time ticket dispatch, cooking timers, and service line coordination.
            </p>
          </div>
        </div>

        {/* Order Type Filter */}
        <div className="flex items-center gap-1.5 bg-slate-800/90 p-1.5 rounded-2xl border border-slate-700 text-xs">
          {['ALL', 'DINE_IN', 'TAKEAWAY', 'DELIVERY'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                filterType === t
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {t === 'ALL' ? 'All Channels' : t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* KDS 3-Column Kanban Board */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Column 1: Incoming Tickets (PLACED) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-amber-500/10 border border-amber-500/20 px-4 py-2.5 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Incoming Tickets ({incomingOrders.length})</span>
            </h3>
            {incomingOrders.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 font-black text-[10px] animate-pulse">
                ACTION REQUIRED
              </span>
            )}
          </div>

          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No new incoming tickets
              </div>
            ) : (
              incomingOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border-2 border-amber-400 shadow-md space-y-4 animate-slide-up"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono text-sm font-black text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold text-amber-600 uppercase">
                        {order.orderType.replace('_', ' ')} {order.table && `• ${order.table.tableNumber}`}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {formatTime(order.createdAt)}
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 text-xs">
                    {order.items.map((it: any) => (
                      <div key={it.id} className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-900">
                          {it.quantity}x {it.menuItem.name}
                        </span>
                        {it.specialInstructions && (
                          <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded italic">
                            "{it.specialInstructions}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl italic">
                      Note: "{order.notes}"
                    </p>
                  )}

                  {/* Action */}
                  <div className="flex gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'PREPARING')}
                      className="flex-1 py-2.5 px-3 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-slate-950" />
                      <span>Accept & Start Cooking</span>
                    </button>
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'CANCELLED')}
                      className="py-2.5 px-3 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 transition"
                      title="Reject ticket"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 2: In Kitchen Cooking (CONFIRMED / PREPARING) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-orange-500/10 border border-orange-500/20 px-4 py-2.5 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-orange-700 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-orange-600" />
              <span>Cooking Queue ({inPrepOrders.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">On Fire</span>
          </div>

          <div className="space-y-4">
            {inPrepOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                Kitchen stations idle
              </div>
            ) : (
              inPrepOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-orange-200 shadow-sm space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono text-sm font-black text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold text-orange-600 uppercase">
                        {order.orderType.replace('_', ' ')} {order.table && `• ${order.table.tableNumber}`}
                      </span>
                    </div>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800 animate-pulse">
                      In Cooking
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="space-y-2 text-xs">
                    {order.items.map((it: any) => (
                      <div key={it.id} className="space-y-0.5">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-slate-900">
                            {it.quantity}x {it.menuItem.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            ~{it.menuItem.prepTimeMinutes}m
                          </span>
                        </div>
                        {it.specialInstructions && (
                          <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded block italic">
                            "{it.specialInstructions}"
                          </span>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action */}
                  <button
                    onClick={() => handleUpdateStatus(order.id, 'READY')}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20"
                  >
                    <Check className="w-4 h-4" />
                    <span>Food Plated & Ready</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Column 3: Ready for Service (READY) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 rounded-2xl">
            <h3 className="text-xs font-black uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Ready for Service / Pickup ({readyOrders.length})</span>
            </h3>
            <span className="text-[10px] font-bold text-slate-400">Plated</span>
          </div>

          <div className="space-y-4">
            {readyOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400 text-xs">
                No orders waiting on pass
              </div>
            ) : (
              readyOrders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-5 border border-emerald-300 shadow-md space-y-4"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <span className="font-mono text-sm font-black text-slate-900 block">
                        {order.orderNumber}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 uppercase">
                        {order.orderType.replace('_', ' ')} {order.table && `• ${order.table.tableNumber}`}
                      </span>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      ON PASS
                    </span>
                  </div>

                  <div className="text-xs text-slate-600">
                    <p className="font-semibold text-slate-800">{order.customerName} ({order.customerPhone})</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      {order.items.length} dishes • Total {formatCurrency(order.total)}
                    </p>
                  </div>

                  <button
                    onClick={() => handleUpdateStatus(order.id, 'COMPLETED')}
                    className="w-full py-2.5 px-3 rounded-xl text-xs font-black bg-slate-900 hover:bg-slate-800 text-white transition flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Mark Served / Delivered</span>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recently Completed Roll */}
      {recentCompleted.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Recently Dispatched Tickets
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {recentCompleted.map((o) => (
              <div key={o.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between font-bold text-slate-800">
                  <span>{o.orderNumber}</span>
                  <span className="text-emerald-600">Done</span>
                </div>
                <p className="text-[11px] text-slate-400 truncate">{o.customerName}</p>
                <p className="text-[10px] text-slate-400">{formatCurrency(o.total)}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
