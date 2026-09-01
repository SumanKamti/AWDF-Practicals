# Practical 7: Authentication and Middleware Pipeline

## 📌 Practical Overview
This practical implements **JWT-based Authentication**, **bcrypt password hashing**, and a structured **Express Middleware Pipeline** connecting a **React (Vite) Single Page Application** with an **Express REST API Server** and **MongoDB Atlas Cloud Database**.

### Key Additions in Practical 7:
- **User Authentication (`/register`, `/login`, `/me`)**:
  - Secure password hashing using **`bcryptjs`** (salt rounds = 10).
  - JWT token generation upon login (`process.env.JWT_SECRET`, 1-hour expiration).
  - `/me` endpoint returns decoded JWT user session info.
- **Middleware Pipeline**:
  - **Authentication Middleware (`authMiddleware`)**: Verifies `Authorization: Bearer <token>` with `jwt.verify()` in a try/catch block to prevent crashes from expired or tampered tokens.
  - **Input Validation Middleware (`validateRegisterInput`, `validateLoginInput`, `validateTaskInput`)**: Validates email formats, passwords ($\ge 6$ characters), and non-empty task titles before requests reach controllers.
  - **Error-Handling Middleware**: Structured JSON error formatting and status codes (`400`, `401`, `404`, `409`, `500`).
- **Protected Routes & User Scoping**:
  - All task operations (`GET /tasks`, `POST /tasks`, `PUT /tasks/:id`, `DELETE /tasks/:id`, `GET /tasks/logs`, `GET /tasks/export-pdf`) are guarded by `authMiddleware`.
  - Tasks and activity audit logs are scoped to the authenticated user.
- **Frontend Auth Integration**:
  - React **`AuthContext`** managing user state, tokens, and `localStorage` persistence.
  - Interactive **Auth Modal** (Login / Register switching + show/hide password).
  - Token interceptor in `src/services/api.js` attaching Bearer tokens automatically.
  - Automatic `401 Unauthorized` handling prompting users when sessions expire.
  - Responsive **Navbar** showing user profile avatar and Login/Logout controls.

---

## 🏛️ System Architecture & Middleware Pipeline Flow

```text
Client Request (Browser / Postman)
       │
       ▼
[Request Logger Middleware]
       │
       ▼
[CORS & JSON Content-Type Validation Middleware]
       │
       ├──► Public Auth Routes:
       │    ├── POST /register ──► [validateRegisterInput] ──► [bcrypt.hash] ──► Save User ──► Return JWT
       │    └── POST /login    ──► [validateLoginInput]    ──► [bcrypt.compare] ──► Sign JWT ──► Return Token
       │
       └──► Protected Routes (/tasks, /me, /tasks/logs, /tasks/export-pdf):
            │
            ▼
            [authMiddleware] ──► Verifies 'Authorization: Bearer <token>' ──► 401 if missing/invalid/expired
            │
            ▼
            [validateTaskInput / validateTaskId] ──► 400 if missing required fields
            │
            ▼
            [Route Controller] ──► Scoped MongoDB Atlas Operations ──► Return 200/201 JSON
```

---

## 📁 Project Structure

```text
Practical-07/
├── .gitignore
├── README.md
├── backend/
│   ├── .env                    # (DB_TYPE=cloud, CLOUD_DB_URI, JWT_SECRET, PORT=5000)
│   ├── .env.example
│   ├── cloud-db.js             # Dedicated Cloud Atlas Connector
│   ├── db.js                   # Mongoose Models (User, Task, ActivityLog) & Connection
│   ├── package.json            # express, mongoose, bcryptjs, jsonwebtoken, pdfkit, cors
│   └── server.js               # Express Server + Auth Middleware Pipeline + Task Routes
└── student-portfolio/
    ├── .env                    # (VITE_API_BASE_URL=http://localhost:5000)
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Main Router, Dark Mode State, AuthProvider & AuthModal
        ├── App.css             # Modern Theme, Tabs, Badges, Auth Modal, Locked View
        ├── api.js              # Re-export of central API
        ├── context/
        │   └── AuthContext.jsx # React Context for global auth state, login, register, logout
        ├── services/
        │   └── api.js          # Central API Client (Token Interceptor, Auth & Task APIs)
        ├── utils/
        │   └── pdfExport.js    # Client-side PDF Report Generator (jsPDF + autoTable)
        ├── components/
        │   ├── Navbar.jsx      # Navigation Bar with User Profile Badge & Logout
        │   ├── AuthModal.jsx   # Login & Register Modal with Validation
        │   ├── Todo.jsx        # Task Form, Status Tabs, Filter, and Item List
        │   ├── ActivityLogs.jsx# Activity Audit Trail from MongoDB Atlas
        │   ├── Toast.jsx
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── About.jsx
        │   └── Skills.jsx
        └── pages/
            ├── Home.jsx
            ├── Task.jsx        # JWT-Protected Task Management Workspace
            ├── Projects.jsx
            ├── Contact.jsx
            ├── Certificates.jsx
            └── NotFound.jsx
```

---

## 🌐 API Endpoints Reference

### 🔐 Authentication Routes (Public)

| Method | Endpoint | Description | Request Body | Response Status |
|---|---|---|---|---|
| **POST** | `/register` | Register new user with bcrypt hash | `{ "name": "Suman", "email": "suman@example.com", "password": "password123" }` | `201 Created` |
| **POST** | `/login` | Authenticate user & receive JWT token | `{ "email": "suman@example.com", "password": "password123" }` | `200 OK` |

### 📋 Protected Task Routes (`Authorization: Bearer <token>` Required)

| Method | Endpoint | Description | Request Body / Params | Response Status |
|---|---|---|---|---|
| **GET** | `/me` | Retrieve authenticated user profile | None | `200 OK` |
| **GET** | `/tasks` | Retrieve user's tasks from MongoDB | None | `200 OK` |
| **POST** | `/tasks` | Create new task with input validation | `{ "title": "Implement JWT", "status": "ongoing" }` | `201 Created` |
| **PUT** | `/tasks/:id` | Update task title and/or status | `{ "title": "...", "status": "complete" }` | `200 OK` |
| **DELETE** | `/tasks/:id` | Delete user task by ID | None | `200 OK` |
| **GET** | `/tasks/logs` | Fetch activity audit trail logs | None | `200 OK` |
| **GET** | `/tasks/export-pdf` | Stream authenticated PDF report | None (or `?token=...`) | `200 OK (application/pdf)` |
| **GET** | `/health` | Server & Database Health Status | None | `200 OK` |

---

## 💡 Key Conceptual Questions (Viva / Lab Evaluation)

### Q1: Why must passwords be hashed before storage using bcrypt instead of saved as plain text?
> **Answer**: Storing passwords in plain text creates an extreme security vulnerability. If a database is breached or leaked, attackers gain instant access to every user's credentials across all services where they reuse that password. **bcrypt** is a salted, one-way adaptive cryptographic hashing algorithm designed to be intentionally computationally intensive (work factor), making brute-force and rainbow table dictionary attacks infeasible.

### Q2: What does authentication middleware actually verify, and what happens if the token is missing or expired?
> **Answer**: `authMiddleware` extracts the JSON Web Token from the `Authorization: Bearer <token>` header, verifies its cryptographic signature against the server's `JWT_SECRET`, checks the expiration timestamp (`exp`), and decodes the payload to attach `req.user`. If the token is missing, malformed, or expired, `jwt.verify()` throws an error caught in a `try/catch` block, immediately returning `401 Unauthorized` without crashing the Node.js process.

### Q3: Why should input validation happen on the server even if the frontend already validates the same fields?
> **Answer**: Client-side validation is purely for user experience and can be completely bypassed by disabling JavaScript, using tools like Postman/cURL, or crafting direct HTTP requests. Server-side validation acts as the authoritative security gatekeeper that protects the database from malicious, corrupted, or malformed data injection before reaching query execution.

---

## 🚀 How to Run Locally

You will need **two terminal windows**:

### Terminal 1: Backend Server (`http://localhost:5000`)
```bash
cd backend
npm install
npm start
# or: node server.js
```
*Backend connects to MongoDB Atlas Cloud, runs with JWT secret, and listens on port `5000`.*

### Terminal 2: React Frontend (`http://localhost:5173`)
```bash
cd student-portfolio
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 📮 Postman Testing Guide

1. **Register User**:
   - `POST http://localhost:5000/register`
   - Body (JSON): `{"name": "Suman Kamti", "email": "suman@test.com", "password": "password123"}`
   - Response: `201 Created` with `token` and `user` object.
2. **Login User**:
   - `POST http://localhost:5000/login`
   - Body (JSON): `{"email": "suman@test.com", "password": "password123"}`
   - Response: `200 OK` with signed `token`.
3. **Access Protected Route**:
   - `GET http://localhost:5000/tasks`
   - Headers: `Authorization: Bearer <COPIED_JWT_TOKEN>`
   - Response: `200 OK` with user's tasks.
4. **Test Protected Route Without Token**:
   - `GET http://localhost:5000/tasks` without header.
   - Response: `401 Unauthorized` with clear error message.