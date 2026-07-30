# Practical 4 - Task Manager with Express and React

## Objective
This practical focuses on building a simple full-stack task management application using Express for the backend and React for the frontend. The goal is to demonstrate CRUD operations, API integration, and middleware handling.

## Problem Statement
Create a task management application where users can:
- View all tasks
- Add a new task
- Update an existing task
- Delete a task

The frontend should interact with a backend API built using Express, and the application should handle errors and logging properly.

## Technologies
- React
- Vite
- Express.js
- Node.js
- CORS
- Fetch API

## Folder Structure
```text
Practical-04/
├── backend/
│   ├── package.json
│   └── server.js
├── student-portfolio/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── public/
│   └── src/
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       ├── main.jsx
│       ├── components/
│       │   ├── About.jsx
│       │   ├── Footer.jsx
│       │   ├── Header.jsx
│       │   ├── Navbar.jsx
│       │   ├── Skills.jsx
│       │   └── Todo.jsx
│       └── pages/
│           ├── Contact.jsx
│           ├── Home.jsx
│           ├── NotFound.jsx
│           ├── Projects.jsx
│           └── Task.jsx
```

## API Endpoints
### Tasks
- GET /tasks
  - Fetch all tasks
- POST /tasks
  - Create a new task
- PUT /tasks/:id
  - Update a task by ID
- DELETE /tasks/:id
  - Delete a task by ID

## Status Codes
- 200 OK
- 201 Created
- 400 Bad Request
- 403 Forbidden (used for edit-limit enforcement)
- 404 Not Found
- 500 Internal Server Error

## Middleware
The backend includes:
- CORS middleware
- Logging middleware
- JSON body parsing middleware
- Content-Type validation middleware
- Global error handler
- 404 handler

## Features
- Add task
- View task list
- Edit task
- Delete task
- Backend logging
- Error responses
- Edit limit protection after repeated updates

## Learning Outcome
By completing this practical, students learn:
- How to build a simple Express server
- How to create RESTful API routes
- How to connect a React frontend with a backend API
- How to handle errors and middleware in Express
- How to manage CRUD operations in a full-stack application
