# Practical 5 - Task Manager with Express, MongoDB (Local & Cloud), and React

## Objective
This practical focuses on building a full-stack task management application using Express, Mongoose/MongoDB (Local & Cloud Atlas), and React (Vite). The goal is to demonstrate CRUD operations, persistent database storage, environment variable security, API integration, and middleware handling.

## Problem Statement
Create a full-stack task management application where users can:
- View all tasks from MongoDB (Local or Cloud Atlas)
- Add a new task
- Update an existing task
- Delete a task

The frontend interacts with an Express REST API with environment variable configuration (`.env`), keeping sensitive database credentials secure from GitHub.

## Technologies
- **Frontend**: React, Vite, React Router, CSS
- **Backend**: Node.js, Express.js, Mongoose, Dotenv, CORS
- **Database**: MongoDB Local (`mongodb://127.0.0.1:27017`) & MongoDB Atlas Cloud Cluster

---

## Folder Structure
```text
Practical-05/
├── .gitignore
├── README.md
├── backend/
│   ├── .env                # (Ignored by Git - Secret credentials)
│   ├── .env.example        # (Committed - Template)
│   ├── .gitignore
│   ├── cloud-db.js         # Cloud Atlas MongoDB connector
│   ├── db.js               # Dual-mode (Local / Cloud) DB connector
│   ├── package.json
│   └── server.js           # Express REST API Server
└── student-portfolio/
    ├── .env                # (Ignored by Git - Frontend env)
    ├── .env.example        # (Committed - Frontend template)
    ├── .gitignore
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx
        ├── components/
        └── pages/
            └── Task.jsx
```

---

## Setup & Configuration

### 1. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Create your `.env` file (copied from `.env.example`):
   ```env
   PORT=5000
   NODE_ENV=development

   # Choose database: "cloud" or "local"
   DB_TYPE=cloud

   # Cloud MongoDB (Atlas)
   CLOUD_DB_URI=mongodb+srv://<username>:<password>@cluster0.xxxx.mongodb.net/<database_name>?retryWrites=true&w=majority

   # Local MongoDB
   LOCAL_DB_URI=mongodb://127.0.0.1:27017/MyPortfolioToDo

   # Frontend Origin for CORS
   CLIENT_URL=http://localhost:5173
   ```
3. Start the backend:
   ```bash
   npm start
   # or: node server.js
   ```

### 2. Frontend Setup
1. Navigate to the student-portfolio directory:
   ```bash
   cd student-portfolio
   npm install
   ```
2. Start the development server:
   ```bash
   npm run dev
   ```

---

## API Endpoints
- `GET /tasks` - Fetch all tasks
- `POST /tasks` - Create a new task
- `PUT /tasks/:id` - Update a task by ID
- `DELETE /tasks/:id` - Delete a task by ID
- `GET /health` - Health check & active database status

## Security & Best Practices
- `.env` files are added to `.gitignore` so database passwords and cluster URIs are never pushed to GitHub.
- Safe templates (`.env.example`) are provided for team collaboration.
- DNS SRV fallback using Google DNS prevents `querySrv ECONNREFUSED` issues on university and restricted Wi-Fi networks.
