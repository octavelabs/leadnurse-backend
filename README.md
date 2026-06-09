# Lead Nurse — Backend API

REST API for the Lead Nurse healthcare LMS and workforce management platform. Built with Node.js, Express, PostgreSQL (Neon), and Prisma.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Seeding](#seeding)
- [Running the Server](#running-the-server)
- [Project Structure](#project-structure)
- [API Overview](#api-overview)
- [Authentication](#authentication)
- [Default Credentials](#default-credentials)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Database | PostgreSQL (Neon serverless) |
| ORM | Prisma 5 |
| Auth | JWT (jsonwebtoken) |
| File Uploads | Cloudinary + Multer |
| Password Hashing | bcryptjs |
| Validation | express-validator |
| Logging | Winston + Morgan |
| Security | Helmet, express-rate-limit, CORS |

---

## Prerequisites

- **Node.js** v18 or higher — [download](https://nodejs.org)
- **npm** v9 or higher (comes with Node)
- **PostgreSQL database** — a free [Neon](https://neon.tech) account is recommended
- **Cloudinary account** — free tier at [cloudinary.com](https://cloudinary.com) (for file uploads)
- **Git**

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/octavelabs/leadnurse-backend.git
cd leadnurse-backend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

Then edit `.env` — see [Environment Variables](#environment-variables) below.

### 4. Set up the database

```bash
npx prisma db push
```

### 5. Generate the Prisma client

```bash
npx prisma generate
```

### 6. Seed the database

```bash
node prisma/seed.js
```

This creates the admin account, healthcare roles, and a sample facility.

### 7. Start the server

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

---

## Environment Variables

Copy `.env.example` to `.env` and fill in each value:

```env
NODE_ENV=development
PORT=5000

# PostgreSQL — get this from your Neon dashboard (Settings → Connection string)
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# JWT — set a long, random string in production
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d

# The URL of your running frontend (used for CORS)
FRONTEND_URL=http://localhost:5173

# Cloudinary — find these in your Cloudinary dashboard (Settings → API Keys)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### Getting your Neon DATABASE_URL

1. Create a free account at [neon.tech](https://neon.tech)
2. Create a new project
3. Go to **Dashboard → Connection Details**
4. Copy the **connection string** — it looks like:
   `postgresql://neondb_owner:password@ep-xxx.us-east-1.aws.neon.tech/neondb?sslmode=require`

### Getting Cloudinary credentials

1. Create a free account at [cloudinary.com](https://cloudinary.com)
2. Go to **Dashboard** — your cloud name, API key and API secret are shown there

---

## Database Setup

### Push schema to database (recommended for development)

```bash
npx prisma db push
```

### Run migrations (for production / team environments)

```bash
npx prisma migrate deploy
```

### View database in Prisma Studio

```bash
npx prisma studio
```

### Regenerate the Prisma client (run after any schema change)

```bash
npx prisma generate
```

> **Note:** If the server is running, stop it before running `prisma generate` on Windows — the server holds a lock on the Prisma binary.

---

## Seeding

### Main seed (required — run once after first setup)

Creates:
- 1 admin user (`admin@leadnurse.com` / `Admin@123`)
- 10 healthcare roles (Registered Nurse, HCA, Mental Health Nurse, etc.)
- 1 sample facility (Sunrise Care Home, Telford)

```bash
node prisma/seed.js
```

### Test users seed (optional — adds 50 realistic employee accounts)

Creates 50 EMPLOYEE accounts spread across UK cities with compliance records and healthcare roles assigned. Useful for testing Worker Records, Compliance Monitor, and Payroll.

```bash
node prisma/seedTestUsers.js
```

All test accounts use the password: `Password@123`

Example test accounts:
```
amara.okonkwo@leadnurse-test.com
james.patel@leadnurse-test.com
sophie.williams@leadnurse-test.com
```

---

## Running the Server

| Command | Description |
|---|---|
| `npm run dev` | Start with nodemon (auto-restart on file changes) |
| `npm start` | Start without nodemon (production-style) |

The server starts on `http://localhost:5000` by default (configurable via `PORT` in `.env`).

Health check: `GET http://localhost:5000/health`

---

## Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema (all models and enums)
│   ├── migrations/            # Migration history
│   ├── seed.js                # Main seed (admin, roles, facility)
│   └── seedTestUsers.js       # 50 test employee accounts
│
├── src/
│   ├── index.js               # Express app entry point, route registration
│   │
│   ├── config/
│   │   └── cloudinary.js      # Cloudinary SDK configuration
│   │
│   ├── controllers/           # Request handlers (one file per domain)
│   │   ├── authController.js
│   │   ├── courseController.js
│   │   ├── lessonController.js
│   │   ├── chapterController.js      # Chapters + chapter quiz logic
│   │   ├── assessmentController.js
│   │   ├── certificateController.js
│   │   ├── enrollmentController.js
│   │   ├── progressController.js
│   │   ├── shiftController.js
│   │   ├── attendanceController.js
│   │   ├── payrollController.js
│   │   ├── complianceController.js
│   │   ├── facilityController.js
│   │   ├── healthcareRoleController.js
│   │   ├── workerController.js
│   │   ├── referenceController.js    # Token-based reference forms
│   │   ├── documentController.js     # Signable documents
│   │   ├── timesheetSignoffController.js  # Third-party shift sign-off
│   │   ├── analyticsController.js
│   │   └── notificationController.js
│   │
│   ├── routes/                # Express routers (one file per domain)
│   │
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication (authenticate)
│   │   ├── authorize.js       # Role-based access control (authorize)
│   │   ├── upload.js          # Multer + Cloudinary storage configs
│   │   ├── validate.js        # express-validator error formatter
│   │   └── errorHandler.js    # Global error handler
│   │
│   ├── services/
│   │   ├── auditService.js       # Fire-and-forget audit log creation
│   │   ├── complianceService.js  # Compliance status checker + gating
│   │   ├── notificationService.js
│   │   └── payrollService.js     # Hours + pay calculation
│   │
│   └── utils/
│       ├── apiResponse.js     # Standardised success/error response helpers
│       └── logger.js          # Winston logger
│
├── .env.example               # Template — copy to .env and fill in values
├── .gitignore
└── package.json
```

---

## API Overview

All routes are prefixed with `/api`. Protected routes require a `Bearer` token in the `Authorization` header.

### Authentication

| Method | Route | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Create employee account |
| POST | `/api/auth/login` | Public | Login, returns JWT |
| GET | `/api/auth/me` | Auth | Get current user profile |
| PUT | `/api/auth/profile` | Auth | Update profile fields |
| POST | `/api/auth/avatar` | Auth | Upload profile photo |

### LMS — Courses & Learning

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/courses` | Auth | List published courses |
| POST | `/api/courses` | Admin | Create course |
| GET | `/api/courses/:id` | Auth | Course detail with progress |
| PUT | `/api/courses/:id` | Admin | Update course |
| DELETE | `/api/courses/:id` | Admin | Delete course |
| GET | `/api/chapters/course/:courseId` | Auth | Get chapters for a course |
| POST | `/api/chapters` | Admin | Create chapter |
| PUT | `/api/chapters/:id` | Admin | Update chapter |
| DELETE | `/api/chapters/:id` | Admin | Delete chapter |
| PUT | `/api/chapters/:chapterId/quiz` | Admin | Create/update chapter quiz |
| GET | `/api/chapters/:chapterId/quiz` | Auth | Get quiz for student |
| POST | `/api/chapters/:chapterId/quiz/submit` | Auth | Submit quiz answers |
| GET | `/api/lessons/:courseId` | Auth | List slides for a course |
| POST | `/api/lessons` | Admin | Create slide |
| GET | `/api/lessons/:id` | Auth | Get slide with navigation context |
| PUT | `/api/lessons/:id` | Admin | Update slide |
| DELETE | `/api/lessons/:id` | Admin | Delete slide |
| POST | `/api/enrollments` | Auth | Enrol in a course |
| POST | `/api/progress/:lessonId/complete` | Auth | Mark slide complete |
| GET | `/api/assessments/:courseId` | Auth | Get final assessment |
| POST | `/api/assessments/:courseId/attempt` | Auth | Submit assessment attempt |
| GET | `/api/certificates` | Auth | Get my certificates |

### Workforce

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/workers` | Admin | List all employees (filterable) |
| GET | `/api/workers/:id` | Admin | Worker detail |
| GET | `/api/shifts` | Admin | List shifts |
| POST | `/api/shifts` | Admin | Create shift |
| GET | `/api/shifts/available` | Auth | Shifts employee can apply for |
| GET | `/api/shifts/my` | Auth | My assigned shifts |
| POST | `/api/shifts/:id/apply` | Auth | Apply for a shift |
| PATCH | `/api/shifts/assign/:id/review` | Admin | Confirm or decline application |
| GET | `/api/attendance` | Admin | All attendance records |
| POST | `/api/attendance` | Admin | Record attendance (check-in/out) |
| GET | `/api/payroll` | Admin | Payroll reports |
| POST | `/api/payroll/generate` | Admin | Generate payroll for period |
| GET | `/api/compliance` | Admin | All compliance records |
| GET | `/api/compliance/my` | Auth | My compliance records |
| POST | `/api/compliance` | Admin | Create/update compliance record |
| POST | `/api/compliance/my/document` | Auth | Upload own compliance document |
| POST | `/api/compliance/:id/document` | Auth | Upload document to a record |
| GET | `/api/facilities` | Admin | List facilities |
| POST | `/api/facilities` | Admin | Create facility |

### Onboarding & HR

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/references/worker/:workerId` | Admin | References for a worker |
| POST | `/api/references` | Admin | Add referee |
| POST | `/api/references/:id/send` | Admin | Generate reference request token |
| GET | `/api/references/form/:token` | Public | Get form context (no auth) |
| POST | `/api/references/form/:token/submit` | Public | Submit reference (no auth) |
| GET | `/api/documents` | Admin | All signable documents |
| POST | `/api/documents` | Admin | Upload document for signing |
| POST | `/api/documents/:id/assign` | Admin | Assign to employees |
| GET | `/api/documents/my` | Auth | My documents to sign |
| POST | `/api/documents/sign/:sigId` | Auth | Sign a document |
| POST | `/api/timesheet-signoff/request` | Admin | Generate sign-off link |
| GET | `/api/timesheet-signoff/form/:token` | Public | Sign-off form context (no auth) |
| POST | `/api/timesheet-signoff/form/:token/submit` | Public | Submit sign-off (no auth) |

### Analytics

| Method | Route | Access | Description |
|---|---|---|---|
| GET | `/api/analytics/workforce` | Admin | Workforce dashboard stats |
| GET | `/api/analytics/attendance` | Admin | Attendance breakdown |

---

## Authentication

The API uses **JWT Bearer token** authentication.

After logging in, include the token in all protected requests:

```
Authorization: Bearer <your_jwt_token>
```

Tokens expire after 7 days by default (configurable via `JWT_EXPIRES_IN`).

**Roles:**
- `ADMIN` — full access to all endpoints
- `EMPLOYEE` — access to their own data, enrolled courses, shift applications

---

## Default Credentials

After running `node prisma/seed.js`:

| Role | Email | Password |
|---|---|---|
| Admin | `admin@leadnurse.com` | `Admin@123` |
| Test Employee | `amara.okonkwo@leadnurse-test.com` | `Password@123` |

> Change the admin password immediately in a production environment.
