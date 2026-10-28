# AWDF Practicals – Portfolio Web Application

## About
This project is a personal developer portfolio web application built as part of the Advanced Web Development Framework (AWDF) laboratory curriculum (Practicals 1–13). It showcases developer skills, projects, and contact channels, while integrating full-stack capabilities including user authentication, an interactive task management dashboard, asynchronous processing, containerization, CI/CD, and generative AI.

## Key Features
- **Portfolio Showcase:** Multi-page responsive portfolio featuring dynamic GitHub repository integration, contact form with automated email dispatch, and dark/light theme switching.
- **Task Management:** Secure task dashboard with user-scoped CRUD operations, task locking, status filtering, activity audit trail logging, and client-side PDF export.
- **Authentication & Security:** User registration and login powered by JWT and bcrypt password hashing, Google OAuth integration, and Nodemailer OTP email verification.
- **AI Task Assistance:** Automated task description generator using the Google Gen AI SDK (`@google/genai` with `gemini-3.8-flash`), featuring server-side rate limiting (1 request per task per minute), request timeouts, and graceful manual fallback.
- **Performance & Events:** In-memory query caching via `node-cache`, route-level code splitting with `React.lazy`, and decoupled background event notifications using Node.js `EventEmitter`.
- **DevOps & Automation:** Multi-stage Docker containerization with Nginx reverse proxying, Docker Compose orchestration, and automated test pipelines via GitHub Actions.

## Tech Stack
- **Frontend:** React 19, Vite, React Router, SweetAlert2, FontAwesome, jsPDF
- **Backend:** Node.js, Express.js 5, Mongoose 9, JWT, bcryptjs, Nodemailer, node-cache, @google/genai
- **Database:** MongoDB Atlas (Cloud)
- **DevOps:** Docker, Docker Compose, Nginx, GitHub Actions

## Run Locally

### 1. Configure Environment
Copy the example environment file and configure your credentials:
```bash
cp backend/.env.example backend/.env
```
Set `MONGODB_URI` with your MongoDB Atlas connection string and provide a `JWT_SECRET`. Adding a `GEMINI_API_KEY` is required only for live AI description generation; manual task creation remains fully functional without it.

### 2. Start the Backend
```bash
cd backend
npm install
npm start
```
The backend server runs on `http://localhost:5000`.

### 3. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The client application runs on `http://localhost:5173`.

## Docker
Run the complete stack (frontend and backend) using Docker Compose:
```bash
docker compose up --build -d
docker compose down
```

## Testing
Run automated unit tests and production build checks using the configured scripts:

- **Backend Tests:**
  ```bash
  cd backend
  npm test
  ```
- **Frontend Tests:**
  ```bash
  cd frontend
  npm test
  ```
- **Production Build:**
  ```bash
  cd frontend
  npm run build
  ```

## Security
All sensitive values—including MongoDB Atlas connection strings, JWT secrets, and Gemini API keys—must remain in local `.env` files and must never be committed to source control. Use the provided `.env.example` templates for configuration reference.