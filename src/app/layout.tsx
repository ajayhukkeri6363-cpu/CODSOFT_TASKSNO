import type { Metadata } from 'next';
import './globals.css';
import { ToastProvider } from '@/components/ui/Toast';
import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export const metadata: Metadata = {
  title: 'DineDesk — Restaurant Ordering & Table Management Platform',
  description:
    'A premier full-stack restaurant platform with digital menus, online orders, real-time table reservations, payment workflows, and kitchen display systems. Built for CodSoft Internship Task 2.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-slate-50 text-slate-900 antialiased font-sans">
        <ToastProvider>
          <CartProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </CartProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
