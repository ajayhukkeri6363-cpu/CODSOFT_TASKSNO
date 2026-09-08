'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  UtensilsCrossed,
  FolderTree,
  LayoutGrid,
  CalendarCheck,
  ShoppingBag,
  Users,
  CreditCard,
  Flame,
  ArrowLeft,
} from 'lucide-react';

interface SidebarProps {
  role: 'ADMIN' | 'STAFF';
}

export const Sidebar: React.FC<SidebarProps> = ({ role }) => {
  const pathname = usePathname();

  const adminLinks = [
    { href: '/admin', label: 'Dashboard & Analytics', icon: BarChart3 },
    { href: '/admin/menu', label: 'Menu Management', icon: UtensilsCrossed },
    { href: '/admin/categories', label: 'Categories', icon: FolderTree },
    { href: '/admin/tables', label: 'Floor & Tables', icon: LayoutGrid },
    { href: '/admin/reservations', label: 'Reservations', icon: CalendarCheck },
    { href: '/admin/orders', label: 'Master Orders', icon: ShoppingBag },
    { href: '/admin/customers', label: 'Customer Directory', icon: Users },
    { href: '/admin/payments', label: 'Payment Ledger', icon: CreditCard },
  ];

  const staffLinks = [
    { href: '/staff', label: 'Kitchen Display (KDS)', icon: Flame },
    { href: '/staff/tables', label: 'Table Occupancy', icon: LayoutGrid },
    { href: '/staff/reservations', label: 'Guest Check-In', icon: CalendarCheck },
  ];

  const links = role === 'ADMIN' ? adminLinks : staffLinks;

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-[calc(100vh-5rem)] p-4 flex flex-col justify-between border-r border-slate-800">
      <div className="space-y-6">
        {/* Role Banner */}
        <div className="px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Control Panel</p>
            <p className="text-sm font-black text-amber-400">{role === 'ADMIN' ? 'Admin Suite' : 'Kitchen & Staff'}</p>
          </div>
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        {/* Nav Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-black'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Back to Customer Menu */}
      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/menu"
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-amber-400 hover:bg-slate-800/60 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Restaurant</span>
        </Link>
      </div>
    </aside>
  );
};
