# Practical 6: Full Stack Integration (React + Node.js + Express + MongoDB Atlas)

## 📌 Practical Overview
This practical demonstrates a complete full-stack integration connecting a **React (Vite) Single Page Application** with an **Express.js REST API Server** and **MongoDB Atlas Cloud Database (Primary)**.

It includes:
- **Central API Client** with reusable CRUD functions.
- **MongoDB Atlas Cloud Persistence** that retains all tasks across server and browser restarts.
- **Status Filter Tabs**: All, Ongoing, Complete, Incomplete with dynamic counters.
- **Direct Status Updates**: Quick status changing from dropdowns with live MongoDB synchronization.
- **Task PDF Export**: Downloads structured PDF reports with statistics summary, table formatting, and color badges.
- **MongoDB Activity Audit Trail Logs**: Tracks what task was performed, by which user, and at what exact timestamp.
- **SweetAlert2 Alerts & Modals**: Beautiful confirmation modals for deletes, toasts for create/update/status changes, and error handling.
- **Font Awesome Icons**: Professional iconography for buttons, tabs, status indicators, and actions.
- **Contact Page**: Responsive contact form with live synchronized preview.

---

## 🏛️ System Architecture

```text
React Frontend (http://localhost:5173)
        │
        ▼ (Central API: src/services/api.js)
Express Backend (http://localhost:5000)
        │
        ▼ (Mongoose Schema & Models: Task & ActivityLog)
MongoDB Atlas Cloud Database (Cluster: PracticeDB)
```

---

## 📁 Project Structure

```text
Practical-06/
├── .gitignore
├── README.md
├── backend/
│   ├── .env                    # (DB_TYPE=cloud, CLOUD_DB_URI, PORT=5000)
│   ├── .env.example            # (Environment Template)
│   ├── .gitignore
│   ├── cloud-db.js             # Dedicated Cloud Atlas Connector
│   ├── db.js                   # Mongoose dual-mode DB connector & Models (Task, ActivityLog)
│   ├── package.json
│   └── server.js               # Express API Server with CORS, CRUD, Logs & PDF Export
└── student-portfolio/
    ├── .env                    # (VITE_API_BASE_URL=http://localhost:5000)
    ├── .env.example
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx             # Main Router & Dark Mode State
        ├── App.css             # Modern CSS, Tabs, Badges, Logs, Dark Mode
        ├── api.js              # Re-export of central API
        ├── services/
        │   └── api.js          # Central API Client (CRUD, Logs, PDF)
        ├── utils/
        │   └── pdfExport.js    # Client-side PDF Report Generator (jsPDF + autoTable)
        ├── components/
        │   ├── Navbar.jsx      # Navigation Bar with Dark Mode Toggle
        │   ├── Todo.jsx        # Task Form, Status Tabs, Filter, and Item List
        │   ├── ActivityLogs.jsx # Activity Audit Trail from MongoDB Atlas
        │   ├── Toast.jsx       # Custom Toast Component
        │   ├── Header.jsx
        │   ├── Footer.jsx
        │   ├── About.jsx
        │   └── Skills.jsx
        └── pages/
            ├── Home.jsx
            ├── Task.jsx        # Full-Stack CRUD with SweetAlert2 & MongoDB Atlas
            ├── Projects.jsx
            ├── Contact.jsx     # Modern Contact Form with Live Preview
            ├── Certificates.jsx
            └── NotFound.jsx
```

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
*Backend will connect to MongoDB Atlas and listen on port `5000`.*

### Terminal 2: React Frontend (`http://localhost:5173`)
```bash
cd student-portfolio
npm install
npm run dev
```
*Open [http://localhost:5173](http://localhost:5173) in your browser.*

---

## 🌐 API Endpoints Reference

| Method | Endpoint | Description | Request Body | Response Status |
|---|---|---|---|---|
| **GET** | `/tasks` | Retrieve all tasks from MongoDB Atlas | None | `200 OK` |
| **POST** | `/tasks` | Create and save a new task with status | `{ "title": "...", "status": "ongoing" }` | `201 Created` |
| **PUT** | `/tasks/:id` | Update task title and/or status | `{ "title": "...", "status": "complete" }` | `200 OK` |
| **DELETE** | `/tasks/:id` | Delete a task from MongoDB Atlas | None | `200 OK` |
| **GET** | `/tasks/logs` | Fetch activity audit trail logs | None | `200 OK` |
| **GET** | `/tasks/export-pdf` | Stream server-side generated PDF report | None | `200 OK (application/pdf)` |
| **GET** | `/health` | Health check & active DB status | None | `200 OK` |

---

## ✨ Checklist & Features Implemented

1. **MongoDB Atlas Cloud as Primary Database**:
   - Cleaned up unused files (`firebase.js`).
   - Retained the two DB connector files (`db.js` and `cloud-db.js`).
   - `DB_TYPE=cloud` is set as default.
   - Tasks and logs persist permanently in MongoDB Atlas Cloud (`PracticeDB`).
2. **Task PDF Download**:
   - Added instant PDF download option using `jsPDF` + `jspdf-autotable`.
   - Generates a PDF containing document header, summary statistics box (Total, Completed, Ongoing, Incomplete), color-coded status badges, and timestamps.
3. **Status Tabs View (Ongoing, Complete, Incomplete)**:
   - Filter tabs: **All**, **Ongoing**, **Complete**, **Incomplete** with live item count badges.
   - Users can update status directly from each task item via the quick dropdown changer or edit form.
4. **MongoDB Activity Audit Trail Logs**:
   - Saves every user action to MongoDB Atlas (`CREATE`, `UPDATE`, `STATUS_CHANGE`, `DELETE`).
   - Shows action badge, details, timestamp, and user ("Guest User / Admin").
   - Includes real-time refresh and toggleable UI.
5. **SweetAlert2 Alerts**:
   - Modern SweetAlert2 confirmation dialog for task deletion (`Swal.fire`).
   - Success toast notifications for task creation, update, status change, and PDF generation.
   - Error popups for network failures.
6. **Font Awesome Icons**:
   - Clean icons for Add, Edit, Delete, PDF Download, Status indicators (Clock, CheckCircle, TimesCircle), and Audit Logs.
7. **Contact Page UI**:
   - Contact Info cards, styled form inputs, and real-time live preview.

---