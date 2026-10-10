# SCiVLab

**Interactive Algorithm Learning Platform with Lab Management, AI-Powered Content Generation & Proctored Examination System**

A full-stack MERN platform for algorithm education — visual learning, hands-on coding, AI content generation, proctored exams, and complete institutional administration.

**Stack:** MERN · React 18 · Node.js 18 · MongoDB · Tailwind · Monaco · React Flow · Recharts · Judge0 · Groq · Nodemailer

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [User Roles](#user-roles)
- [API Overview](#api-overview)
- [Core Modules](#core-modules)
- [REST API Reference](#rest-api-reference)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [Team](#team)
- [Acknowledgments](#acknowledgments)
- [License](#license)

---

## Overview

**SCiVLab** is a comprehensive educational platform that bridges the gap between learning algorithms visually and practising them in a real coding environment. It also provides teachers and institutional administrators with a complete toolkit for running programming labs, generating content with AI, conducting proctored exams, and tracking student progress.

Built with the MERN stack and modern web APIs, SCiVLab is designed for colleges and universities that want a single, unified platform for algorithm education — replacing fragmented tools with one cohesive experience.


---

## Key Features

### For Students

- Interactive algorithm visualizations — animated arrays, strings, and flowcharts
- Dry-run walkthroughs — step through algorithm execution with live variable state
- In-browser code editor (Monaco) with copy-paste protection
- Real-time code execution against public test cases
- Progress tracking across a curated learning path
- Proctored exams with fullscreen enforcement and penalty tracking
- Offline access — cached labs viewable without internet
- Light/Dark theme with persistent preference

### For Teachers

- Lab creation — academic (shared) and private
- Bulk student enrollment via CSV import with email support
- Practical management — descriptions, instructions, deadlines, starter templates, test cases
- AI-powered practical generation using Groq (Llama 3.3 70B) with structured JSON output
- Evaluation workflow — approve/reject submissions with feedback
- Marks & attendance tracking
- Proctored exam creation with scheduling and student enrollment
- Email notifications to enrolled students
- Excel report exports — performance, marks analysis, attendance

### For Super Admin (Principal)

- Faculty management — manual and CSV import
- Cascade deletion — clean removal of faculty and all their data
- Institution-wide analytics — faculty, labs, students, submissions, department breakdowns
- Top performer leaderboards and at-risk faculty alerts

### Platform-wide

- JWT-based auth with role-based access control
- REST API with layered middleware
- Offline-first architecture using Service Workers + IndexedDB
- SMTP-based transactional email
- Cascade-safe deletions across all related entities
- Fully responsive with dark/light themes

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 18 | UI library |
| Vite 4 | Build tool & dev server |
| Tailwind CSS 3.3 | Utility-first styling |
| React Router 6 | Client-side routing |
| Monaco Editor | VS Code-grade code editor |
| React Flow + Dagre | Flowchart visualization |
| Recharts | Analytics charts |
| Motion (Framer) | Animations |
| react-hot-toast | Toast notifications |
| xlsx + file-saver | Excel report exports |

### Backend

| Technology | Purpose |
|---|---|
| Node.js 18 | Runtime |
| Express 4.18 | Web framework |
| Mongoose 7.4 | MongoDB ODM |
| JWT 9.0 | Auth tokens |
| bcryptjs | Password hashing |
| Nodemailer | SMTP email |
| multer + csv-parser | CSV imports |

### Database & External APIs

| Service | Purpose |
|---|---|
| MongoDB | Primary data store (16 collections) |
| Judge0 API | Multi-language code execution (Python, C, C++, Java, JS) |
| Groq API | LLM-powered practical generation |
| Nodemailer SMTP | Transactional email delivery |

---

## Architecture

```
+--------------------------------------------------------------+
|                      PRESENTATION LAYER                      |
|  React 18 | Vite | Tailwind | Monaco | React Flow | Recharts |
+------------------------------+-------------------------------+
                               |  REST API (JWT)
                               v
+--------------------------------------------------------------+
|                      APPLICATION LAYER                       |
|  Node.js | Express | JWT | Mongoose | Nodemailer             |
|  - Modules: auth, teacher, lab, practical, submission, exam  |
|  - AI Service: Groq LLM with structured output               |
|  - External: Judge0 (code exec), SMTP (email)                |
+------------------------------+-------------------------------+
                               |  Mongoose ODM
                               v
+--------------------------------------------------------------+
|                         DATA LAYER                           |
|  MongoDB - 16 collections                                    |
|  Users | Teachers | SuperAdmins | Labs | Practicals | Exams  |
|  Submissions | Evaluations | Marks | Attendance | AuditLogs  |
+--------------------------------------------------------------+
```

---

## Project Structure

```
algo_demonstrator/
|
+-- backend/
|   +-- src/
|   |   +-- config/                  # DB, env, constants
|   |   +-- models/                  # 16 Mongoose schemas
|   |   +-- modules/                 # Feature-based routes
|   |   |   +-- auth/
|   |   |   +-- algorithm/
|   |   |   +-- algorithmSubmission/
|   |   |   +-- attendance/
|   |   |   +-- evaluation/
|   |   |   +-- exam/                # Proctored exams
|   |   |   +-- lab/
|   |   |   +-- marks/
|   |   |   +-- practical/
|   |   |   +-- progress/
|   |   |   +-- report/
|   |   |   +-- student/
|   |   |   +-- submission/
|   |   |   +-- superAdmin/          # Principal portal
|   |   |   +-- teacher/             # + AI practical gen
|   |   +-- middleware/              # auth, roles, labAccess
|   |   +-- utils/                   # audit, judge0, email
|   |   +-- db/seed/                 # Seeder scripts
|   |   +-- routes/index.js          # Route mounting
|   |   +-- app.js                   # Express app
|   |   +-- server.js                # Listen + DB connect
|   +-- .env.sample
|   +-- package.json
|
+-- frontend/
    +-- public/
    |   +-- sw.js                    # Service worker
    |   +-- data/algorithms.json
    +-- src/
    |   +-- api/client.js            # apiFetch wrapper
    |   +-- components/
    |   |   +-- layout/              # Navbars, Sidebar, Layout
    |   |   +-- ui/                  # shadcn + ThemeToggle
    |   +-- contexts/
    |   |   +-- ThemeContext.jsx
    |   +-- features/                # Feature-based UI
    |   |   +-- algorithm/
    |   |   +-- auth/
    |   |   +-- exam/
    |   |   +-- landing/
    |   |   +-- student/
    |   |   +-- superAdmin/
    |   |   +-- teacher/
    |   +-- lib/utils.js
    |   +-- offline/                 # SW + IndexedDB + health
    |   +-- styles/
    |   +-- App.jsx
    |   +-- main.jsx
    +-- index.html
    +-- package.json
```

---

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm 9 or later
- MongoDB (local or MongoDB Atlas)
- Groq API Key (free) — https://console.groq.com/keys
- SMTP credentials (optional, for emails) — Gmail App Password or Resend

### Backend Setup

```bash
# 1. Clone the repository
git clone https://github.com/enn-dee/algo_demonstrator.git
cd algo_demonstrator/backend

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.sample .env
# Edit .env with your credentials (see Environment Variables)

# 4. Start the backend server
npm start
# Server running on 3000
# MongoDB connected
# Email transporter ready (if SMTP configured)
```

### Frontend Setup

```bash
cd ../frontend

# 1. Install dependencies
npm install

# 2. Start the dev server
npm run dev
# http://localhost:5173
```

The frontend proxies `/api/*` requests to `http://localhost:3000` via Vite config.

### Seeding Data

The backend ships with idempotent seeder scripts:

```bash
cd backend

# Seed all 12 core algorithms
node src/db/seed/seedFullAlgos.js

# Seed academic labs (C, C++, Java) with practicals
node src/db/seed/seedAcademicCurriculum.js

# Add a single custom practical (teacher-friendly)
node src/db/seed/seedOnePractical.js

# Create the super admin (Principal) account
node src/db/seed/seedSuperAdmin.js
```

Default super admin credentials (change after first login):

```
Email:    principal@scivlab.com
Password: ChangeMe@1234
```

---

## Environment Variables

### backend/.env

```env
# Core
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/algoLab
SECRET_KEY=your-super-secret-jwt-key-change-me

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173

# Code Execution
JUDGE0_URL=https://ce.judge0.com/submissions?base64_encoded=true&wait=true

# AI Practical Generation
GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_NAME=SCiVLab
SMTP_FROM_EMAIL=your-email@gmail.com
```

Note for Gmail users: You must use an App Password (https://myaccount.google.com/apppasswords), not your regular password.

Free alternatives:

- Resend: `smtp.resend.com:465`
- Brevo: `smtp-relay.brevo.com:587`

### frontend/.env

```env
VITE_API_BASE=/api
```

---

## User Roles

| Role | Portal | Auth Method | Capabilities |
|---|---|---|---|
| Student | /login | Roll No / Reg No / Email + DOB (DDMMYYYY) | Learn, code, submit, appear for exams |
| Teacher | /teacher/login | Email + password | Manage labs, practicals, students, marks, exams |
| Super Admin | /superadmin/login | Email + password | Faculty management, institution analytics |

Accounts are pre-created by teachers (students) and super admins (teachers) — no public registration.

---

## API Overview

Base URL: `/api`

All routes return JSON. Protected routes require:

```
Authorization: <JWT_TOKEN>
```

### Endpoint Categories

| Prefix | Purpose | Auth |
|---|---|---|
| /api/auth | Student registration, login, list students | Public + JWT |
| /api/teacher | Teacher auth | Public |
| /api/teacher/ai | AI practical generation | JWT (Teacher) |
| /api/teacher/students | System-wide student management | JWT (Teacher) |
| /api/superadmin | Faculty management + analytics | JWT (Superadmin) |
| /api/labs | Lab CRUD + cascade delete | JWT (Teacher) |
| /api/lab-students | Lab enrollment + CSV import | JWT (Teacher) |
| /api/practicals | Practical CRUD | JWT (Teacher) |
| /api/submissions | Run/submit code, list submissions | JWT (Student/Teacher) |
| /api/evaluations | Approve/reject submissions | JWT (Teacher) |
| /api/marks | Marks entry | JWT (Teacher) |
| /api/attendance | Attendance marking | JWT (Teacher) |
| /api/reports | Performance reports + analytics | JWT (Teacher) |
| /api/algorithms | Algorithm catalogue | Public |
| /api/algo-progress | Save/reset algorithm code | JWT (Student) |
| /api/progress | User progress tracking | JWT (Student) |
| /api/exams | Exam CRUD, submissions, penalties | JWT (Teacher/Student) |
| /api/health | Health check (used by offline detection) | Public |

---

## Core Modules

### 1. Algorithm Learning

Students explore a curated learning path of 12 algorithms, each with:

- Info Tab — theory, pros/cons, pseudocode, complexity graph
- Flowchart Tab — React Flow diagram with Dagre auto-layout
- Dry-Run Tab — interactive walkthrough with variable state tracking
- Visualization Tab — animated array/string highlighting
- Code Tab — Monaco editor + Judge0 execution

Supported algorithms: Palindrome Check, Sum of Two Numbers, Maximum of Three, Factorial, Linear Search, Binary Search, Bubble Sort, Selection Sort, Insertion Sort, Merge Sort, Fibonacci (DP), Two Sum.

### 2. Lab Management

Teachers can create academic (shared) or private labs and:

- Enroll students individually or via CSV bulk import
- Create practicals with deadlines, starter templates, and test cases
- Evaluate submissions with approve/reject + feedback
- Record marks (viva, execution, attendance, internal)
- Mark attendance for lab/lecture sessions
- Export performance reports to Excel

Cascade delete: Deleting a lab atomically removes all its practicals, submissions, marks, attendance, and enrollments.

### 3. AI Practical Generation

Powered by Groq API with JSON schema structured output:

```
Teacher enters title -> selects language + difficulty -> clicks "Generate with AI"
                              |
                              v
            Groq (Llama 3.3 70B) returns structured JSON
                              |
                              v
     Description | Instructions | Input/Output format | Pseudocode
     Time/Space complexity | Starter template | 3 test cases
                              |
                              v
                    Teacher reviews & edits
                              |
                              v
                    Saves via existing /practicals endpoint
```

Key features:

- 10x faster practical creation (4 sec vs. manual authoring)
- Regenerate test cases on demand
- Full editability before saving
- Free tier — 14.4K requests/day
- Model fallback if Groq deprecates a model

Endpoints:

- POST `/api/teacher/ai/generate-practical`
- POST `/api/teacher/ai/regenerate-test-cases`
- POST `/api/teacher/ai/refine`

### 4. Proctored Examinations

Teacher side:

- Create scheduled exams with start/end time
- Choose language (Python, C, C++, Java)
- Enroll students by roll number or batch
- View submissions with penalty data (window changes, fullscreen exits)

Student side (anti-cheating):

- Fullscreen enforcement
- Copy/paste/cut blocked in Monaco
- Window change tracking (window.blur)
- Fullscreen exit tracking (fullscreenchange)
- Draft persistence in localStorage
- Auto-submit at end time with 10-second grace window

Endpoints:

- POST `/api/exams` — create exam
- PUT `/api/exams/:id/students` — enroll + notify
- POST `/api/exams/:id/submit` — submit/resubmit
- POST `/api/exams/:id/penalties` — record penalty
- GET `/api/exams/teacher` — teacher's exams
- GET `/api/exams/student` — student's exams

### 5. Super Admin Portal

Principal-level dashboard for institutional administration:

Faculty Management:

- Add single teacher manually
- CSV bulk import
- Search + filter by department
- Delete with full cascade cleanup (labs, practicals, submissions, marks, attendance)

Analytics Dashboard:

- 5 KPI cards (teachers, labs, students, practicals, submissions)
- Submission activity chart (last 7 days)
- Lab types pie chart (academic vs private)
- Top professors leaderboard
- Teachers needing attention (no labs or zero submissions)
- Department breakdown cards
- Full faculty table with completion %

Endpoints:

- POST `/api/superadmin/teachers` — create
- POST `/api/superadmin/teachers/import` — CSV import
- DELETE `/api/superadmin/teachers/:id` — cascade delete
- GET `/api/superadmin/analytics` — institution-wide analytics

### 6. Email Notifications

Transactional emails via Nodemailer + SMTP with a styled HTML template:

- Sent when a student is enrolled in a new exam
- Only newly enrolled students receive emails (no spam on re-saves)
- Graceful fallback — skips students without an email
- Fire-and-forget delivery — never blocks HTTP response
- Pooled transport — maxConnections: 3, safe for free tiers

Setup:

1. Configure SMTP in `.env`
2. Verify at boot: `Email transporter ready`
3. Emails fire automatically on enrollment

### 7. Offline Mode

Service Worker + IndexedDB for offline-first experience:

- Cached API responses in IndexedDB + localStorage
- Server-health polling — uses `/api/health` (not just navigator.onLine)
- Offline banner appears when server is unreachable
- Queued submissions auto-sync when server is back
- Offline drafts saved in localStorage
- GET requests fall back to cache; POST/PUT/DELETE never do

Key files:

- `frontend/src/offline/offlineDb.js` — IndexedDB wrapper
- `frontend/src/offline/offlineMode.js` — offline logic
- `frontend/src/offline/serverStatus.js` — health polling
- `frontend/public/sw.js` — service worker

### 8. Light/Dark Theme

- ThemeProvider stores preference in localStorage
- `data-theme` attribute on `<html>` triggers CSS variable overrides
- Zero per-component changes — overrides in `styles/index.css`
- Persistent across sessions and logins
- Monaco editor theme switches automatically (vs / vs-dark)

---

## REST API Reference

### Auth

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/auth/register | Public | Student registration |
| POST | /api/auth/login | Public | Login (roll/reg/email) |
| GET | /api/auth/all-students | Public | List all students |

### Teacher & AI

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/teacher/login | Public | Teacher login |
| POST | /api/teacher/ai/generate-practical | Teacher | Generate practical draft |
| POST | /api/teacher/ai/regenerate-test-cases | Teacher | Regenerate test cases |
| POST | /api/teacher/ai/refine | Teacher | Refine a single field |
| GET | /api/teacher/students | Teacher | List all students |
| POST | /api/teacher/students/import | Teacher | Bulk CSV import |
| DELETE | /api/teacher/students/:id | Teacher | Delete student |

### Super Admin

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/superadmin/login | Public | Super admin login |
| GET | /api/superadmin/teachers | Superadmin | List all teachers |
| POST | /api/superadmin/teachers | Superadmin | Create teacher |
| POST | /api/superadmin/teachers/import | Superadmin | Bulk CSV import |
| DELETE | /api/superadmin/teachers/:id | Superadmin | Cascade delete |
| GET | /api/superadmin/analytics | Superadmin | Institution analytics |

### Labs & Practicals

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/labs | Teacher | Get teacher's labs |
| POST | /api/labs | Teacher | Create lab |
| DELETE | /api/labs/:id | Teacher | Cascade delete lab |
| GET | /api/lab-students/:labId | Teacher | Enrolled students |
| POST | /api/lab-students/:labId/import-csv | Teacher | Bulk enroll via CSV |
| POST | /api/practicals | Teacher | Create practical |
| PUT | /api/practicals/:id | Teacher | Update practical |

### Submissions & Evaluation

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | /api/submissions/:id/run | Student | Run code |
| POST | /api/submissions/:id/submit | Student | Submit for evaluation |
| GET | /api/submissions/my | Student | Own submissions |
| GET | /api/submissions/lab/:labId | Teacher | Lab submissions |
| POST | /api/evaluations | Teacher | Approve/reject |
| POST | /api/marks | Teacher | Enter marks |
| POST | /api/attendance | Teacher | Mark attendance |

### Algorithms & Progress

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/algorithms | Public | All algorithms |
| GET | /api/algorithms/:slug | Public | Single algorithm |
| GET | /api/algo-progress/:slug | Student | Get saved code |
| POST | /api/algo-progress/save | Student | Save code |
| DELETE | /api/algo-progress/reset/:slug | Student | Reset to template |
| GET | /api/progress/user-progress | Student | Progress summary |

### Exams

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/exams/teacher | Teacher | Teacher's exams |
| POST | /api/exams | Teacher | Create exam |
| PUT | /api/exams/:id/students | Teacher | Enroll students |
| GET | /api/exams/teacher/submissions | Teacher | All exam submissions |
| GET | /api/exams/student | Student | Enrolled exams |
| POST | /api/exams/:id/submit | Student | Submit exam code |
| POST | /api/exams/:id/penalties | Student | Record penalty |

### Reports

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | /api/reports/dashboard-stats | Teacher | Dashboard KPIs |
| GET | /api/reports/student-performance/:labId | Teacher | Performance report |
| GET | /api/reports/marks-analysis/:labId | Teacher | Marks analysis |
| GET | /api/reports/attendance-summary/:labId | Teacher | Attendance summary |
| GET | /api/reports/teacher-overview | Teacher | Teacher analytics |

---

## Database Schema

16 Mongoose collections:

| Collection | Purpose |
|---|---|
| users | Students (roll, reg, email, DOB) |
| teachers | Faculty accounts |
| superadmins | Principal accounts |
| labs | Academic + private labs |
| practicals | Assignments with test cases |
| enrollments | Student-lab enrollments |
| labteacherassignments | Teacher-lab access mapping |
| submissions | Practical code submissions |
| evaluations | Approve/reject + remarks |
| marks | Viva, execution, attendance, internal |
| attendances | Lab + lecture attendance |
| algorithms | Algorithm catalogue |
| algorithmsubmissions | Saved algorithm code |
| userprogresses | Algorithm completion |
| exams | Proctored exams |
| examsubmissions | Exam code submissions |
| exampenalties | Window/fullscreen penalties |
| auditlogs | Admin action history |

Full schemas: See `backend/src/models/`.

---

## Deployment

### Backend (Render / Railway / Fly.io)

```
Set environment variables in the hosting dashboard
Build command: npm install
Start command: node src/server.js
```

### Frontend (Vercel / Netlify)

```
Set build command: npm run build
Output directory: dist
Environment: VITE_API_BASE=https://your-backend.com/api
```

### Database (MongoDB Atlas)

1. Create a free cluster
2. Whitelist your deployment IPs
3. Copy the connection string into MONGO_URI

### Post-Deployment Checklist

- [ ] Update SECRET_KEY to a strong random string
- [ ] Update FRONTEND_URL for email links
- [ ] Verify /api/health responds with ok
- [ ] Run seeders on production DB (once)
- [ ] Change super admin password after first login
- [ ] Test code execution via Judge0
- [ ] Test AI generation via Groq
- [ ] Send a test enrollment email

---

## Roadmap

### Short-term

- [ ] Graph algorithms (BFS, DFS, Dijkstra) visualization
- [ ] Tree traversals (in-order, pre-order, post-order)
- [ ] Quick Sort, Heap Sort visualizations
- [ ] Self-hosted Judge0 / Piston instance

### Mid-term

- [ ] Real-time collaborative coding (WebSockets)
- [ ] Interactive debugger with breakpoints
- [ ] Plagiarism detection (MOSS / JPlag)
- [ ] AI-assisted grading for subjective submissions
- [ ] Deadline reminder emails
- [ ] Discussion forums per practical

### Long-term

- [ ] Full PWA with offline code execution
- [ ] Native mobile apps (React Native)
- [ ] Webcam-based live proctoring
- [ ] Docker + Kubernetes deployment
- [ ] BullMQ + Redis background job queue
- [ ] Sentry + Prometheus monitoring

---

## Contributing

We welcome contributions from the community!

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feat/your-feature-name

# 3. Make your changes
# 4. Commit with conventional commits
git commit -m "feat: add your feature"

# 5. Push and open a PR
git push origin feat/your-feature-name
```

### Commit Convention

- `feat:` — new feature
- `fix:` — bug fix
- `docs:` — documentation
- `refactor:` — code refactoring
- `chore:` — maintenance

### Code Style

- Backend: ES modules, feature-based folder structure, async/await
- Frontend: Functional components, hooks, feature-based organization
- Linting: ESLint configured on both ends



## Acknowledgments

This project would not have been possible without the incredible work of the open-source community. Special thanks to:

- React, Vite, Tailwind CSS
- Node.js, Express, MongoDB, Mongoose
- Monaco Editor (VS Code's editor)
- React Flow, Recharts, Motion
- Judge0 — secure code execution
- Groq — free-tier LLM inference
- Nodemailer — email delivery
- shadcn/ui — component primitives

---

## License

This project is licensed under the MIT License.

---

