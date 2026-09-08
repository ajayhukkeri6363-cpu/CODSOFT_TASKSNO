'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Clock,
  Printer,
  X,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency, formatDateTime, getOrderStatusBadge } from '@/lib/utils';

export default function AdminOrderLedger() {
  const { success, error } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  // Selected Order for Receipt Modal
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Order status set to ${newStatus}`);
        fetchOrders();
      } else {
        error(data.error || 'Failed to update order');
      }
    } catch {
      error('Error updating order');
    }
  };

  const filtered = orders.filter((o) =>
    search
      ? o.orderNumber.toLowerCase().includes(search.toLowerCase()) ||
        o.customerName.toLowerCase().includes(search.toLowerCase()) ||
        o.customerPhone.includes(search)
      : true
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Order Lifecycle Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-2">
            Master Orders & Kitchen Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit customer orders, check kitchen progression, and inspect itemized invoices.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-xs">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ticket #, guest, or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 font-bold text-slate-700 focus:outline-none"
            >
              <option value="ALL">All Statuses</option>
              <option value="PLACED">PLACED</option>
              <option value="CONFIRMED">CONFIRMED</option>
              <option value="PREPARING">PREPARING</option>
              <option value="READY">READY</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
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
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm animate-pulse h-20" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 p-8 space-y-3">
          <ShoppingBag className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No orders found</h3>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Ticket #</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Channel & Table</th>
                  <th className="py-4 px-6">Dishes</th>
                  <th className="py-4 px-6">Total Amount</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((order) => {
                  const badge = getOrderStatusBadge(order.status);
                  return (
                    <tr key={order.id} className="hover:bg-slate-50/50 transition">
                      <td className="py-4 px-6">
                        <span className="font-mono font-black text-slate-900 block">{order.orderNumber}</span>
                        <span className="text-[11px] text-slate-400">{formatDateTime(order.createdAt)}</span>
                      </td>

                      <td className="py-4 px-6">
                        <p className="font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] text-slate-400">{order.customerPhone}</p>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-700 block uppercase">
                          {order.orderType.replace('_', ' ')}
                        </span>
                        {order.table && (
                          <span className="text-[11px] text-amber-600 font-bold">
                            {order.table.tableNumber}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {order.items.length} items ({order.items.reduce((s: number, i: any) => s + i.quantity, 0)} units)
                      </td>

                      <td className="py-4 px-6 font-black text-slate-900">
                        {formatCurrency(order.total)}
                        {order.payment && (
                          <span className="block text-[10px] text-emerald-600 font-bold">
                            {order.payment.paymentMethod} • {order.payment.status}
                          </span>
                        )}
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={order.status}
                          onChange={(e) => handleUpdateStatus(order.id, e.target.value)}
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none ${badge.color}`}
                        >
                          <option value="PLACED">PLACED</option>
                          <option value="CONFIRMED">CONFIRMED</option>
                          <option value="PREPARING">PREPARING</option>
                          <option value="READY">READY</option>
                          <option value="COMPLETED">COMPLETED</option>
                          <option value="CANCELLED">CANCELLED</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition inline-flex items-center gap-1.5"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Receipt</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Invoice / Receipt Modal */}
      {selectedOrder && (
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title={`Order Receipt — ${selectedOrder.orderNumber}`}
          maxWidth="lg"
        >
          <div className="space-y-6 text-xs">
            <div className="flex justify-between items-start border-b border-slate-100 pb-3">
              <div>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.customerName}</p>
                <p className="text-slate-400">{selectedOrder.customerPhone}</p>
                {selectedOrder.customerEmail && <p className="text-slate-400">{selectedOrder.customerEmail}</p>}
              </div>
              <div className="text-right">
                <span className="font-bold text-amber-600 uppercase text-[11px]">{selectedOrder.orderType.replace('_', ' ')}</span>
                <p className="text-slate-400">{formatDateTime(selectedOrder.createdAt)}</p>
              </div>
            </div>

            {/* Items List */}
            <div className="divide-y divide-slate-100">
              {selectedOrder.items.map((item: any) => (
                <div key={item.id} className="py-2.5 flex justify-between">
                  <div>
                    <span className="font-bold text-slate-900">{item.quantity}x {item.menuItem?.name}</span>
                    {item.specialInstructions && (
                      <p className="text-[10px] text-amber-700 italic">"{item.specialInstructions}"</p>
                    )}
                  </div>
                  <span className="font-black text-slate-900">{formatCurrency(item.totalPrice)}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-1.5 pt-3 border-t border-slate-100 text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>{formatCurrency(selectedOrder.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tax (8.25%):</span>
                <span>{formatCurrency(selectedOrder.tax)}</span>
              </div>
              {selectedOrder.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span>Delivery Fee:</span>
                  <span>{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
              )}
              {selectedOrder.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-{formatCurrency(selectedOrder.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total:</span>
                <span className="text-amber-600">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
