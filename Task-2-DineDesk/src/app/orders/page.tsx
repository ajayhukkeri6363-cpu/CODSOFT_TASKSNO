'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  Clock,
  ArrowRight,
  UtensilsCrossed,
  Truck,
  ShoppingBasket,
  Search,
  ExternalLink,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getOrderStatusBadge } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const { addItem } = useCart();
  const { success } = useToast();

  const fetchOrders = () => {
    setIsLoading(true);
    const params = new URLSearchParams();
    if (statusFilter !== 'ALL') params.append('status', statusFilter);
    if (typeFilter !== 'ALL') params.append('orderType', typeFilter);

    fetch(`/api/orders?${params.toString()}`)
      .then((r) => (r.ok ? r.json() : { orders: [] }))
      .then((data) => {
        setOrders(data.orders);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter, typeFilter]);

  const handleReorder = (order: any) => {
    let count = 0;
    for (const item of order.items) {
      if (item.menuItem) {
        addItem({
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          price: item.menuItem.price,
          image: item.menuItem.image,
          quantity: item.quantity,
        });
        count++;
      }
    }
    success(`Added ${count} items from ${order.orderNumber} to cart!`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Order Activity & Receipts
          </span>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
            My Order History
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">Track live orders or reorder your favorite meals.</p>
        </div>

        <Link
          href="/menu"
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs shadow-sm transition flex items-center gap-2 self-start sm:self-auto"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>New Food Order</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="font-bold text-slate-400 mr-1">Status:</span>
          {['ALL', 'PLACED', 'CONFIRMED', 'PREPARING', 'READY', 'COMPLETED', 'CANCELLED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-slate-900 text-amber-400 shadow-sm'
                  : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">Type:</span>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="DINE_IN">Dine-In</option>
            <option value="TAKEAWAY">Takeaway</option>
            <option value="DELIVERY">Delivery</option>
          </select>
        </div>
      </div>

      {/* Orders List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse space-y-3">
              <div className="h-6 bg-slate-200 rounded w-1/4" />
              <div className="h-4 bg-slate-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 p-8 space-y-4">
          <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto">
            <ShoppingBag className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No orders found</h3>
          <p className="text-slate-500 text-xs max-w-sm mx-auto">
            You have not placed any orders matching the selected filter criteria.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-600 transition"
          >
            <span>Start an Order</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const badge = getOrderStatusBadge(order.status);
            return (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-black text-slate-900">
                      {order.orderNumber}
                    </span>
                    <span className={`text-[11px] px-2.5 py-0.5 rounded-full border font-bold ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md uppercase">
                      {order.orderType.replace('_', ' ')}
                    </span>
                  </div>

                  <span className="text-xs text-slate-400">
                    {formatDateTime(order.createdAt)}
                  </span>
                </div>

                {/* Items preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1 text-xs">
                    {order.items.map((item: any) => (
                      <div key={item.id} className="flex items-center justify-between text-slate-700">
                        <span>
                          <span className="font-bold text-slate-900">{item.quantity}x</span> {item.menuItem?.name || 'Dish'}
                        </span>
                        <span className="font-medium text-slate-500">{formatCurrency(item.totalPrice)}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col justify-between items-start md:items-end gap-3 pt-2 md:pt-0">
                    <div className="text-left md:text-right">
                      <span className="text-[11px] text-slate-400 block">Total Amount</span>
                      <span className="text-xl font-black text-slate-900">
                        {formatCurrency(order.total)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleReorder(order)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        Reorder Items
                      </button>
                      <Link
                        href={`/orders/${order.orderNumber}`}
                        className="px-4 py-2 rounded-xl text-xs font-black bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-sm transition flex items-center gap-1.5"
                      >
                        <span>Live Tracker</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
