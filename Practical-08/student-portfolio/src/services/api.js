/**
 * Central API Client for Practical 7 - Authentication and Middleware Pipeline
 * Primary Backend: Express + JWT Authentication + MongoDB Atlas Cloud Database
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export const TOKEN_STORAGE_KEY = "portfolio_auth_token";
export const USER_STORAGE_KEY = "portfolio_auth_user";

/**
 * Get current stored JWT token
 */
export function getAuthToken() {
  return localStorage.getItem(TOKEN_STORAGE_KEY) || "";
}

/**
 * Common headers helper that automatically attaches Bearer token if available
 */
export function getAuthHeaders(customHeaders = {}) {
  const token = getAuthToken();
  const headers = {
    Accept: "application/json",
    ...customHeaders,
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Common helper to handle HTTP responses and error messages
 */
async function handleResponse(response) {
  const contentType = response.headers.get("content-type");
  let data;

  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    if (response.status === 401) {
      window.dispatchEvent(new CustomEvent("auth:unauthorized", { detail: { status: 401 } }));
    }

    const errorMessage =
      (data && data.error) ||
      (typeof data === "string" ? data : `Request failed with status ${response.status}`);
    throw new Error(errorMessage);
  }

  return data;
}

// ==========================================
// 🔐 AUTHENTICATION API METHODS
// ==========================================

/**
 * POST /register - Register new account with bcrypt password hashing
 */
export async function registerUser(name, email, password) {
  const response = await fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, password }),
  });
  return handleResponse(response);
}

/**
 * POST /login - Login and obtain signed JWT token
 */
export async function loginUser(email, password) {
  const response = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, password }),
  });
  return handleResponse(response);
}

/**
 * POST /auth/google - Authenticate using Google OAuth ID token
 */
export async function googleAuth(credential) {
  const response = await fetch(`${BASE_URL}/auth/google`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ credential }),
  });
  return handleResponse(response);
}

/**
 * POST /auth/forgot-password - Send password reset OTP
 */
export async function forgotPassword(email) {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email }),
  });
  return handleResponse(response);
}

/**
 * POST /auth/reset-password - Verify OTP and update password
 */
export async function resetPassword(email, otp, newPassword) {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ email, otp, newPassword }),
  });
  return handleResponse(response);
}

/**
 * GET /me - Get authenticated user profile using decoded JWT
 */
export async function getCurrentUser() {
  const response = await fetch(`${BASE_URL}/me`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

// ==========================================
// 📋 PROTECTED TASK & LOG API METHODS
// ==========================================

/**
 * GET /tasks - Fetch all tasks for authenticated user
 */
export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * POST /tasks - Create a new task (Protected)
 * All tasks start as 'incomplete'
 * @param {string} title
 * @param {string} status - 'incomplete' | 'ongoing' | 'complete'
 */
export async function createTask(title, status = "incomplete") {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ title, status }),
  });
  return handleResponse(response);
}

/**
 * PUT /tasks/:id - Update an existing task in MongoDB
 * @param {number|string} id
 * @param {string|object} payload - title string or object { title, status }
 */
export async function updateTask(id, payload) {
  const body = typeof payload === "string" ? { title: payload } : payload;
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "PUT",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify(body),
  });
  return handleResponse(response);
}

/**
 * DELETE /tasks/:id - Delete a task from MongoDB
 * @param {number|string} id
 */
export async function deleteTask(id) {
  const response = await fetch(`${BASE_URL}/tasks/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * GET /tasks/logs - Fetch activity logs from MongoDB
 */
export async function getLogs() {
  const response = await fetch(`${BASE_URL}/tasks/logs`, {
    headers: getAuthHeaders(),
  });
  return handleResponse(response);
}

/**
 * Get PDF export download URL with auth token query param
 */
export function getExportPdfUrl() {
  const token = getAuthToken();
  return `${BASE_URL}/tasks/export-pdf${token ? `?token=${encodeURIComponent(token)}` : ""}`;
}

/**
 * POST /contact - Send contact message directly to Jay
 * @param {object} param0 { name, email, message }
 */
export async function sendContactMessage({ name, email, message }) {
  const response = await fetch(`${BASE_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({ name, email, message }),
  });
  return handleResponse(response);
}

// Export default object for flexible import syntax
const api = {
  BASE_URL,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
  getAuthToken,
  getAuthHeaders,
  registerUser,
  loginUser,
  googleAuth,
  forgotPassword,
  resetPassword,
  getCurrentUser,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getLogs,
  getExportPdfUrl,
  sendContactMessage,
};

export default api;
