# Fullstack Todo Application

A distributed Todo & Workflow Management application built with **React.js**, **Node.js (Express)**, and **MongoDB (Docker)**, styled with the dark emerald cyberpunk glassmorphism aesthetic inspired by `@static-site`.

---

## Architecture Overview

```
+--------------------------------------------------------------+
| React 18 Single Page App (Vite on :5173)                     |
|  - Plus Jakarta Sans + Fira Code typography                  |
|  - Dark emerald glassmorphic cards and ambient glow          |
|  - Live MongoDB & backend status badge                       |
+------------------------------+-------------------------------+
                               |
                               | Reverse proxy / HTTP (:5001)
                               v
+--------------------------------------------------------------+
| Node.js Express REST API (:5001)                             |
|  - Full CRUD endpoints: /api/todos                           |
|  - Health & Diagnostics endpoint: /api/health                |
|  - Mongoose ODM Data Layer                                   |
+------------------------------+-------------------------------+
                               |
                               | Mongoose TCP (:27017)
                               v
+--------------------------------------------------------------+
| MongoDB 7.0 (Docker Container: fullstack-mongodb)            |
|  - Running in Docker Compose                                 |
|  - Volume: fullstack_mongodb_data (persistent data storage)  |
+--------------------------------------------------------------+
```

---

## 1. Prerequisites & Services

### MongoDB via Docker
The MongoDB database runs via Docker Compose:
```bash
# Start MongoDB in the background
docker compose up -d

# Check container status
docker ps --filter "name=fullstack-mongodb"

# View logs
docker compose logs -f mongodb

# Stop MongoDB
docker compose down
```

---

## 2. Running Backend (Node.js & Express)

```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5001`
- Diagnostics: `http://localhost:5001/api/health`
- Todos API: `http://localhost:5001/api/todos`

---

## 3. Running Frontend (React & Vite)

```bash
cd frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:5173`
- Configured with Vite proxy forwarding `/api` requests to backend on port `5001`.

---

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | System health check (MongoDB connection status & RAM) |
| `GET` | `/api/todos` | List all tasks with optional filters (`status`, `category`, `search`) |
| `GET` | `/api/todos/stats` | Aggregated metrics (total, active, completed, high priority) |
| `POST` | `/api/todos` | Create a new task |
| `PATCH` | `/api/todos/:id` | Update task title, description, category, priority, completed |
| `DELETE` | `/api/todos/:id` | Delete task by ID |
| `POST` | `/api/todos/seed` | Seed initial development workflow tasks |
| `DELETE` | `/api/todos/bulk/completed` | Clear all completed tasks |
| `PATCH` | `/api/todos/bulk/toggle-all` | Mark all tasks completed or active |
