# CareerHub — Modern Job Portal & Recruitment Platform
### CodSoft Full Stack Web Development Internship — Task 3

CareerHub is a full-stack recruitment platform connecting job seekers, tech companies, and recruiters. Built with **Next.js 14 App Router, TypeScript, Tailwind CSS, PostgreSQL, and Prisma ORM**, CareerHub provides an Applicant Tracking System (ATS) with Kanban pipeline management, safe cloud storage resume handling, and interview scheduling workflows.

---

## 🌟 Key Features

### 👨‍💻 1. Candidate Experience
- **Authentication & Security**: Email/password registration, bcrypt password hashing, secure JWT session cookies.
- **Candidate Dashboard** (`/candidate/dashboard`): Metric cards (Applications count, Under Review, Shortlisted, Interviews, Saved Jobs), quick actions, recommended positions.
- **Profile & Resume Management** (`/candidate/profile`, `/candidate/resume`): Headline, bio, technical skills tags, work experience history, education records, social/portfolio links.
- **Resume Upload Layer**: Safe Cloud Storage abstraction supporting PDF/DOCX file uploads with local/demo fallback.
- **Marketplace & Job Search** (`/jobs`, `/jobs/[id]`): Fast multi-criteria search (keyword, location, department, experience, workplace type, salary range), sorting, pagination.
- **1-Click Application Workflow**: Select default or custom resume, attach personal cover note, submit with instant anti-duplicate verification.
- **Visual Application Tracker** (`/candidate/applications`): Stage progression stepper (`APPLIED` ➔ `UNDER REVIEW` ➔ `SHORTLISTED` ➔ `INTERVIEW` ➔ `SELECTED` / `REJECTED`), upcoming interview banner with meeting links.
- **Saved Jobs Bookmarks** (`/candidate/saved-jobs`): Bookmark listings for future reference.

### 🏢 2. Recruiter Experience
- **Recruiter Workspace** (`/recruiter/dashboard`): Hiring metrics (Active jobs, Total applicants, Candidates in review, Shortlisted, Scheduled interviews, Hires).
- **Job Listings Management** (`/recruiter/jobs`, `/recruiter/jobs/new`, `/recruiter/jobs/[id]/edit`): Publish, edit, draft, or close job openings across multiple departments.
- **ATS Kanban Recruitment Pipeline** (`/recruiter/applications`): Interactive Kanban board with 6 hiring columns (`APPLIED`, `UNDER_REVIEW`, `SHORTLISTED`, `INTERVIEW`, `SELECTED`, `REJECTED`).
- **Candidate Review Modal**: Inspect complete candidate profile, skills match, experience, view uploaded resume PDF, write internal evaluation notes, and set 1-5 star ratings.
- **Interview Scheduling Workflow**: Coordinate interview rounds with date, time, meeting URL (Google Meet / Zoom / MS Teams), and agenda notes.
- **Company Branding** (`/recruiter/company`): Manage organization profile, logo, description, industry, and headquarters location.

### 🛡️ 3. Platform Administration
- **Admin Dashboard** (`/admin/dashboard`): High-level KPIs (Total users, Candidates, Recruiters, Companies, Jobs, Applications, Placement rate, Recent signups).
- **User Account Moderation** (`/admin/users`): Inspect user profiles, filter by role, activate/deactivate accounts.
- **Job Moderation & Verification** (`/admin/jobs`): Review listings across all companies, toggle featured status, close or delete listings.
- **Platform Application Oversight** (`/admin/applications`): Global audit ledger of all candidate applications.

---

## 🛠️ Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router, Server Components & Route Handlers) |
| **Language** | [TypeScript](https://www.typescriptlang.org/) (Strict type-checking) |
| **Database** | [PostgreSQL](https://www.postgresql.org/) (Neon Serverless / Local Postgres) |
| **ORM** | [Prisma ORM 5](https://www.prisma.io/) |
| **Styling** | [Tailwind CSS](https://tailwindcss.com/) & Lucide React Icons |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) + `bcryptjs` + `httpOnly` secure cookies |
| **Storage Layer** | Cloud Storage Abstraction (`storage.ts`) with S3 & local filesystem fallback |

---

## 🗄️ Database Architecture (Prisma Schema)

```text
User ───────────────┬─── 1:1 ─── CandidateProfile
                    ├─── 1:1 ─── RecruiterProfile ─── M:1 ─── Company
                    ├─── 1:M ─── Resume
                    ├─── 1:M ─── Application ──────── 1:1 ─── Interview
                    ├─── 1:M ─── SavedJob
                    ├─── 1:M ─── Job ──────────────── 1:M ─── JobSkill
                    └─── 1:M ─── Notification
```

### Models:
1. **`User`**: Core user entity (`CANDIDATE`, `RECRUITER`, `ADMIN`).
2. **`CandidateProfile`**: Candidate bio, headline, skills JSON, education JSON, experience JSON.
3. **`Company`**: Company branding, industry, location, size, verified status.
4. **`RecruiterProfile`**: Recruiter position, department, linked company.
5. **`Job`**: Job listing details, salary range, remote status, category, status (`DRAFT`, `PUBLISHED`, `CLOSED`).
6. **`JobSkill`**: Individual skill tags associated with a job listing.
7. **`Resume`**: Resume metadata (filename, fileUrl, storageKey, size, isDefault).
8. **`Application`**: Application record with candidate, job, cover letter, recruiter notes, star rating, status. Enforces `@@unique([jobId, candidateId])` to prevent duplicate submissions.
9. **`SavedJob`**: Candidate bookmarks. Enforces `@@unique([candidateId, jobId])`.
10. **`Interview`**: Scheduled interview metadata (date, timeSlot, meetingUrl, meetingType, notes).
11. **`Notification`**: System and application status alerts for users.

---

## 🔐 Demo Credentials (CodSoft Evaluation)

| Role | Email | Password | Access Details |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@careerhub.com` | `admin123` | Full admin dashboard, user moderation, job moderation |
| **Recruiter 1** | `sarah.connor@techcorp.com` | `recruiter123` | TechCorp Innovations recruiter, job posting, ATS Kanban |
| **Recruiter 2** | `david.kim@innovatelabs.io` | `recruiter123` | InnovateLabs AI recruiter, job posting, ATS Kanban |
| **Candidate 1** | `alex.morgan@example.com` | `candidate123` | Senior Full Stack Engineer, active interview scheduled |
| **Candidate 2** | `priya.sharma@example.com` | `candidate123` | Lead Frontend Architect, shortlisted application |
| **Candidate 3** | `james.wilson@example.com` | `candidate123` | DevOps / SRE, selected offer |

> [!NOTE]
> Demo accounts are easily populated using `npm run prisma:seed` and can be filled in 1 click directly on the `/login` page.

---

## ⚙️ Environment Variables

Create `.env` inside `Task-3-CareerHub/` (refer to `.env.example`):

```env
# 1. PostgreSQL Database URL
DATABASE_URL="postgresql://postgres:password@localhost:5432/careerhub?schema=public"

# 2. JWT Session Secret
JWT_SECRET="careerhub_jwt_super_secret_session_key_at_least_32_characters_long"

# 3. Application URL
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# 4. Storage Provider (Optional - "local" by default)
CLOUD_STORAGE_PROVIDER="local"
```

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
cd Task-3-CareerHub
npm install
```

### 2. Configure Environment & Push Database Schema
```bash
cp .env.example .env
# Edit DATABASE_URL in .env if needed
npx prisma db push
```

### 3. Seed Realistic Demo Records
```bash
node prisma/seed.js
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

---

## 🧪 Testing & Verification

Run the comprehensive end-to-end integration test suite:

```bash
npm test
```

This verifies:
- Public marketplace and landing page endpoints (HTTP 200)
- Registration, login, invalid credential rejection (HTTP 401)
- Role-Based Access Control (RBAC) restrictions (HTTP 403)
- Job posting, search, and category/remote filtering
- Candidate profile and resume document management
- Anti-duplicate application prevention (HTTP 409)
- Saved job bookmarking and anti-duplicate constraints
- Recruiter ATS Kanban pipeline stage progressions
- Interview scheduling workflow with meeting link notifications
- Admin governance, KPI statistics, and moderation actions

---

## 🌐 Vercel Production Deployment

To deploy **Task 3 (CareerHub)** as a separate project on Vercel:

1. Import the `CODSOFT_TASKSNO` repository in your Vercel dashboard.
2. In **Project Settings ➔ General ➔ Root Directory**, set:
   ```text
   Task-3-CareerHub
   ```
3. Add the production environment variables:
   - `DATABASE_URL` (e.g. Neon PostgreSQL connection string)
   - `JWT_SECRET`
4. Deploy!
