import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(date));
}

export function formatTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
}

export function calculateOrderTotals(itemsSubtotal: number, orderType: 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY', discount: number = 0) {
  const taxRate = 0.0825; // 8.25% restaurant tax
  const tax = Number((itemsSubtotal * taxRate).toFixed(2));
  const deliveryFee = orderType === 'DELIVERY' ? 4.99 : 0;
  const total = Number(Math.max(0, itemsSubtotal + tax + deliveryFee - discount).toFixed(2));

  return {
    subtotal: Number(itemsSubtotal.toFixed(2)),
    tax,
    deliveryFee,
    discount,
    total,
  };
}

export function getOrderStatusBadge(status: string) {
  switch (status) {
    case 'PLACED':
      return { label: 'Order Placed', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'CONFIRMED':
      return { label: 'Confirmed', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    case 'PREPARING':
      return { label: 'In Kitchen', color: 'bg-orange-100 text-orange-800 border-orange-300 animate-pulse' };
    case 'READY':
      return { label: 'Ready to Serve', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'COMPLETED':
      return { label: 'Completed', color: 'bg-slate-100 text-slate-800 border-slate-300' };
    case 'CANCELLED':
      return { label: 'Cancelled', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
}

export function getTableStatusBadge(status: string) {
  switch (status) {
    case 'AVAILABLE':
      return { label: 'Available', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
    case 'OCCUPIED':
      return { label: 'Occupied', color: 'bg-rose-100 text-rose-800 border-rose-300' };
    case 'RESERVED':
      return { label: 'Reserved', color: 'bg-amber-100 text-amber-800 border-amber-300' };
    case 'CLEANING':
      return { label: 'Cleaning', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' };
    default:
      return { label: status, color: 'bg-slate-100 text-slate-800 border-slate-300' };
  }
}
