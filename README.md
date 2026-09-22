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

The curriculum is designed as a **progressive learning journey** from basic frontend components to an enterprise-grade full-stack web application. All exercises (Practicals 1 through 8) are unified into this production-ready application featuring:
- A responsive, multi-page **React (Vite) Student Portfolio & Task Management Application**.
- A secure **Express.js REST API Server**.
- Cloud persistence via **MongoDB Atlas**.
- Comprehensive security with **JWT authentication, bcrypt password hashing, Google OAuth, and Nodemailer OTP email verification**.

---

## 🎓 Progressive Curriculum Mapping (Practicals 1 – 8)

The table below illustrates how each practical syllabus requirement is implemented and integrated into this unified codebase:

| Practical | Title & Focus | Key Concepts Implemented | Core Project Files |
|---|---|---|---|
| **Practical 1** | **Introduction to React & Component Architecture** | Vite tooling, Component hierarchy, Props passing, Rendering dynamic lists with `.map()`. | `frontend/src/components/Header.jsx`<br>`frontend/src/components/About.jsx`<br>`frontend/src/components/Skills.jsx`<br>`frontend/src/components/Footer.jsx` |
| **Practical 2** | **React Routing & State Management** | Client-side routing with `react-router-dom`, Multi-page layout, Active link styling, `useState` hook for dynamic interaction, Global Dark/Light mode theme toggle, Controlled forms. | `frontend/src/App.jsx`<br>`frontend/src/components/Navbar.jsx`<br>`frontend/src/pages/Home.jsx`<br>`frontend/src/pages/Projects.jsx`<br>`frontend/src/pages/Contact.jsx`<br>`frontend/src/pages/NotFound.jsx` |
| **Practical 3** | **REST API Integration & Dynamic State** | Third-party REST API consumption (GitHub Repositories API), Asynchronous data fetching with `useEffect` and `fetch()`, Loading states, Error handling, Search and language filtering. | `frontend/src/pages/Projects.jsx` |
| **Practical 4** | **Full-Stack Task Manager & Express Middleware** | Express.js REST API, CRUD endpoints (`GET`, `POST`, `PUT`, `DELETE` `/tasks`), Middleware pipeline (CORS, Request logger, JSON validator, Content-Type check), Centralized error handling, HTTP status codes. | `backend/server.js`<br>`frontend/src/pages/Task.jsx`<br>`frontend/src/components/Todo.jsx` |
| **Practical 5** | **Persistent Storage with MongoDB & Mongoose** | Dual-mode database connectivity (Local MongoDB `127.0.0.1:27017` and MongoDB Atlas Cloud), Mongoose schema design with timestamps and validation, Environment variable security (`.env`). | `backend/db.js`<br>`backend/cloud-db.js`<br>`backend/.env.example`<br>`frontend/.env.example` |
| **Practical 6** | **Full-Stack Integration, Audit Logs & PDF Export** | End-to-end integration via centralized API client (`api.js`), Status filter tabs with dynamic task counts, Real-time status toggle, Activity audit trail in MongoDB Atlas, PDF report export, SweetAlert2 modals, Font Awesome icons. | `frontend/src/services/api.js`<br>`frontend/src/components/ActivityLogs.jsx`<br>`frontend/src/utils/pdfExport.js`<br>`backend/server.js` |
| **Practical 7** | **Authentication & Middleware Security Pipeline** | User registration and login, `bcryptjs` password hashing (10 salt rounds), JWT token signing and verification, `authMiddleware` for protected endpoints, Input validation middleware, React `AuthContext` for session persistence. | `backend/server.js`<br>`backend/db.js`<br>`frontend/src/context/AuthContext.jsx`<br>`frontend/src/components/AuthModal.jsx` |
| **Practical 8** | **Advanced Security, OAuth, Nodemailer OTP & Task Lock** | Strict User Data Isolation (per-user tasks and activity logs), Google OAuth Sign-In via Google Identity Services (`gsi/client`), Nodemailer OTP email verification and welcome emails, Task locking mechanism to prevent accidental edits, Date-range filtered PDF report generation. | `backend/server.js`<br>`backend/mailer.js`<br>`backend/db.js`<br>`frontend/src/context/AuthContext.jsx`<br>`frontend/src/components/AuthModal.jsx`<br>`frontend/src/pages/Task.jsx` |

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

## 👨‍💻 Author

- **Name:** Suman Kamti
- **Enrollment / Degree:** B.Tech Computer Science and Engineering (Artificial Intelligence & Machine Learning)
- **Institution:** Chandubhai S. Patel Institute of Technology (CSPIT)
- **University:** Charotar University of Science and Technology (CHARUSAT), Changa, Gujarat, India
- **Course:** Advanced Web Development Framework (AWDF)

---

## 📜 License

This project is created for academic and laboratory assessment purposes under the AWDF course curriculum.