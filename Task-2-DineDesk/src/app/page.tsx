'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  Calendar,
  Clock,
  Sparkles,
  Flame,
  ShieldCheck,
  ArrowRight,
  Star,
  CheckCircle2,
  ChefHat,
  ShoppingBag,
  Percent,
} from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { formatCurrency } from '@/lib/utils';
import { MenuItemWithCategory } from '@/lib/types';

export default function HomePage() {
  const router = useRouter();
  const { success, error } = useToast();
  const [popularItems, setPopularItems] = useState<MenuItemWithCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/menu?isPopular=true')
      .then((res) => (res.ok ? res.json() : { items: [] }))
      .then((data) => {
        setPopularItems(data.items.slice(0, 6));
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, []);

  const handleDemoLaunch = async (role: 'CUSTOMER' | 'STAFF' | 'ADMIN') => {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        success(`Logged in as demo ${role}: ${data.user.name}`);
        router.push(data.redirect);
        router.refresh();
      } else {
        error(data.error || 'Failed to switch demo account');
      }
    } catch {
      error('Error connecting to demo switch service');
    }
  };

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-950 text-white py-24 sm:py-32">
        <div className="absolute inset-0 z-0 opacity-25">
          <img
            src="https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1800&auto=format&fit=crop&q=80"
            alt="Restaurant Interior"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>CodSoft Full Stack Task 2 • DineDesk Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-black tracking-tight leading-tight sm:leading-none text-white">
              Artisanal Cuisine Meets <span className="text-amber-500">Modern Digital Dining.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-300 font-normal leading-relaxed">
              Experience seamless table reservations, interactive digital menus, online ordering for dine-in, takeaway, and delivery, and a real-time kitchen operations hub.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link
                href="/menu"
                className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-lg shadow-amber-500/30 transition flex items-center gap-2 group"
              >
                <UtensilsCrossed className="w-4 h-4" />
                <span>Explore Digital Menu</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/reservations"
                className="px-6 py-3.5 rounded-2xl text-sm font-bold bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-md transition flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-amber-400" />
                <span>Reserve a Table</span>
              </Link>
            </div>

            {/* Quick Feature Badges */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Live Kitchen KDS Display</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Table Collision Prevention</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Real-Time Order Tracking</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 1-Click Demo Showcase Portals */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Interactive Internship Demo
          </span>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">
            Explore All 3 Role Portals in 1 Click
          </h2>
          <p className="text-slate-500 text-sm">
            Launch instantly into any role to test dedicated workflows, permissions, and dashboards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Card 1: Customer Portal */}
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-md hover:shadow-xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Customer Portal</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Browse categories, customize dietary preferences, add dishes to cart, book tables, and track order stages in real time.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Cart & Checkout with coupon discounts</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Interactive table booking with slot checks</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Visual 5-stage order tracker & digital receipts</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLaunch('CUSTOMER')}
              className="mt-8 w-full py-3 px-4 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 hover:bg-amber-600 hover:text-white transition flex items-center justify-center gap-2"
            >
              <span>Launch Customer Demo</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 2: Staff / Kitchen Portal */}
          <div className="bg-white rounded-3xl p-8 border border-orange-200/80 shadow-md hover:shadow-xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Kitchen & Staff KDS</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Live Kitchen Display System (KDS) Kanban board for cooks and floor leads to manage tickets, table occupancy, and reservations.
              </p>
              <ul className="space-y-2 text-xs text-slate-600 pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>1-Click ticket status transitions</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>Floor plan table occupancy live updater</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                  <span>Guest arrival check-in and table seating</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLaunch('STAFF')}
              className="mt-8 w-full py-3 px-4 rounded-xl text-xs font-bold bg-orange-500 text-white hover:bg-orange-600 transition flex items-center justify-center gap-2 shadow-md shadow-orange-500/20"
            >
              <span>Launch Kitchen Staff KDS</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Card 3: Admin Suite */}
          <div className="bg-slate-900 text-white rounded-3xl p-8 border border-slate-800 shadow-md hover:shadow-xl transition flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold border border-amber-500/30">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white">Admin Control Center</h3>
              <p className="text-sm text-slate-300 leading-relaxed">
                Executive dashboard with real-time revenue analytics, complete menu item and category CRUD, table configurations, and customer logs.
              </p>
              <ul className="space-y-2 text-xs text-slate-300 pt-2">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Sales revenue and top dishes Recharts graphs</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Menu item CRUD with live availability toggling</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Master orders, customers, and payments ledger</span>
                </li>
              </ul>
            </div>
            <button
              onClick={() => handleDemoLaunch('ADMIN')}
              className="mt-8 w-full py-3 px-4 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400 transition flex items-center justify-center gap-2 font-black shadow-md shadow-amber-500/30"
            >
              <span>Launch Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </section>

      {/* Chef's Signature Creations Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Chef Alessandro's Highlights
            </span>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mt-2">
              Featured Gourmet Dishes
            </h2>
          </div>
          <Link
            href="/menu"
            className="text-sm font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1.5"
          >
            <span>View Full Menu</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-white rounded-3xl p-4 border border-slate-100 shadow-sm animate-pulse space-y-4">
                <div className="w-full h-48 bg-slate-200 rounded-2xl" />
                <div className="h-5 bg-slate-200 rounded w-3/4" />
                <div className="h-4 bg-slate-100 rounded w-full" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {popularItems.map((dish) => (
              <div
                key={dish.id}
                className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-56 w-full overflow-hidden bg-slate-100">
                    <img
                      src={dish.image}
                      alt={dish.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-950/80 text-white backdrop-blur-md">
                        {dish.category.name}
                      </span>
                      {dish.isVeg && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white">
                          VEG
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 right-3 bg-white/95 px-3 py-1 rounded-xl text-sm font-black text-slate-900 shadow-md backdrop-blur-md">
                      {formatCurrency(dish.price)}
                    </div>
                  </div>

                  <div className="p-6 space-y-2">
                    <div className="flex items-center gap-1 text-amber-500 text-xs">
                      <Star className="w-3.5 h-3.5 fill-amber-500" />
                      <span className="font-bold text-slate-700">4.9</span>
                      <span className="text-slate-400">• {dish.prepTimeMinutes} mins prep</span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-600 transition">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                      {dish.description}
                    </p>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link
                    href={`/menu?category=${dish.category.slug}`}
                    className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-slate-50 hover:bg-amber-50 hover:text-amber-700 text-slate-700 border border-slate-200/80 transition flex items-center justify-center gap-2"
                  >
                    <span>Order in Digital Menu</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Special Offer Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-orange-500 rounded-3xl p-8 sm:p-12 text-slate-950 shadow-xl flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-1.5 bg-slate-950 text-amber-400 text-xs font-bold px-3 py-1 rounded-full">
              <Percent className="w-3.5 h-3.5" />
              <span>Limited Time Welcome Offer</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
              Enjoy 10% Off Your First Order with Code <span className="underline decoration-slate-950 font-black">DINE10</span>
            </h2>
            <p className="text-sm font-medium text-slate-900/80">
              Apply code at checkout or use <span className="font-bold">TASTY20</span> for 20% off orders over $50.
            </p>
          </div>
          <Link
            href="/menu"
            className="px-8 py-4 rounded-2xl text-sm font-black bg-slate-950 text-white hover:bg-slate-900 transition shadow-xl shrink-0 flex items-center gap-2"
          >
            <span>Claim Discount Now</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
