# 🍽️ DineDesk — Restaurant Ordering & Table Management Platform

[![CodSoft Internship](https://img.shields.io/badge/CodSoft-Full_Stack_Web_Development-blue.svg)](https://www.codsoft.in)
[![Task](https://img.shields.io/badge/Task-Task_2_Restaurant_Ordering_Platform-orange.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6.svg)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-PostgreSQL_%2F_SQLite-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Gourmet_UI-38B2AC.svg)](https://tailwindcss.com/)

**DineDesk** is a modern, full-stack restaurant ordering, table management, and kitchen operations platform built for high-end dining and delivery. It connects **Customers**, **Kitchen Staff**, and **Restaurant Administrators** into a unified real-time workflow.

Built as part of the **CodSoft Full Stack Web Development Internship (Task 2)**.

---

## 🌟 Comprehensive Features by Role

### 🍕 1. Customer Portal (`/`, `/menu`, `/cart`, `/reservations`, `/orders`)
- **Gourmet Digital Menu**: Categorized dish catalog (*Artisanal Starters, Stone-Oven Pizzas, Handcrafted Pastas, Prime Grill, Decadent Desserts, Signature Beverages*).
- **Interactive Search & Dietary Filters**: Real-time filters for Vegetarian (`VEG`), Gluten-Free (`GF`), Spicy (`SPICY`), and Chef's Pick (`POPULAR`).
- **Dish Detail Modal**: Deep dive into culinary preparation, complete ingredient lists, allergen notices, calorie counts, and special cooking instructions.
- **Dynamic Cart & Checkout**:
  - Service selection: **Dine-In** (with live table picker), **Takeaway** (counter pickup), or **Delivery** (address input).
  - Quantity steppers and special cooking instructions.
  - Promo code discounts (`DINE10` for 10% off, `TASTY20` for 20% off).
  - Automatic computation of subtotal, restaurant tax ($8.25\%$), delivery fee, and grand total.
- **Table Reservation Engine**: Select date, time slot, party size (1–12 guests), and seating zone (*Main Hall, Window View, Garden Patio, VIP Lounge, Rooftop*) with real-time double-booking prevention.
- **Live Order Tracking (`/orders/[id]`)**: 5-stage visual progress tracker (`PLACED` ➔ `CONFIRMED` ➔ `PREPARING` ➔ `READY` ➔ `COMPLETED`) with estimated prep timers and printable receipts.
- **Customer Profile & History**: View past orders, reorder dishes in 1 click, and track lifetime culinary rewards.

---

### 🍳 2. Kitchen & Staff Portal (`/staff`, `/staff/tables`, `/staff/reservations`)
- **Kitchen Display System (KDS)**: Live 3-column Kanban board for incoming tickets (`PLACED`), cooking queue (`PREPARING`), and plating pass (`READY`).
- **1-Click Stage Transitions**: Instantly accept tickets, move to cooking, mark food ready, and dispatch completed orders.
- **Dining Room Floor Plan (`/staff/tables`)**: Visual table map with live occupancy indicators (`AVAILABLE`, `OCCUPIED`, `RESERVED`, `CLEANING`) and 1-click state toggles.
- **Hostess & Maître D' Stand (`/staff/reservations`)**: View scheduled parties for today, check in arriving diners, seat guests at tables, and manage cancellations.

---

### 📊 3. Administrator Control Center (`/admin`, `/admin/menu`, `/admin/categories`, `/admin/tables`, `/admin/orders`, `/admin/customers`, `/admin/payments`)
- **Executive Analytics Dashboard**: Gross sales revenue, today's sales, average check size, table occupancy percentage, top-selling dishes by volume, and channel breakdown via interactive **Recharts** visualizations.
- **Menu Management CRUD**: Create, edit, and delete dishes, adjust pricing, upload imagery, and toggle live **Available / Sold Out** status.
- **Menu Category Manager**: Reorder courses, update descriptions, and manage culinary taxonomy.
- **Floor Architecture & Tables**: Configure restaurant tables, guest capacities, and floor zones.
- **Master Reservation Ledger**: Audit all table bookings, filter by status and date, and manage VIP allocations.
- **Master Order Ledger**: Real-time log of all customer orders across channels with itemized receipt inspector modal.
- **Customer Directory**: Guest relationship management tracking lifetime spend, visit frequency, and loyalty activity.
- **Financial Payment Ledger**: Transaction settlement logs with payment methods (`CARD`, `CASH`, `ONLINE`, `UPI`) and transaction IDs.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Full-Stack Framework**: [Next.js 14](https://nextjs.org/) (App Router, Server Components, Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict End-to-End Type Safety)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) with PostgreSQL & SQLite compatibility
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), and [Recharts](https://recharts.org/)
- **Authentication & Security**:
  - Secure JWT session cookie authentication with `bcryptjs` password hashing
  - Next.js Edge Middleware route guards enforcing Role-Based Access Control (`CUSTOMER`, `STAFF`, `ADMIN`)
  - Server-side price and order validation to prevent tampering

---

## 🗄️ Relational Database Schema

```mermaid
erDiagram
    USER ||--o{ ORDER : "places"
    USER ||--o{ RESERVATION : "books"
    MENU_CATEGORY ||--o{ MENU_ITEM : "contains"
    RESTAURANT_TABLE ||--o{ RESERVATION : "assigned to"
    RESTAURANT_TABLE ||--o{ ORDER : "seated at"
    ORDER ||--o{ ORDER_ITEM : "includes"
    MENU_ITEM ||--o{ ORDER_ITEM : "ordered as"
    ORDER ||--o| PAYMENT : "settled with"
```

---

## 🔄 Order Lifecycle Progression

```mermaid
graph LR
    P[PLACED] -->|Kitchen Accepts| C[CONFIRMED]
    C -->|Chef Starts Cooking| PR[PREPARING]
    PR -->|Plated on Pass| R[READY]
    R -->|Served / Delivered| CP[COMPLETED]
    P -->|Rejected / Cancelled| CN[CANCELLED]
```

---

## 🔑 Pre-Seeded Demo Credentials

Use the credentials below or click the **1-Click Demo Switcher** in the top navigation bar:

| Role | Email | Password | Access Portal |
| :--- | :--- | :--- | :--- |
| **Admin / General Manager** | `admin@dinedesk.com` | `admin123` | Full control center, analytics, menu CRUD (`/admin`) |
| **Kitchen Staff / Head Chef** | `chef.marco@dinedesk.com` | `staff123` | Kitchen KDS, table floor plan, guest check-in (`/staff`) |
| **Floor Lead** | `waiter.lucas@dinedesk.com` | `staff123` | Table seating and reservation reception (`/staff`) |
| **Customer (Sophia Miller)** | `sophia.miller@example.com` | `customer123` | Digital menu, cart, reservations, tracking (`/menu`) |
| **Customer (Ethan Hunt)** | `ethan.hunt@example.com` | `customer123` | Customer portal and order history (`/orders`) |

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17.0 or higher)
- npm or pnpm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/ajayh/CODSOFT_TASKSNO.git
cd CODSOFT_TASKSNO
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Copy the environment template:
```bash
cp .env.example .env
```
*(Default SQLite `DATABASE_URL="file:./dev.db"` is pre-configured for zero-setup local running).*

### 4. Database Setup & Seed
Run Prisma migration and populate complete gourmet seed data:
```bash
npm run db:setup
```
*Or run individually:*
```bash
npx prisma db push
node prisma/seed.js
```

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Automated QA Tests
```bash
npm test
```

---

## 🌐 Deploying to Vercel & Production PostgreSQL

DineDesk is fully optimized for **Vercel** and managed cloud PostgreSQL databases (such as [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)).

1. Provision a free PostgreSQL database on [Neon](https://neon.tech) or [Supabase](https://supabase.com).
2. Set `provider = "postgresql"` in `prisma/schema.prisma`.
3. Push schema and seed remotely:
   ```bash
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require" npx prisma db push
   DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require" node prisma/seed.js
   ```
4. In the **Vercel Dashboard**, add environment variables:
   - `DATABASE_URL` = `<Your PostgreSQL connection string>`
   - `JWT_SECRET` = `<A random 32+ character string>`
5. Deploy repository.

---

## 📂 Project Structure

```
CODSOFT_TASKSNO/
├── prisma/
│   ├── schema.prisma          # Relational database models (8 models)
│   └── seed.js                # Gourmet seed data (Users, Categories, Dishes, Tables, Orders)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with CartProvider & ToastProvider
│   │   ├── page.tsx           # Marketing landing page with 1-click demo launches
│   │   ├── menu/page.tsx      # Gourmet digital menu with category tabs & dietary filters
│   │   ├── cart/page.tsx      # Cart & checkout (Dine-in, Takeaway, Delivery + coupons)
│   │   ├── reservations/      # Table reservation engine with collision checks
│   │   ├── orders/            # Order history and live 5-stage tracker (/orders/[id])
│   │   ├── profile/page.tsx   # Customer profile & lifetime spend metrics
│   │   ├── login/page.tsx     # Sign in with demo account autofill pills
│   │   ├── register/page.tsx  # Customer registration
│   │   ├── staff/             # Kitchen Display System (KDS), Table Occupancy, Guest Check-In
│   │   ├── admin/             # Executive analytics, Menu CRUD, Tables, Orders, Payments
│   │   └── api/               # 18 RESTful API routes with JWT auth & RBAC
│   ├── components/            # Reusable UI widgets (Header, Footer, Sidebar, Modals, StatsCard, Toast)
│   ├── context/               # CartContext for client state and coupon calculations
│   ├── lib/                   # Auth helpers, Prisma singleton, TypeScript types, utilities
│   └── middleware.ts          # Edge Middleware for Role-Based Access Control
├── .env.example               # Environment variables template
├── .gitignore                 # Standard Next.js/Prisma exclusion rules
├── package.json
├── test-suite.js              # Automated integration test runner (30 test cases)
└── README.md
```

---

## 🔒 Security Compliance

- **No Exposed Secrets**: All connection strings and private keys are managed via environment variables.
- **Hashed Passwords**: Passwords encrypted using `bcryptjs` with 10 salt rounds.
- **Edge RBAC Guards**: Next.js Edge Middleware prevents unauthorized cross-role access.
- **Order Price Integrity**: Server-side price calculation prevents client-side price tampering.
- **Clean Git Repository**: `.env`, build artifacts, and database binaries are strictly ignored in `.gitignore`.

---

## 🔮 Future Improvements

- **Real-Time WebSockets**: Instant push notifications to kitchen KDS tickets without polling.
- **QR Code Table Ordering**: Scan table QR code to automatically bind dining session to table number.
- **Stripe & Apple Pay Integration**: Full direct gateway processing for live credit cards.
- **SMS Order Updates**: Twilio integration for automated text notifications on order preparation.

---

## 📄 License & Attribution

Developed for the **CodSoft Full Stack Web Development Internship (Task 2)** by **Ajay**.  
All rights reserved.
