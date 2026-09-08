import React from 'react';
import Link from 'next/link';
import { UtensilsCrossed, Phone, MapPin, Clock, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1: Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20">
                <UtensilsCrossed className="w-5 h-5" />
              </div>
              <span className="text-2xl font-black tracking-tight text-white">
                Dine<span className="text-amber-500">Desk</span>
              </span>
            </div>
            <p className="text-sm leading-relaxed text-slate-400">
              A premier artisanal culinary experience combining farm-to-table cuisine with effortless digital ordering and seamless table reservations.
            </p>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-xl w-fit border border-amber-500/20">
              <Clock className="w-4 h-4" />
              <span>Open Daily: 11:30 AM — 11:00 PM</span>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Explore DineDesk
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/menu" className="hover:text-amber-400 transition">
                  Gourmet Digital Menu
                </Link>
              </li>
              <li>
                <Link href="/reservations" className="hover:text-amber-400 transition">
                  Reserve a Table
                </Link>
              </li>
              <li>
                <Link href="/orders" className="hover:text-amber-400 transition">
                  Track Live Orders
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-amber-400 transition">
                  Shopping Cart & Checkout
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Portals & Operations */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Operations & Portals
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/staff" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                  Kitchen Display System (KDS)
                </Link>
              </li>
              <li>
                <Link href="/staff/tables" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  Floor Plan & Table Manager
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-amber-400 transition flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Admin Analytics & Menu CRUD
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-amber-400 transition">
                  Account Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="space-y-3 text-sm">
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
              Visit & Contact
            </h4>
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
              <span>450 Gourmet Avenue, Suite 100, Boston, MA 02115</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-amber-500 shrink-0" />
              <span>+1 (555) 782-9000 (Concierge)</span>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} DineDesk Restaurant Platform. Built for CodSoft Task 2.</p>
          <p className="flex items-center gap-1">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for exceptional culinary service.
          </p>
        </div>
      </div>
    </footer>
  );
};
