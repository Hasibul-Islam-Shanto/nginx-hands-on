# Fullstack Todo Application

A distributed Todo & Workflow Management application built with **React.js**, **Node.js (Express)**, and **MongoDB (Docker)**, styled with the dark emerald cyberpunk glassmorphism aesthetic inspired by `@static-site`.

---

## Architecture Overview

```
+---------------------------------------------------------------------------------+
| Browser (User)                                                                  |
|   Visiting: http://localhost:5173                                               |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| Frontend Container (fullstack-frontend:80 mapped to :5173)                      |
|  - Multi-stage build (Vite React bundle + Alpine NGINX web server)              |
|  - Serves static assets with client-side SPA fallback                           |
|  - Reverse-proxies /api/ requests directly to http://backend:5001/api/          |
+---------------------------------------------------------------------------------+
                                       |
                       Docker Network (fullstack-network)
                                       v
+---------------------------------------------------------------------------------+
| Backend Container (fullstack-backend:5001 mapped to :5001)                      |
|  - Node.js 20 Alpine with Express REST API                                      |
|  - Endpoints: /api/todos, /api/health, /api/todos/stats                         |
|  - Mongoose ODM connecting to mongodb:27017                                     |
+---------------------------------------------------------------------------------+
                                       |
                       Docker Network (fullstack-network)
                                       v
+---------------------------------------------------------------------------------+
| Database Container (fullstack-mongodb:27017 mapped to :27017)                   |
|  - Official Mongo 7.0 daemon                                                    |
|  - Persistent storage volume: fullstack_mongodb_data                            |
+---------------------------------------------------------------------------------+
```

---

## 1. Quick Start: Run Everything with Docker Compose

To build and start all three tiers (Database, Backend API, and Frontend with NGINX):

```bash
cd reverse-proxy/fullstack-app

# Build and start all services in the background
docker compose up -d --build

# Verify running containers
docker compose ps

# View live logs
docker compose logs -f
```

- **Frontend UI:** [http://localhost:5173](http://localhost:5173)
- **Backend API:** [http://localhost:5001/api/health](http://localhost:5001/api/health)
- **MongoDB:** `localhost:27017`

To shut down the stack:
```bash
docker compose down
```

---

## 2. Local Development Without Full Containers

If you only want MongoDB in Docker while editing code locally:

```bash
cd reverse-proxy/fullstack-app

# 1. Start MongoDB only
docker compose up -d mongodb

# 2. Run both frontend and backend concurrently in watch mode
npm run dev
```

Or run them in separate terminals:
```bash
npm run server   # Node.js backend with watch mode (:5001)
npm run client   # React Vite dev server (:5173)
```

---

## 3. Container Details

| Container Name | Service | Base Image | Internal Port | Host Port | Role |
|---|---|---|---|---|---|
| `fullstack-frontend` | `frontend` | `nginx:alpine` | `80` | `5173` | Serves compiled React app & proxies `/api/` |
| `fullstack-backend` | `backend` | `node:20-alpine` | `5001` | `5001` | Express REST API & Mongoose |
| `fullstack-mongodb` | `mongodb` | `mongo:7.0` | `27017` | `27017` | Persistent document storage |
