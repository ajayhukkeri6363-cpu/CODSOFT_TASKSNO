# 🎓 EduManage — Student Management System

[![CodSoft Internship](https://img.shields.io/badge/CodSoft-Full_Stack_Web_Development-blue.svg)](https://www.codsoft.in)
[![Task](https://img.shields.io/badge/Task-Task_1_Student_Management_System-indigo.svg)](#)
[![Next.js](https://img.shields.io/badge/Next.js-14_App_Router-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict_Mode-3178C6.svg)](https://www.typescriptlang.org/)
[![Prisma ORM](https://img.shields.io/badge/Prisma-Relational_ORM-2D3748.svg)](https://www.prisma.io/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-Modern_UI-38B2AC.svg)](https://tailwindcss.com/)

**EduManage** is a professional, modern, fully functional full-stack education management platform designed to digitize academic administration. It provides dedicated, role-protected portals for **Administrators**, **Teachers**, and **Students** with complete CRUD operations, attendance tracking, examination gradebooks, fee billing, and cumulative academic transcripts.

Built as part of the **CodSoft Full Stack Web Development Internship (Task 1)**.

---

## 🌟 Comprehensive Features by Role

### 👑 1. Administrator Portal (`/admin`)
- **Institution Analytics**: Real-time KPI summary (Total Students, Teachers, Classes, Attendance Rate %, Fees Invoiced vs Collected) with interactive Recharts trends and grade distributions.
- **Student Management (CRUD)**: Enroll students, assign roll/admission numbers, edit profiles, delete with cascading safety, filter by class/gender, and view comprehensive 360° student records.
- **Faculty Directory (CRUD)**: Manage teachers, assign qualifications, departments, and subject curriculums.
- **Classes & Cohorts**: Configure grade levels, room numbers, student capacities, and assign dedicated Class Teachers.
- **Smart Attendance Manager**: Roll call interface with date pickers, batch 1-click *"Mark All Present"* or *"Mark All Absent"*, and attendance percentage indicators.
- **Examinations & Terms**: Schedule midterm and final examination sessions across academic terms.
- **Gradebook & Scorecards**: Input marks out of 100, auto-calculate letter grades ($A+, A, B, C, D, F$) and percentages in real time.
- **Fee Billing & Invoicing**: Generate tuition vouchers, track partial/overdue/paid balances, and record payments with receipts.
- **Academic Transcripts & GPA**: Calculate cumulative GPAs, rank students, and manage promotion statuses ($PROMOTED, DETAINED$).

### 👨‍🏫 2. Teacher / Faculty Portal (`/teacher`)
- **Faculty Dashboard**: Overview of assigned classes, total students, and quick action shortcuts.
- **Class Rosters**: View enrolled learners in assigned classes with parent contact numbers.
- **Attendance Marking**: Take daily attendance for assigned cohorts with status toggles and excuse notes.
- **Gradebook Entry**: Record exam marks for taught subjects with instant auto-grading.

### 🎓 3. Student Portal (`/student`)
- **Personal Dashboard**: Attendance rate gauge, cumulative GPA, fee dues alert, and announcements.
- **Student 360° Profile**: Personal bio, parent guardian contacts, class teacher, and admission details.
- **Attendance Calendar**: Breakdown of attended sessions, excused leaves, and historical presence logs.
- **Examination Report Cards**: Digital scorecards with subject marks, letter grades, and faculty feedback.
- **Fee Invoices & Payments**: View fee dues, download invoice vouchers, and simulate online payments.
- **Academic Overview**: Enrolled curriculum subjects, course syllabus codes, and term GPA transcripts.

---

## 🛠️ Tech Stack & Architecture

- **Frontend & Backend Framework**: [Next.js 14](https://nextjs.org/) (App Router, React, Server Components, Route Handlers)
- **Language**: [TypeScript](https://www.typescriptlang.org/) (Strict End-to-End Type Safety)
- **Database & ORM**: [Prisma ORM](https://www.prisma.io/) (Configured with SQLite for instant zero-config evaluation; fully compatible with PostgreSQL)
- **Styling & UI**: [Tailwind CSS](https://tailwindcss.com/), [Lucide React Icons](https://lucide.dev/), and [Recharts](https://recharts.org/)
- **Authentication & Security**:
  - Secure JWT session cookie authentication with bcrypt password hashing
  - Next.js Edge Middleware route guards enforcing Role-Based Access Control (RBAC)
  - Strict input validation and sanitization

---

## 🗄️ Relational Database Architecture

```mermaid
erDiagram
    USER ||--o| TEACHER : "has profile"
    USER ||--o| STUDENT : "has profile"
    USER ||--o{ ANNOUNCEMENT : "authors"
    TEACHER ||--o{ CLASS : "manages as class teacher"
    TEACHER ||--o{ SUBJECT : "teaches"
    CLASS ||--o{ STUDENT : "enrolled in"
    CLASS ||--o{ SUBJECT : "curriculum"
    CLASS ||--o{ ATTENDANCE : "recorded for"
    STUDENT ||--o{ ATTENDANCE : "attendance logs"
    STUDENT ||--o{ RESULT : "exam scores"
    STUDENT ||--o{ FEE : "invoices"
    STUDENT ||--o{ ACADEMIC_RECORD : "transcripts"
    EXAMINATION ||--o{ RESULT : "grades"
    SUBJECT ||--o{ RESULT : "scored under"
```

---

## 🔑 Pre-Seeded Demo Credentials

For quick evaluation, use the credentials below or click any of the **Instant 1-Click Demo Buttons** on the landing page or top navbar:

| Role | Email | Password | Access Level |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@edumanage.com` | `admin123` | Full institutional CRUD & configuration |
| **Teacher** | `sarah.jenkins@edumanage.com` | `teacher123` | Class rosters, attendance & grading |
| **Teacher** | `robert.vance@edumanage.com` | `teacher123` | Humanities subjects & classes |
| **Teacher** | `david.chen@edumanage.com` | `teacher123` | Physical sciences & labs |
| **Student** | `alex.morgan@edumanage.com` | `student123` | Grade 10-A student profile & scores |
| **Student** | `emma.watson@edumanage.com` | `student123` | Top-ranking student profile |
| **Student** | `liam.smith@edumanage.com` | `student123` | Student with overdue fee record |

---

## 🚀 Installation & Local Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.17.0 or higher)
- npm or yarn or pnpm

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
Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```
*(A default SQLite `DATABASE_URL="file:./dev.db"` is pre-configured for zero-setup running).*

### 4. Database Setup & Seed
Run Prisma database sync and populate with realistic sample data:
```bash
npm run db:setup
```
*Or execute individually:*
```bash
npm run prisma:migrate
npm run prisma:seed
```

### 5. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Run Automated QA Tests
```bash
npm test
```

---

## 📂 Project Structure

```
CODSOFT_TASKSNO/
├── prisma/
│   ├── schema.prisma          # Complete relational database models
│   └── seed.js                # Realistic seed script (Users, Classes, Exams, Fees)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with ToastProvider
│   │   ├── page.tsx           # Marketing landing page with 1-click demo logins
│   │   ├── login/page.tsx     # Role-based login page with autofill helpers
│   │   ├── admin/             # Admin Portal (Dashboard + 8 Management pages)
│   │   │   ├── page.tsx       # Institutional KPI & analytics charts
│   │   │   ├── students/      # Student CRUD & 360° Profile view
│   │   │   ├── teachers/      # Faculty CRUD & subject allocations
│   │   │   ├── classes/       # Class cohorts & curriculum manager
│   │   │   ├── attendance/    # Institution-wide roll call attendance
│   │   │   ├── examinations/  # Examination scheduling & terms
│   │   │   ├── results/       # Gradebook & letter grade calculator
│   │   │   ├── fees/          # Tuition invoicing & payment vouchers
│   │   │   └── academic-records/ # Cumulative GPA & transcripts
│   │   ├── teacher/           # Faculty Portal (Dashboard, Classes, Attendance, Gradebook)
│   │   ├── student/           # Student Portal (Profile, Attendance, Results, Fees, Academics)
│   │   └── api/               # Next.js API Routes (RESTful CRUD handlers)
│   ├── components/            # Reusable UI components (Sidebar, Header, Modals, StatsCard, Toast)
│   ├── lib/                   # Utility helpers (Prisma client, JWT auth, formatting, types)
│   └── middleware.ts          # Next.js Edge Middleware for Role-Based Access Control
├── .env.example               # Safe environment variable template
├── .gitignore                 # Standard Next.js/Prisma exclusion rules
├── package.json
├── test-suite.js              # Automated integration test runner
└── README.md
```

---

## 🔌 API Endpoints Reference

| Method | Endpoint | Description | Access |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Session login with email & password | Public |
| `POST` | `/api/auth/logout` | Clear session cookie | Authenticated |
| `POST` | `/api/auth/demo-switch`| 1-click evaluation account switcher | Public |
| `GET` | `/api/auth/me` | Fetch active user session | Authenticated |
| `GET` | `/api/stats` | Role-specific dashboard analytics | Authenticated |
| `GET/POST`| `/api/students` | List students with filters / Enroll new student | Admin / Staff |
| `GET/PUT/DEL`| `/api/students/:id` | View 360° profile, update details, or delete | Admin / Staff |
| `GET/POST`| `/api/teachers` | List faculty / Add new teacher | Admin |
| `GET/PUT/DEL`| `/api/teachers/:id` | View teacher, update details, or delete | Admin |
| `GET/POST`| `/api/classes` | List classes / Create new grade cohort | Admin |
| `GET/POST`| `/api/subjects` | Manage class curriculum subjects | Admin |
| `GET/POST`| `/api/attendance`| Get class attendance / Batch mark attendance | Admin / Teacher |
| `GET/POST`| `/api/examinations`| List exams / Schedule new examination | Admin |
| `GET/POST`| `/api/results` | Fetch results / Record student exam marks | Admin / Teacher |
| `GET/POST`| `/api/fees` | List invoices with status filter / Create fee | Admin / Student |
| `PUT/DEL` | `/api/fees/:id` | Record payment settlement / Delete invoice | Admin |
| `GET/POST`| `/api/academic-records`| Fetch GPA transcripts / Add academic record | Admin / Student |

---

## 🔒 Security Compliance

- **No Hardcoded Secrets**: Secrets and database connection strings are managed strictly via environment variables (`.env`).
- **Protected Credentials**: Passwords hashed with `bcryptjs` (salt rounds: 10).
- **Session Tokens**: HTTP-Only JWT cookies with strict expiration and SameSite policy.
- **Role Enforcement**: Next.js edge middleware prevents unauthorized access between `/admin`, `/teacher`, and `/student` routes.
- **Clean Git Repository**: `.gitignore` strictly ignores local `.env` files, node modules, and SQLite database binaries.

---

## 🔮 Future Improvements

- **Parent Portal**: Dedicated mobile view for parents to track live attendance notifications and report cards.
- **SMS & Email Alerts**: Webhook integrations for automatic fee due reminders and attendance notices.
- **AI Student Assistant**: Integrated AI tutor for personalized homework support and syllabus question answering.
- **Multi-Branch Institution Hierarchy**: Support for multiple school campuses under one administrative domain.

---

## 📄 License & Attribution

Developed for the **CodSoft Full Stack Web Development Internship (Task 1)** by **Ajay**.
All rights reserved.
