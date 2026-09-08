'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Clock,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  ArrowLeft,
  Printer,
  UtensilsCrossed,
  MapPin,
  Flame,
  AlertCircle,
} from 'lucide-react';
import { formatCurrency, formatDateTime, getOrderStatusBadge } from '@/lib/utils';

const ORDER_STEPS = [
  { status: 'PLACED', label: 'Order Received', desc: 'Ticket transmitted to kitchen' },
  { status: 'CONFIRMED', label: 'Confirmed', desc: 'Kitchen queue scheduled' },
  { status: 'PREPARING', label: 'In Kitchen', desc: 'Chef is preparing your meal' },
  { status: 'READY', label: 'Ready to Serve', desc: 'Food prepared & plated' },
  { status: 'COMPLETED', label: 'Completed', desc: 'Order delivered / served' },
];

export default function OrderTrackingPage({ params }: { params: { id: string } }) {
  const [order, setOrder] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchOrder = () => {
    fetch(`/api/orders/${params.id}`)
      .then((r) => {
        if (!r.ok) throw new Error('Order not found');
        return r.json();
      })
      .then((data) => {
        setOrder(data.order);
        setIsLoading(false);
      })
      .catch((err) => {
        setErrorMsg(err.message);
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchOrder();
    // Poll status every 8 seconds for live kitchen updates
    const interval = setInterval(fetchOrder, 8000);
    return () => clearInterval(interval);
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-slate-500 text-sm font-semibold">Connecting to Kitchen Display Tracker...</p>
      </div>
    );
  }

  if (errorMsg || !order) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">Order Not Found</h2>
        <p className="text-slate-500 text-sm">
          We could not locate an order matching ticket <span className="font-bold">"{params.id}"</span>.
        </p>
        <Link
          href="/orders"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>View All Orders</span>
        </Link>
      </div>
    );
  }

  const currentStepIndex = ORDER_STEPS.findIndex((s) => s.status === order.status);
  const badge = getOrderStatusBadge(order.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <Link
            href="/orders"
            className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1 mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Orders</span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <span>Ticket {order.orderNumber}</span>
            <span className={`text-xs px-3 py-1 rounded-full border font-bold ${badge.color}`}>
              {badge.label}
            </span>
          </h1>
        </div>

        <button
          onClick={() => window.print()}
          className="px-4 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print Receipt</span>
        </button>
      </div>

      {/* Live Order Status Stepper */}
      {order.status !== 'CANCELLED' ? (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Live Preparation Tracker</span>
            </h3>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200 animate-pulse">
              Est. Prep Time: ~{order.estimatedPrepMin} mins
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 pt-2">
            {ORDER_STEPS.map((step, idx) => {
              const isPassed = idx <= currentStepIndex;
              const isCurrent = idx === currentStepIndex;

              return (
                <div
                  key={step.status}
                  className={`p-4 rounded-2xl border transition text-center space-y-1 ${
                    isCurrent
                      ? 'bg-amber-50 border-amber-500 shadow-sm scale-105'
                      : isPassed
                      ? 'bg-slate-50 border-emerald-300 text-slate-800'
                      : 'bg-white border-slate-100 text-slate-400 opacity-60'
                  }`}
                >
                  <div className="w-8 h-8 rounded-full flex items-center justify-center mx-auto text-xs font-bold mb-2">
                    {isPassed ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px]">
                        {idx + 1}
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-bold text-slate-900">{step.label}</p>
                  <p className="text-[10px] text-slate-500 leading-tight">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 text-rose-800 text-center space-y-2">
          <h3 className="text-lg font-bold">This Order was Cancelled</h3>
          <p className="text-xs">If you have questions about refunds or cancellation details, please speak to the concierge.</p>
        </div>
      )}

      {/* Order Details & Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Itemized Receipt */}
        <div className="md:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Itemized Food Receipt</h3>

          <div className="divide-y divide-slate-100">
            {order.items.map((item: any) => (
              <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-800 font-bold text-xs flex items-center justify-center shrink-0">
                    {item.quantity}x
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{item.menuItem.name}</h4>
                    <p className="text-[11px] text-slate-400">{formatCurrency(item.unitPrice)} each</p>
                    {item.specialInstructions && (
                      <p className="text-[11px] text-amber-700 italic mt-0.5">
                        "{item.specialInstructions}"
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900">
                  {formatCurrency(item.totalPrice)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Restaurant Tax (8.25%)</span>
              <span className="font-semibold text-slate-900">{formatCurrency(order.tax)}</span>
            </div>
            {order.deliveryFee > 0 && (
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span className="font-semibold text-slate-900">{formatCurrency(order.deliveryFee)}</span>
              </div>
            )}
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Coupon Discount</span>
                <span>-{formatCurrency(order.discount)}</span>
              </div>
            )}
            <div className="pt-3 border-t border-slate-200 flex justify-between text-base font-black text-slate-900">
              <span>Total Paid</span>
              <span className="text-amber-600">{formatCurrency(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Right Col: Logistics & Payment Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4 text-xs">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Service Details</h3>

            <div className="space-y-2.5">
              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Service Type</span>
                <span className="font-bold text-slate-900 uppercase">{order.orderType.replace('_', ' ')}</span>
              </div>

              {order.table && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Seated Table</span>
                  <span className="font-bold text-slate-900">
                    {order.table.tableNumber} ({order.table.location.replace('_', ' ')})
                  </span>
                </div>
              )}

              {order.deliveryAddress && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Delivery Location</span>
                  <span className="font-bold text-slate-900">{order.deliveryAddress}</span>
                </div>
              )}

              <div>
                <span className="text-slate-400 font-semibold block text-[11px]">Placed At</span>
                <span className="font-bold text-slate-900">{formatDateTime(order.createdAt)}</span>
              </div>

              {order.notes && (
                <div>
                  <span className="text-slate-400 font-semibold block text-[11px]">Guest Notes</span>
                  <p className="text-slate-700 italic">"{order.notes}"</p>
                </div>
              )}
            </div>
          </div>

          {order.payment && (
            <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-900 shadow-sm space-y-3 text-xs">
              <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider">Payment Transaction</h3>
              <div className="space-y-1.5 text-slate-300">
                <div className="flex justify-between">
                  <span>Txn Ref:</span>
                  <span className="font-mono text-white font-bold">{order.payment.transactionId}</span>
                </div>
                <div className="flex justify-between">
                  <span>Method:</span>
                  <span className="font-bold text-white">{order.payment.paymentMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold text-emerald-400">{order.payment.status}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
