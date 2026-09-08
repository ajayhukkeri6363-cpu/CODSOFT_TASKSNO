'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Clock,
  User,
  LogOut,
  ChevronDown,
  Sparkles,
  ShieldAlert,
  Flame,
  Menu as MenuIcon,
  X,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { UserSessionPayload } from '@/lib/types';
import { useToast } from '../ui/Toast';

export const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { itemCount } = useCart();
  const { success, error } = useToast();

  const [user, setUser] = useState<UserSessionPayload | null>(null);
  const [isDemoDropdownOpen, setIsDemoDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
    success('Logged out successfully');
    router.push('/login');
    router.refresh();
  };

  const handleDemoSwitch = async (role: 'ADMIN' | 'STAFF' | 'CUSTOMER') => {
    try {
      const res = await fetch('/api/auth/demo-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (res.ok) {
        setUser(data.user);
        setIsDemoDropdownOpen(false);
        success(`Switched to demo ${role} (${data.user.name})`);
        router.push(data.redirect);
        router.refresh();
      } else {
        error(data.error || 'Failed to switch demo account');
      }
    } catch {
      error('Error switching demo account');
    }
  };

  const navLinks = [
    { href: '/menu', label: 'Digital Menu', icon: UtensilsCrossed },
    { href: '/reservations', label: 'Book Table', icon: Calendar },
    { href: '/orders', label: 'My Orders', icon: Clock },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-white shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-6 h-6" />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-slate-900 flex items-center gap-1">
                Dine<span className="text-amber-600">Desk</span>
              </span>
              <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase block -mt-1">
                Gourmet Dining & Bar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition ${
                    isActive
                      ? 'bg-amber-50 text-amber-700 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                  {link.label}
                </Link>
              );
            })}

            {/* Role Shortcuts */}
            {user?.role === 'STAFF' && (
              <Link
                href="/staff"
                className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-xl text-xs font-bold bg-orange-100 text-orange-800 hover:bg-orange-200 transition"
              >
                <Flame className="w-3.5 h-3.5" />
                Kitchen Display
              </Link>
            )}

            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 ml-2 rounded-xl text-xs font-bold bg-slate-900 text-amber-400 hover:bg-slate-800 transition"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Admin Suite
              </Link>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            {/* 1-Click Demo Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsDemoDropdownOpen(!isDemoDropdownOpen)}
                className="hidden lg:flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition border border-slate-200"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                <span>Demo Switcher</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isDemoDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Instant Demo Switch
                  </div>
                  <button
                    onClick={() => handleDemoSwitch('CUSTOMER')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-amber-50 hover:text-amber-700 flex items-center justify-between"
                  >
                    <span>Customer (Sophia Miller)</span>
                    <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded font-bold">Menu</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('STAFF')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 flex items-center justify-between"
                  >
                    <span>Staff (Chef Marco)</span>
                    <span className="text-[10px] bg-orange-100 text-orange-800 px-1.5 py-0.5 rounded font-bold">KDS</span>
                  </button>
                  <button
                    onClick={() => handleDemoSwitch('ADMIN')}
                    className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 flex items-center justify-between"
                  >
                    <span>Admin (Chef Alessandro)</span>
                    <span className="text-[10px] bg-slate-900 text-amber-400 px-1.5 py-0.5 rounded font-bold">Admin</span>
                  </button>
                </div>
              )}
            </div>

            {/* Cart Icon Button */}
            <Link
              href="/cart"
              className="relative p-2.5 text-slate-700 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition flex items-center gap-2"
              title="View Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse">
                  {itemCount}
                </span>
              )}
            </Link>

            {/* User Profile / Auth State */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 pl-2 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100 rounded-xl border border-slate-200 transition"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                    alt={user.name}
                    className="w-7 h-7 rounded-lg object-cover"
                  />
                  <div className="text-left hidden sm:block">
                    <p className="text-xs font-bold text-slate-800 leading-none">{user.name.split(' ')[0]}</p>
                    <span className="text-[10px] font-semibold text-amber-600 uppercase">{user.role}</span>
                  </div>
                  <ChevronDown className="w-3 h-3 text-slate-400" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-slide-up">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>
                    {user.role === 'ADMIN' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <ShieldAlert className="w-4 h-4 text-slate-500" />
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'STAFF' && (
                      <Link
                        href="/staff"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Flame className="w-4 h-4 text-orange-500" />
                        Kitchen Display
                      </Link>
                    )}
                    <Link
                      href="/orders"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Clock className="w-4 h-4 text-slate-500" />
                      Order History
                    </Link>
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <User className="w-4 h-4 text-slate-500" />
                      My Profile
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 border-t border-slate-100 mt-1"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-block px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl transition shadow-sm shadow-amber-500/20"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition ${
                  isActive ? 'bg-amber-50 text-amber-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5 text-amber-600" />
                {link.label}
              </Link>
            );
          })}
          {user?.role === 'STAFF' && (
            <Link
              href="/staff"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-orange-50 text-orange-800"
            >
              <Flame className="w-5 h-5 text-orange-600" />
              Kitchen Display
            </Link>
          )}
          {user?.role === 'ADMIN' && (
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold bg-slate-900 text-amber-400"
            >
              <ShieldAlert className="w-5 h-5 text-amber-400" />
              Admin Control Center
            </Link>
          )}
        </div>
      )}
    </header>
  );
};
