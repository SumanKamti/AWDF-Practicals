/**
 * Central API Client for Practical 6 - Full Stack Integration
 * Primary Backend: Express + MongoDB Atlas Cloud Database
 */

export const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

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
    const errorMessage =
      (data && data.error) ||
      (typeof data === "string" ? data : `Request failed with status ${response.status}`);
    throw new Error(errorMessage);
  }

  return data;
}

/**
 * GET /tasks - Fetch all tasks from MongoDB via Express
 */
export async function getTasks() {
  const response = await fetch(`${BASE_URL}/tasks`, {
    headers: {
      Accept: "application/json",
    },
  });
  return handleResponse(response);
}

/**
 * POST /tasks - Create a new task in MongoDB
 * @param {string} title
 * @param {string} status - 'ongoing' | 'complete' | 'incomplete'
 */
export async function createTask(title, status = "ongoing") {
  const response = await fetch(`${BASE_URL}/tasks`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
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
    headers: {
      Accept: "application/json",
    },
  });
  return handleResponse(response);
}

/**
 * GET /tasks/logs - Fetch activity logs from MongoDB
 */
export async function getLogs() {
  const response = await fetch(`${BASE_URL}/tasks/logs`, {
    headers: {
      Accept: "application/json",
    },
  });
  return handleResponse(response);
}

/**
 * Get PDF export download URL
 */
export function getExportPdfUrl() {
  return `${BASE_URL}/tasks/export-pdf`;
}

// Export default object for flexible import syntax
const api = {
  BASE_URL,
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getLogs,
  getExportPdfUrl,
};

export default api;
