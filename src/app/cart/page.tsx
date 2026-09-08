'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  UtensilsCrossed,
  Truck,
  ShoppingBasket,
  Tag,
  CreditCard,
  DollarSign,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Info,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { OrderType, PaymentMethod } from '@/lib/types';

interface TableOption {
  id: string;
  tableNumber: string;
  capacity: number;
  location: string;
  status: string;
}

export default function CartPage() {
  const router = useRouter();
  const {
    items,
    orderType,
    tableId,
    tableName,
    couponCode,
    discount,
    subtotal,
    tax,
    deliveryFee,
    total,
    itemCount,
    updateQuantity,
    removeItem,
    clearCart,
    setOrderType,
    setTable,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const { success, error } = useToast();

  const [tables, setTables] = useState<TableOption[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CARD');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Autofill user details if logged in
  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : { user: null }))
      .then((data) => {
        if (data.user) {
          setCustomerName(data.user.name || '');
          setCustomerEmail(data.user.email || '');
          setCustomerPhone(data.user.phone || '');
        }
      })
      .catch(() => null);

    // Fetch tables for dine-in selection
    fetch('/api/tables')
      .then((r) => (r.ok ? r.json() : { tables: [] }))
      .then((data) => setTables(data.tables))
      .catch(() => setTables([]));
  }, []);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      success(res.message);
      setCouponInput('');
    } else {
      error(res.message);
    }
  };

  const handlePlaceOrder = async () => {
    if (items.length === 0) {
      error('Your cart is empty!');
      return;
    }

    if (!customerName || !customerPhone) {
      error('Please provide your name and phone number for the order.');
      return;
    }

    if (orderType === 'DINE_IN' && !tableId) {
      error('Please select a dining table for your Dine-in order.');
      return;
    }

    if (orderType === 'DELIVERY' && !deliveryAddress) {
      error('Please provide a delivery address for your order.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          orderType,
          tableId: orderType === 'DINE_IN' ? tableId : undefined,
          customerName,
          customerPhone,
          customerEmail,
          deliveryAddress: orderType === 'DELIVERY' ? deliveryAddress : undefined,
          notes: orderNotes,
          couponCode: couponCode || undefined,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        success('Order placed successfully! Kitchen has received your ticket.');
        clearCart();
        router.push(`/orders/${data.order.orderNumber}`);
      } else {
        error(data.error || 'Failed to place order.');
      }
    } catch {
      error('An error occurred while submitting your order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Your Cart is Empty</h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          Explore our artisanal culinary menu to discover stone-oven pizzas, handcrafted pastas, and chef specials.
        </p>
        <Link
          href="/menu"
          className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-md transition"
        >
          <UtensilsCrossed className="w-4 h-4" />
          <span>Browse Digital Menu</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Shopping Cart & Checkout</h1>
          <p className="text-xs text-slate-500 mt-0.5">{itemCount} items in your order ticket</p>
        </div>
        <Link
          href="/menu"
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Add More Dishes</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Order Items & Configuration */}
        <div className="lg:col-span-7 space-y-6">
          {/* Order Type Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">1. Select Dining Option</h3>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setOrderType('DINE_IN')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  orderType === 'DINE_IN'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <UtensilsCrossed className="w-5 h-5" />
                <span className="text-xs">Dine-In</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('TAKEAWAY')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  orderType === 'TAKEAWAY'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <ShoppingBasket className="w-5 h-5" />
                <span className="text-xs">Takeaway</span>
              </button>
              <button
                type="button"
                onClick={() => setOrderType('DELIVERY')}
                className={`p-3.5 rounded-2xl border text-center transition flex flex-col items-center gap-1.5 ${
                  orderType === 'DELIVERY'
                    ? 'bg-amber-500 text-slate-950 border-amber-500 shadow-sm font-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 font-semibold'
                }`}
              >
                <Truck className="w-5 h-5" />
                <span className="text-xs">Delivery (+$4.99)</span>
              </button>
            </div>

            {/* If Dine-in, Table Picker */}
            {orderType === 'DINE_IN' && (
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-700">Select Table Number</label>
                <select
                  value={tableId}
                  onChange={(e) => {
                    const t = tables.find((tbl) => tbl.id === e.target.value);
                    if (t) setTable(t.id, t.tableNumber);
                    else setTable('', '');
                  }}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-amber-500 font-semibold"
                >
                  <option value="">-- Choose Your Table in Restaurant --</option>
                  {tables.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.tableNumber} • {t.capacity} seats ({t.location.replace('_', ' ')}) - {t.status}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* If Delivery, Address Input */}
            {orderType === 'DELIVERY' && (
              <div className="pt-2 space-y-2">
                <label className="text-xs font-bold text-slate-700">Delivery Address</label>
                <input
                  type="text"
                  placeholder="Street address, apartment, suite, unit..."
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}
          </div>

          {/* Cart Items List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">2. Review Ordered Dishes</h3>
            <div className="divide-y divide-slate-100">
              {items.map((item) => (
                <div key={item.menuItemId} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 rounded-2xl object-cover bg-slate-100 shrink-0"
                    />
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                      <p className="text-xs text-slate-400 font-medium">{formatCurrency(item.price)} each</p>
                      {item.specialInstructions && (
                        <p className="text-[11px] text-amber-700 italic mt-0.5">
                          Note: "{item.specialInstructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Stepper */}
                    <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-800 shadow-sm flex items-center justify-center font-bold hover:bg-slate-200 transition text-xs"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="text-xs font-bold text-slate-900 px-1">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                        className="w-6 h-6 rounded-lg bg-white text-slate-800 shadow-sm flex items-center justify-center font-bold hover:bg-slate-200 transition text-xs"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="text-sm font-black text-slate-900 w-16 text-right">
                      {formatCurrency(item.price * item.quantity)}
                    </span>

                    <button
                      onClick={() => removeItem(item.menuItemId)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                      title="Remove item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Details Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">3. Guest Information</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sophia Miller"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Phone Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +1 (555) 912-3456"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Email Address (for receipt)</label>
                <input
                  type="email"
                  placeholder="e.g. sophia.miller@example.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-bold text-slate-700">Kitchen & Service Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Please bring extra napkins, allergy notice..."
                  value={orderNotes}
                  onChange={(e) => setOrderNotes(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Bill Summary, Promo & Payment */}
        <div className="lg:col-span-5 space-y-6">
          {/* Coupon Input */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-amber-600" />
              <span>Promo Code / Voucher</span>
            </h3>

            {couponCode ? (
              <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 text-emerald-800 px-3.5 py-2 rounded-xl text-xs font-bold">
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Coupon {couponCode} Active (-{formatCurrency(discount)})</span>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-rose-600 hover:text-rose-800 text-[11px] underline"
                >
                  Remove
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Try 'DINE10' or 'TASTY20'"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 uppercase"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Apply
                </button>
              </form>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Payment Method
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('CARD')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                  paymentMethod === 'CARD'
                    ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Credit / Debit Card</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('CASH')}
                className={`p-3 rounded-2xl border text-left text-xs font-bold transition flex items-center gap-2 ${
                  paymentMethod === 'CASH'
                    ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Pay at Counter / COD</span>
              </button>
            </div>
          </div>

          {/* Bill Summary Card */}
          <div className="bg-slate-950 text-white rounded-3xl p-6 border border-slate-900 shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Order Calculation
            </h3>

            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Dishes Subtotal</span>
                <span className="font-semibold text-white">{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Restaurant Tax (8.25%)</span>
                <span className="font-semibold text-white">{formatCurrency(tax)}</span>
              </div>

              {orderType === 'DELIVERY' && (
                <div className="flex justify-between">
                  <span>Delivery Express Fee</span>
                  <span className="font-semibold text-white">{formatCurrency(deliveryFee)}</span>
                </div>
              )}

              {discount > 0 && (
                <div className="flex justify-between text-emerald-400 font-bold">
                  <span>Special Promo Discount</span>
                  <span>-{formatCurrency(discount)}</span>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-400 block">Total Due</span>
                <span className="text-2xl font-black text-amber-400">{formatCurrency(total)}</span>
              </div>
              <span className="text-[11px] text-slate-400 uppercase tracking-widest font-bold">
                {orderType.replace('_', ' ')}
              </span>
            </div>

            <button
              type="button"
              onClick={handlePlaceOrder}
              disabled={isSubmitting}
              className="w-full py-4 rounded-2xl text-sm font-black bg-amber-500 hover:bg-amber-400 text-slate-950 transition shadow-lg shadow-amber-500/30 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isSubmitting ? 'Sending to Kitchen...' : `Place Order • ${formatCurrency(total)}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
