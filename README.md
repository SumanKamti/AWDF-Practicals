# Advanced Web Development Framework (AWDF) - Laboratory Practicals

[![React](https://img.shields.io/badge/Frontend-React%2019%20%7C%20Vite-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![Express.js](https://img.shields.io/badge/Backend-Express.js%205-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB Atlas](https://img.shields.io/badge/Database-MongoDB%20Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![JWT](https://img.shields.io/badge/Auth-JWT%20%2B%20Bcrypt-000000?logo=jsonwebtokens&logoColor=white)](https://jwt.io/)
[![Google OAuth](https://img.shields.io/badge/OAuth-Google%20Identity%20Services-4285F4?logo=google&logoColor=white)](https://developers.google.com/identity)
[![Nodemailer](https://img.shields.io/badge/Email-Nodemailer%20OTP-0A85EA?logo=gmail&logoColor=white)](https://nodemailer.com/)

---

## 📖 About This Repository

This repository contains the complete laboratory work for the **Advanced Web Development Framework (AWDF)** course at **CSPIT, CHARUSAT**.

The curriculum is designed as a **progressive learning journey** from basic frontend components to an enterprise-grade full-stack web application. All exercises (Practicals 1 through 11) are unified into this production-ready application featuring:
- A responsive, multi-page **React (Vite) Student Portfolio & Task Management Application**.
- A secure **Express.js REST API Server**.
- Cloud persistence via **MongoDB Atlas** and containerized persistence via **MongoDB 7.0**.
- Comprehensive security with **JWT authentication, bcrypt password hashing, Google OAuth, and Nodemailer OTP email verification**.
- Full-stack containerization via **Docker & Docker Compose**.

---

## 🎓 Progressive Curriculum Mapping (Practicals 1 – 11)

The table below illustrates how each practical syllabus requirement is implemented and integrated into this unified codebase:

| Practical | Title & Focus | Key Concepts Implemented | Core Project Files |
|---|---|---|---|
| **Practical 1** | **Introduction to React & Component Architecture** | Vite tooling, Component hierarchy, Props passing, Rendering dynamic lists with `.map()`. | `frontend/src/components/Header.jsx`<br>`frontend/src/components/About.jsx`<br>`frontend/src/components/Skills.jsx`<br>`frontend/src/components/Footer.jsx` |
| **Practical 2** | **React Routing & State Management** | Client-side routing with `react-router-dom`, Multi-page layout, Active link styling, `useState` hook for dynamic interaction, Global Dark/Light mode theme toggle, Controlled forms. | `frontend/src/App.jsx`<br>`frontend/src/components/Navbar.jsx`<br>`frontend/src/pages/Home.jsx`<br>`frontend/src/pages/Projects.jsx`<br>`frontend/src/pages/Contact.jsx`<br>`frontend/src/pages/NotFound.jsx` |
| **Practical 3** | **REST API Integration & Dynamic State** | Third-party REST API consumption (GitHub Repositories API), Asynchronous data fetching with `useEffect` and `fetch()`, Loading states, Error handling, Search and language filtering. | `frontend/src/pages/Projects.jsx` |
| **Practical 4** | **Full-Stack Task Manager & Express Middleware** | Express.js REST API, CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE` `/tasks`), Middleware pipeline (CORS, Request logger, JSON validator, Content-Type check), Centralized error handling, HTTP status codes. | `backend/server.js`<br>`frontend/src/pages/Task.jsx`<br>`frontend/src/components/Todo.jsx` |
| **Practical 5** | **Persistent Storage with MongoDB & Mongoose** | Dual-mode database connectivity (Local MongoDB `127.0.0.1:27017` and MongoDB Atlas Cloud), Mongoose schema design with timestamps and validation, Environment variable security (`.env`). | `backend/db.js`<br>`backend/cloud-db.js`<br>`backend/.env.example`<br>`frontend/.env.example` |
| **Practical 6** | **Full-Stack Integration, Audit Logs & PDF Export** | End-to-end integration via centralized API client (`api.js`), Status filter tabs with dynamic task counts, Real-time status toggle, Activity audit trail in MongoDB Atlas, PDF report export, SweetAlert2 modals, Font Awesome icons. | `frontend/src/services/api.js`<br>`frontend/src/components/ActivityLogs.jsx`<br>`frontend/src/utils/pdfExport.js`<br>`backend/server.js` |
| **Practical 7** | **Authentication & Security Pipeline** | User registration and login, `bcryptjs` password hashing, JWT token signing and verification, `authMiddleware`, React `AuthContext` session persistence. *(Includes Bonus / Practical 7 Extension: Google OAuth GIS, Nodemailer OTP verification, per-user task sandboxing & task locking in `backend/mailer.js`).* | `backend/server.js`<br>`backend/db.js`<br>`backend/mailer.js`<br>`frontend/src/context/AuthContext.jsx`<br>`frontend/src/components/AuthModal.jsx` |
| **Practical 8** | **Performance Optimization & Lazy Loading** | Route-based code splitting via `React.lazy()` and dynamic `import()` for Projects and Contact, Accessible luxury `<LoadingFallback />` Suspense indicator, Component-level lazy loading for heavy `ActivityLogs` audit panel, `React.memo` profiling to eliminate redundant re-renders, and bundle size reduction. | `frontend/src/App.jsx`<br>`frontend/src/components/LoadingFallback.jsx`<br>`frontend/src/components/LoadingFallback.css`<br>`frontend/src/pages/Task.jsx`<br>`frontend/src/components/Footer.jsx`<br>`docs/performance/` |
| **Practical 9** | **In-Memory Caching & Query Optimization** | Backend in-memory caching using `node-cache` (60s TTL), user-scoped cache keys (`tasks:user:<userId>:list`, `tasks:user:<userId>:item:<id>`), cache hit/miss resolution, automatic cache invalidation on write operations (`POST`, `PUT`, `DELETE`), safe metrics endpoint (`/api/tasks/cache-stats`), and single task endpoint (`GET /api/tasks/:id`). | `backend/cache.js`<br>`backend/server.js`<br>`backend/package.json`<br>`frontend/src/services/api.js` |
| **Practical 10** | **Asynchronous Processing with Event-Driven Architecture** | Decoupled background notifications using Node.js built-in `EventEmitter` (`TaskEvents` singleton), dedicated listeners (`task-created`, `task-deleted`, `notification-error`), non-blocking HTTP response initiation with timestamps, and 2-second simulated background delay. | `backend/events.js`<br>`backend/listeners.js`<br>`backend/server.js` |
| **Practical 11** | **Docker & Docker Compose Containerization** | Multi-stage Docker build for React/Vite with Nginx, production Node.js Dockerfile for Express, 3-tier Compose architecture (frontend, backend, mongodb), bridge network (`app-network`), persistent named volume (`awdf_mongodb_data`), and health-checked container dependencies. | `docker-compose.yml`<br>`frontend/Dockerfile`<br>`frontend/nginx.conf`<br>`backend/Dockerfile`<br>`.env.example` |

---

## 🏛️ System Architecture

```text
                               +-----------------------------+
                               |     Client Browser (SPA)    |
                               | React 19 + Vite (Port 5173) |
                               +--------------+--------------+
                                              |
                   HTTP Requests / REST API   |   Bearer JWT / Google Credential Token
                                              v
+-----------------------------------------------------------------------------------------+
|                               Express.js Server (Port 5000)                             |
|                                                                                         |
|  [ Request Logger ] ──► [ CORS & Security ] ──► [ JSON Content-Type Validator ]         |
|                                                                                         |
|  Public Endpoints:                                                                      |
|   ├── POST /register      ──► [ validateRegisterInput ] ──► [ Send OTP / Hash Password ]|
|   ├── POST /verify-otp    ──► [ Validate OTP ]          ──► [ Create User & Sign JWT ]  |
|   ├── POST /login         ──► [ validateLoginInput ]    ──► [ bcrypt.compare & Sign JWT]|
|   ├── POST /auth/google   ──► [ Google TokenInfo API ]  ──► [ Link/Create & Sign JWT ]  |
|   └── POST /contact       ──► [ Send Notification Email to Admin ]                      |
|                                                                                         |
|  Protected Endpoints (authMiddleware):                                                  |
|   ├── GET  /me            ──► Returns authenticated user session payload                |
|   ├── GET  /tasks         ──► Isolated tasks query: Task.find({ userId })               |
|   ├── POST /tasks         ──► Create task scoped to authenticated user                  |
|   ├── PUT  /tasks/:id     ──► Check task lock status & update scoped task               |
|   ├── DELETE /tasks/:id   ──► Delete scoped task                                        |
|   ├── GET  /tasks/logs    ──► Activity logs query: ActivityLog.find({ userId })         |
|   └── GET  /tasks/export-pdf ──► Generate filtered PDF (Date Range / Status)            |
+------------------------------------+----------------------------------------------------+
                                     |
                         Mongoose ODM Connection
                                     v
+-----------------------------------------------------------------------------------------+
|                               MongoDB Atlas Cloud Cluster                               |
|                                                                                         |
|  Collections:                                                                           |
|   ├── users         (name, email, passwordHash, googleId, authProvider, isVerified)    |
|   ├── tasks         (title, status, isLocked, userId, userEmail, createdAt, updatedAt)  |
|   └── activitylogs  (action, details, user, userId, timestamp)                         |
+-----------------------------------------------------------------------------------------+
```

---

## 📁 Repository Directory Structure

```text
AWDF-Practicals/
├── .gitignore                      # Root Git ignore rules (node_modules, .env, dist)
├── README.md                       # Comprehensive course & project documentation
│
├── backend/                        # Express.js REST API Server
│   ├── .env                        # Private environment variables (git-ignored)
│   ├── .env.example                # Environment variables template
│   ├── .gitignore                  # Backend-specific ignore rules
│   ├── cloud-db.js                 # Dedicated MongoDB Atlas cloud connector
│   ├── db.js                       # Mongoose Schemas (User, Task, ActivityLog) & dual-mode connector
│   ├── mailer.js                   # Nodemailer service (OTP verification, welcome & contact emails)
│   ├── package.json                # Dependencies: express, mongoose, bcryptjs, jsonwebtoken, nodemailer, pdfkit
│   ├── package-lock.json
│   └── server.js                   # Express server, middleware pipeline, authentication & task routes
│
└── frontend/                       # React (Vite) Single Page Application
    ├── .env                        # Frontend environment variables (git-ignored)
    ├── .env.example                # Frontend environment template
    ├── .gitignore                  # Frontend ignore rules
    ├── eslint.config.js            # ESLint rules
    ├── index.html                  # HTML entry point with Google Identity Services SDK
    ├── package.json                # Dependencies: react, react-router-dom, sweetalert2, jspdf, fontawesome
    ├── package-lock.json
    ├── vite.config.js              # Vite bundler configuration
    ├── public/                     # Static public assets
    └── src/
        ├── App.jsx                 # Main application component, Theme provider, React Router
        ├── App.css                 # Styling (Dark mode, responsive grid, badges, modals, dashboard)
        ├── index.css               # Global base styles
        ├── main.jsx                # Application DOM root mount
        ├── api.js                  # Centralized API export
        ├── context/
        │   └── AuthContext.jsx     # React Context for global auth state, JWT token, Google OAuth & OTP
        ├── services/
        │   └── api.js              # Axios-free Fetch API client with Bearer token interceptor
        ├── utils/
        │   └── pdfExport.js        # Client-side PDF generator using jsPDF & autotable
        ├── components/
        │   ├── Navbar.jsx          # Header navigation, theme toggle, user avatar, and Auth controls
        │   ├── AuthModal.jsx       # Modal for Login, Registration with OTP verification, and Google Sign-In
        │   ├── Todo.jsx            # Task manager dashboard, status tabs, search & lock/unlock controls
        │   ├── ActivityLogs.jsx    # Real-time audit trail logs viewer
        │   ├── Toast.jsx           # Custom toast notifications
        │   ├── Header.jsx          # Hero section component
        │   ├── About.jsx           # Student profile & background component
        │   ├── Skills.jsx          # Technical skills dynamic list
        │   └── Footer.jsx          # Footer component
        └── pages/
            ├── Home.jsx            # Landing / Portfolio overview page
            ├── Task.jsx            # Authenticated task manager workspace
            ├── Projects.jsx        # GitHub API live repository browser
            ├── Contact.jsx         # Contact page with live preview & email dispatch
            ├── Certificates.jsx    # Academic and professional credentials showcase
            └── NotFound.jsx        # 404 Error page
```

---

## 🛠️ Technology Stack

### Frontend
- **Framework:** React 19 (Vite)
- **Routing:** React Router DOM v7
- **Icons:** Font Awesome Free Solid Icons
- **Alerts & Modals:** SweetAlert2
- **PDF Generation:** jsPDF & jsPDF-AutoTable
- **Styling:** CSS3 (Variables, Flexbox, CSS Grid, Dark/Light Themes)
- **Authentication SDK:** Google Identity Services (`accounts.google.com/gsi/client`)

### Backend
- **Runtime:** Node.js (v18+)
- **Framework:** Express.js v5
- **Database:** MongoDB Atlas (Cloud) & MongoDB Community (Local)
- **ODM:** Mongoose v9
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Email Delivery:** Nodemailer (SMTP / Gmail App Password)
- **Server PDF Generation:** PDFKit
- **Cross-Origin Handling:** CORS

---

## 🚀 Setup and Installation Guide

### Prerequisites
1. **Node.js** (v18 or newer) and **npm** installed.
2. A free **MongoDB Atlas** account or a local MongoDB installation.
3. *(Optional for emails)* A Gmail account with an **App Password** for Nodemailer.
4. *(Optional for Google login)* A Google Cloud Console **OAuth 2.0 Client ID**.

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/SumanKamti/AWDF-Practicals.git
cd AWDF-Practicals
```

---

### Step 2: Configure and Start the Backend Server

1. Navigate to the `backend` folder:
   ```bash
   cd backend
   ```

2. Install backend dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your values:
   ```env
   PORT=5000
   NODE_ENV=development

   # Database Mode: "cloud" or "local"
   DB_TYPE=cloud
   CLOUD_DB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/MyPortfolioToDo?retryWrites=true&w=majority
   LOCAL_DB_URI=mongodb://127.0.0.1:27017/MyPortfolioToDo

   # JWT Secret Key
   JWT_SECRET=your_strong_jwt_secret_key_here

   # CORS Allowed Client Origin
   CLIENT_URL=http://localhost:5173

   # Nodemailer SMTP Configuration (Optional)
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-specific-password
   ADMIN_EMAIL=your-email@gmail.com

   # Google OAuth (Optional verification)
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Start the backend server:
   ```bash
   npm start
   # Or using Node directly: node server.js
   ```
   *The server will start on `http://localhost:5000`.*

---

### Step 3: Configure and Start the React Frontend

1. Open a **second terminal window** and navigate to `frontend`:
   ```bash
   cd frontend
   ```

2. Install frontend dependencies:
   ```bash
   npm install
   ```

3. Configure frontend environment variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Ensure the API URL points to the running backend:
   ```env
   VITE_API_BASE_URL=http://localhost:5000
   VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   ```

4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🌐 REST API Endpoints Specification

### 🔐 Authentication Routes (Public)

| Method | Endpoint | Description | Request Body | Status Codes |
|---|---|---|---|---|
| `POST` | `/register` | Send OTP or initiate registration | `{ "name": "Suman", "email": "user@example.com", "password": "password123" }` | `200 OK` / `201 Created` / `400 Bad Request` |
| `POST` | `/verify-otp` | Verify email OTP and complete registration | `{ "email": "user@example.com", "otp": "123456", "name": "...", "password": "..." }` | `201 Created` / `400 Bad Request` |
| `POST` | `/login` | Authenticate user with password & return JWT | `{ "email": "user@example.com", "password": "password123" }` | `200 OK` / `401 Unauthorized` |
| `POST` | `/auth/google` | Sign in or register using Google OAuth ID Token | `{ "credential": "<GOOGLE_ID_TOKEN>" }` | `200 OK` / `401 Unauthorized` |

---

### 📋 Protected Routes (`Authorization: Bearer <token>` Required)

| Method | Endpoint | Description | Request Parameters / Body | Status Codes |
|---|---|---|---|---|
| `GET` | `/me` | Get profile information of the authenticated user | None | `200 OK` / `401 Unauthorized` |
| `GET` | `/tasks` | Fetch tasks belonging exclusively to the user | Optional query: `?status=complete&from=YYYY-MM-DD&to=YYYY-MM-DD` | `200 OK` / `401 Unauthorized` |
| `POST` | `/tasks` | Create a new task scoped to user | `{ "title": "Complete AWDF", "status": "ongoing" }` | `201 Created` / `400 Bad Request` |
| `PUT` | `/tasks/:id` | Update task details or toggle status / lock | `{ "title": "New Title", "status": "complete", "isLocked": true }` | `200 OK` / `403 Forbidden` / `404 Not Found` |
| `DELETE` | `/tasks/:id` | Delete a task belonging to the user | None | `200 OK` / `404 Not Found` |
| `GET` | `/tasks/logs` | Fetch user's activity audit trail logs | None | `200 OK` / `401 Unauthorized` |
| `GET` | `/tasks/export-pdf` | Stream generated PDF report for user's tasks | Optional query: `?from=YYYY-MM-DD&to=YYYY-MM-DD&status=all` | `200 OK (application/pdf)` |

---

### ℹ️ General Routes

| Method | Endpoint | Description | Request Body | Status Codes |
|---|---|---|---|---|
| `POST` | `/contact` | Submit contact inquiry & trigger email alerts | `{ "name": "...", "email": "...", "subject": "...", "message": "..." }` | `200 OK` / `400 Bad Request` |
| `GET` | `/health` | Health check endpoint returning server and DB status | None | `200 OK` |

---

## ⚡ Practical 8: Performance Optimization & Lazy Loading

### Objective
Optimize the React Single Page Application (SPA) load times and JavaScript bundle efficiency by implementing:
1. **Route-based Code Splitting** via `React.lazy()` and dynamic `import()` for `/projects` and `/contact`.
2. **Accessible Suspense Fallback** with a custom luxury animated spinner and zero layout shifts.
3. **Component-level Lazy Loading** for the heavy MongoDB Atlas Activity Audit Trail component (`ActivityLogs.jsx`) on the Task page.
4. **React DevTools Profiler Optimization** using `React.memo` on static elements (`Footer.jsx`) to eliminate unnecessary re-renders.

### Key Implementation Details
- **Dynamic Imports in App.jsx:**
  ```jsx
  import { lazy, Suspense } from "react";
  const Projects = lazy(() => import("./pages/Projects"));
  const Contact = lazy(() => import("./pages/Contact"));

  <Suspense fallback={<LoadingFallback message="Loading page component..." />}>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/task" element={<Task />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </Suspense>
  ```
- **Component Lazy Loading in Task.jsx:**
  ```jsx
  const ActivityLogs = lazy(() => import("../components/ActivityLogs"));
  ```

### Build & Code-Splitting Results

| Chunk | Baseline Size (Before) | Optimized Size (After) | Status |
|---|---|---|---|
| **Entry Bundle (`index-*.js`)** | 908.98 kB (gzip: 281.35 kB) | **896.99 kB** (gzip: 278.42 kB) | **Reduced by 11.99 kB** |
| **`Projects-*.js`** | Bundled in main | **6.24 kB** (gzip: 2.46 kB) | On-demand route chunk |
| **`Contact-*.js`** | Bundled in main | **5.12 kB** (gzip: 1.83 kB) | On-demand route chunk |
| **`ActivityLogs-*.js`** | Bundled in main | **2.19 kB** (gzip: 0.81 kB) | On-demand component chunk |
| **`rolldown-runtime-*.js`**| N/A | **0.56 kB** (gzip: 0.36 kB) | Dynamic chunk loader |

Detailed before/after logs, network test checklists, and Profiler findings are archived in [`docs/performance/comparison.md`](docs/performance/comparison.md).

---

## ⚡ Practical 9: In-Memory Caching & Query Optimization

### Objective
Enhance database throughput and API response latency by implementing in-memory caching with `node-cache`:
1. **Shared Cache Module (`backend/cache.js`):** Configured with a default TTL of 60 seconds and automatic garbage collection.
2. **User-Scoped Cache Keys:** Keys are strictly formatted (`tasks:user:<userId>:list` and `tasks:user:<userId>:item:<id>`) to prevent cross-user data leakage.
3. **Cache Hit / Miss Logic:**
   - On **Cache Miss**: Queries MongoDB, sets the cached object with TTL, records a miss, and tags HTTP response header `X-Cache: MISS`.
   - On **Cache Hit**: Immediately serves data from memory, records a hit, and tags HTTP response header `X-Cache: HIT`.
4. **Automated Cache Invalidation:** Write operations (`POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`) proactively purge corresponding user list and item cache keys.
5. **Single Task Fetch Route (`GET /api/tasks/:id`):** Provides cached lookups for individual tasks by their unique ID.
6. **Telemetry & Debug Endpoint (`GET /api/tasks/cache-stats`):** Exposes non-sensitive performance counters including `hits`, `misses`, `hitRatio`, `keysSet`, `keysInvalidated`, and `activeKeysCount`.

---

## ⚡ Practical 10: Asynchronous Processing with Event-Driven Architecture

### Objective
Implement decoupled, asynchronous task lifecycle notifications using Node.js's native `EventEmitter` module without external message queue dependencies:
1. **Shared Event Emitter Module (`backend/events.js`):** Extends Node.js's built-in `EventEmitter` class with a custom `TaskEvents` class, exporting a single shared instance (Singleton pattern).
2. **Decoupled Listeners Module (`backend/listeners.js`):**
   - **`task-created` Listener:** Logs execution start timestamp, simulates 2000 ms background processing (such as email alerts or webhook notifications) via `setTimeout()`, and logs task title, assigned user (`userId` from schema), and completion timestamp.
   - **`task-deleted` Listener:** Logs task deletion confirmation with task title and timestamp upon successful deletion.
   - **Custom Error Event (`notification-error` & `error`):** Safely catches and logs synchronous and asynchronous failures without throwing unhandled exceptions or sending double HTTP responses.
3. **Non-Blocking API Integration (`backend/server.js`):**
   - In `POST /tasks`, the HTTP response (`201 Created`) is initiated first and its timestamp logged. The `task-created` event is emitted immediately after.
   - In `DELETE /tasks/:id`, the event is emitted only upon successful database deletion.
   - Terminal logs demonstrate that HTTP responses complete in milliseconds and do not wait for the 2-second background notification timer.

---

## ⚡ Practical 11: Docker and Docker Compose Containerization

### 1. Architectural Overview
Practical 11 orchestrates the complete Task Management full-stack application across three isolated, interconnected container services defined in `docker-compose.yml`:

```text
                               +-----------------------------+
                               |     Client Browser (Host)   |
                               |    http://localhost:5173    |
                               +--------------+--------------+
                                              |
                   Frontend HTTP / Assets     |     REST API Calls (Bearer JWT)
                   Port 5173 ──► 80           |     Port 5000 ──► 5000
                                              v
+─────────────────────────────────────────────────────────────────────────────────────────────────+
|                                    Docker Bridge: app-network                                   |
|                                                                                                 |
|  +─────────────────────────+      +──────────────────────────+     +─────────────────────────+  |
|  |     awdf-frontend       |      |       awdf-backend       |     |       awdf-mongodb      |  |
|  |  (Nginx Alpine: Port 80)|      | (Node 20 Express: P5000) |     |   (Mongo 7.0: P27017)   |  |
|  |                         |      |                          |     |                         |  |
|  | - React 19 SPA static   |      | - Mongoose ODM           |     | - Persistent storage    |  |
|  | - SPA Router fallback   |      | - JWT & Bcrypt auth      |     | - Health check ping     |  |
|  | - Reverse Proxy /api/   |      | - Event-driven pipeline  |     | - Init database:        |  |
|  | - Gzip performance      |      | - Connects to 'mongodb'  |     |   MyPortfolioToDo       |  |
|  +─────────────────────────+      +────────────┬─────────────+     +────────────▲────────────+  |
|                                                |                                |               |
|                                                +────── Mongoose Connection ─────+               |
|                                                    mongodb://mongodb:27017                      |
+─────────────────────────────────────────────────────────────────────────────────┼───────────────+
                                                                                  |
                                                                        Named Docker Volume:
                                                                         awdf_mongodb_data
                                                                          (/data/db)
```

1. **`frontend` (Container: `awdf-frontend`):**
   - **Multi-stage Dockerfile:** Builds the React 19 application in `node:20-alpine`, embeds build-time arguments (`VITE_API_BASE_URL`), and serves the optimized production bundle with `nginx:alpine`.
   - **Nginx Configuration:** Provides SPA fallback routing (`try_files $uri $uri/ /index.html;`), gzip compression, and an optional `/api/` reverse proxy pass.
   - **Host Port Mapping:** Host port `5173` maps to Nginx container port `80`.

2. **`backend` (Container: `awdf-backend`):**
   - **Production Dockerfile:** Built on `node:20-alpine` with layer-cached `package*.json`, runs `npm start` on port `5000`.
   - **Health-Checked Dependency:** Explicitly waits for `mongodb` to achieve `service_healthy` status before booting the API server.
   - **Network Resolution:** Connects to MongoDB via internal Docker service DNS `mongodb://mongodb:27017/MyPortfolioToDo`.

3. **`mongodb` (Container: `awdf-mongodb`):**
   - **Official Image:** `mongo:7.0` configured on internal bridge network `app-network`.
   - **Health Check:** Periodic ping using `mongosh --eval "db.adminCommand('ping')"` ensuring database readiness.
   - **Persistent Storage:** Backed by the named volume `awdf_mongodb_data` mapped to `/data/db`.

---

### 2. Prerequisites
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (v24+ or newer) installed and running.
- Docker Compose v2.20+ (included with Docker Desktop).

Verify installation in PowerShell:
```powershell
docker --version
docker compose version
```

---

### 3. Environment Variables Configuration
A template configuration file [`.env.example`](.env.example) is provided in the repository root:

```env
# Server and Database
PORT=5000
NODE_ENV=production
DB_TYPE=local
LOCAL_DB_URI=mongodb://mongodb:27017/MyPortfolioToDo
MONGODB_URI=mongodb://mongodb:27017/MyPortfolioToDo

# Security and CORS
CLIENT_URL=http://localhost:5173
JWT_SECRET=your_jwt_secret_key_here

# Frontend Build Time
VITE_API_BASE_URL=http://localhost:5000
```

---

### 4. Running the Application with Docker Compose

#### Build and Start All Services
From the repository root, start all containers in detached mode:
```powershell
docker compose up --build -d
```

#### Check Running Services and Health
Verify that all 3 containers are running and MongoDB is healthy:
```powershell
docker compose ps
```

*Expected output:*
```text
NAME            IMAGE                      STATUS                    PORTS
awdf-backend    awdf-practicals-backend    Up (running)              0.0.0.0:5000->5000/tcp
awdf-frontend   awdf-practicals-frontend   Up (running)              0.0.0.0:5173->80/tcp
awdf-mongodb    mongo:7.0                  Up (healthy)              27017/tcp
```

#### View Live Container Logs
Follow live aggregated logs or inspect specific services:
```powershell
# All services
docker compose logs -f

# Backend only
docker compose logs -f backend

# Frontend only
docker compose logs -f frontend

# MongoDB only
docker compose logs -f mongodb
```

#### Access the Application
- **Frontend SPA:** [http://localhost:5173](http://localhost:5173)
- **Backend API Health Check:** [http://localhost:5000/health](http://localhost:5000/health)

---

### 5. Stopping the Containers & Data Persistence Verification

#### Standard Stop (Preserves Data)
Stop and remove containers and networks while keeping database records safe:
```powershell
docker compose down
```

> [!CAUTION]
> **Do NOT use `docker compose down -v`** for routine stops. The `-v` flag deletes all named volumes, which would erase your MongoDB tasks and user accounts!

#### Verifying MongoDB Volume Persistence
1. Start the stack: `docker compose up -d`
2. Open [http://localhost:5173](http://localhost:5173) and register an account or create tasks.
3. Stop containers: `docker compose down`
4. Inspect the volume to verify it remains intact: `docker volume ls | Select-String "mongodb_data"`
5. Restart the stack: `docker compose up -d`
6. Log in with the same account—all tasks and activity logs are completely preserved from the `awdf_mongodb_data` volume!

---

### 6. Common Troubleshooting Steps

| Issue | Root Cause | Solution |
|---|---|---|
| **Port 5000 or 5173 already in use** | A local Node server or Vite dev server is running on the host. | Stop local Node processes: `Get-Process node \| Stop-Process` or stop previous background jobs. |
| **Backend fails to connect to MongoDB** | Attempting to connect to `localhost:27017` from inside container instead of `mongodb`. | Ensure `LOCAL_DB_URI=mongodb://mongodb:27017/MyPortfolioToDo` is set in Compose or `.env`. |
| **Browser API requests fail with Network Error** | Frontend bundle was built pointing to Docker internal hostname `http://backend:5000`. | The client browser runs on the host, not inside Docker. Ensure `VITE_API_BASE_URL` is set to `http://localhost:5000`. |
| **Page refresh returns 404 in SPA** | Nginx does not route unknown paths to `index.html`. | Verify `try_files $uri $uri/ /index.html;` is present in `frontend/nginx.conf`. |

---

## 👨‍💻 Author

- **Name:** Suman Kamti
- **Enrollment / Degree:** B.Tech Computer Science and Engineering (Artificial Intelligence & Machine Learning)
- **Institution:** Chandubhai S. Patel Institute of Technology (CSPIT)
- **University:** Charotar University of Science and Technology (CHARUSAT), Changa, Gujarat, India
- **Course:** Advanced Web Development Framework (AWDF)

---

## 📜 License

This project is created for academic and laboratory assessment purposes under the AWDF course curriculum.