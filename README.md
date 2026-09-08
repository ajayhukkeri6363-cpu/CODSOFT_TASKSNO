# CodSoft Full Stack Web Development Internship

Welcome to my **CodSoft Full Stack Web Development Internship** repository! This repository contains production-ready, full-stack web applications developed as part of the internship curriculum.

---

## 📋 Internship Projects & Tasks Overview

| Task | Project Name | Description | Tech Stack | Status | Directory |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Task 1** | **EduManage** | Comprehensive Student & Academic Administration Management System | Next.js 14, TypeScript, Tailwind CSS, Prisma, PostgreSQL | ✅ **Completed** | [📂 `./Task-1-EduManage`](./Task-1-EduManage) |
| **Task 2** | **DineDesk** | Modern Gourmet Restaurant Ordering, Table Reservation & Kitchen KDS Platform | Next.js 14, TypeScript, Tailwind CSS, Prisma, Neon PostgreSQL | ✅ **Completed** | [📂 `./Task-2-DineDesk`](./Task-2-DineDesk) |
| **Task 3** | *Upcoming Project* | *Will be assigned as per CodSoft Internship schedule* | *TBD* | ⏳ *Pending* | `./Task-3-[ProjectName]` |

---

## 🗂️ Repository Architecture

Each task is structured as a self-contained, independent full-stack Next.js project with its own dependencies, database configuration, scripts, and documentation:

```text
CODSOFT_TASKSNO/
├── Task-1-EduManage/              # Task 1: Student Management System
│   ├── src/
│   │   ├── app/                   # Next.js App Router (Admin, Teacher, Student portals)
│   │   ├── components/            # UI components and layouts
│   │   └── lib/                   # Auth, Prisma client, types, utility helpers
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL relational schema
│   │   └── seed.js                # Seed script with realistic academic records
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Task 1 dependencies & scripts
│   └── README.md                  # Detailed Task 1 documentation
│
├── Task-2-DineDesk/               # Task 2: Restaurant Ordering & Table Management
│   ├── src/
│   │   ├── app/                   # Customer ordering, Kitchen KDS, Admin portals
│   │   ├── components/            # Culinary UI components, modals, widgets
│   │   ├── context/               # CartContext state management
│   │   └── lib/                   # Auth, Prisma client, self-healing DDL & auto-seeding
│   ├── prisma/
│   │   ├── schema.prisma          # PostgreSQL restaurant operations schema
│   │   └── seed.js                # Gourmet culinary seed script
│   ├── .env.example               # Environment variables template
│   ├── package.json               # Task 2 dependencies & scripts
│   └── README.md                  # Detailed Task 2 documentation
│
├── .gitignore                     # Monorepo-wide Git ignore rules
└── README.md                      # Master repository documentation
```

---

## 🚀 Quick Start Guide

### 1. Clone the Repository
```bash
git clone https://github.com/ajayhukkeri6363-cpu/CODSOFT_TASKSNO.git
cd CODSOFT_TASKSNO
```

### 2. Running Task 1: EduManage (Student Management System)
```bash
cd Task-1-EduManage
npm install
cp .env.example .env
# Configure your DATABASE_URL in .env
npx prisma db push
node prisma/seed.js
npm run dev
```
*Access EduManage at `http://localhost:3000`.*

### 3. Running Task 2: DineDesk (Restaurant Ordering Platform)
```bash
cd Task-2-DineDesk
npm install
cp .env.example .env
# Configure your DATABASE_URL in .env
npx prisma db push
node prisma/seed.js
npm run dev
```
*Access DineDesk at `http://localhost:3000`.*

---

## 🌐 Vercel Production Deployment

To deploy any project from this repository on **Vercel**:
1. Import the repository into your Vercel dashboard.
2. In **Project Settings ➔ General ➔ Root Directory**, select the project folder (e.g. `Task-2-DineDesk`).
3. Set the environment variables (`DATABASE_URL`, `JWT_SECRET`) in Vercel.
4. Deploy!

---

## 👨‍💻 Developer Information

* **Intern**: Ajay Hukkeri
* **Internship**: CodSoft Full Stack Web Development Internship
* **Repository**: [github.com/ajayhukkeri6363-cpu/CODSOFT_TASKSNO](https://github.com/ajayhukkeri6363-cpu/CODSOFT_TASKSNO)
