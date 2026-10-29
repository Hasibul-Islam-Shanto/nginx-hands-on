# Fullstack Application with NGINX Reverse Proxy

A production-grade, distributed Todo & Workflow Management application built with **React (Vite)**, **Node.js (Express)**, and **MongoDB (Docker)**, unified behind an **NGINX Reverse Proxy** with optional SSL/TLS encryption.

---

## Architecture Overview

```
+---------------------------------------------------------------------------------+
| Browser (Client)                                                                |
|   Visiting: http://localhost:5173 (or https://<your-domain>)                    |
+---------------------------------------------------------------------------------+
                                       |
                                       v
+---------------------------------------------------------------------------------+
| Frontend Container (fullstack-frontend:80 mapped to :5173)                      |
|  - Multi-stage build (Vite React bundle + Alpine NGINX web server)              |
|  - Serves static assets with client-side SPA fallback (try_files $uri /index.html) |
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
```

* **Frontend UI:** [http://localhost:5173](http://localhost:5173)
* **Backend API Health:** [http://localhost:5001/api/health](http://localhost:5001/api/health)
* **MongoDB:** `localhost:27017`

To view live service logs:
```bash
docker compose logs -f
```

To shut down the entire stack:
```bash
docker compose down
```

---

## 2. NGINX Reverse Proxy Configuration

From [frontend/nginx.conf](./frontend/nginx.conf):

```nginx
server {
    listen 80;
    server_name localhost;

    # 1. Serve static frontend assets with SPA fallback
    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # 2. Reverse proxy API requests to Node.js backend container
    location /api/ {
        proxy_pass http://backend:5001/api/;
        proxy_http_version 1.1;

        # Upstream proxy headers
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 3. Production Deployment with Domain & HTTPS (SSL)

To run with a custom domain (e.g. `app.yourdomain.com`) over secure HTTPS:

### Step 1: DNS & Firewall
1. Add an **A record** in your DNS provider pointing `<your-subdomain>` to your server's Public IPv4 address.
2. In your cloud firewall (e.g. AWS Security Group), open **Port 80 (HTTP)** and **Port 443 (HTTPS)** to `0.0.0.0/0`.

### Step 2: Obtain Free SSL Certificate via Certbot
```bash
# Temporarily free up port 80
docker compose down

# Generate certificate using Certbot standalone mode
sudo certbot certonly --standalone -d <your-domain.com>

# Ensure permissions allow Docker access
sudo chmod -R 755 /etc/letsencrypt/archive
sudo chmod -R 755 /etc/letsencrypt/live
```

### Step 3: Update `docker-compose.yml` Ports and Volume
```yaml
  frontend:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### Step 4: Add SSL to NGINX
Configure `listen 443 ssl;` with certificate paths pointing to:
* `ssl_certificate /etc/letsencrypt/live/<your-domain>/fullchain.pem;`
* `ssl_certificate_key /etc/letsencrypt/live/<your-domain>/privkey.pem;`

Add an automatic HTTP to HTTPS redirect on port 80:
```nginx
server {
    listen 80;
    server_name <your-domain.com>;
    return 301 https://$host$request_uri;
}
```

---

## 4. Local Development Without Full Containers

If you prefer running MongoDB in Docker while editing frontend or backend code with hot-reload:

```bash
cd reverse-proxy/fullstack-app

# 1. Start MongoDB only
docker compose up -d mongodb

# 2. Run both frontend and backend concurrently in watch mode
npm run dev
```

---

## 5. Container Details

| Container Name | Service | Base Image | Internal Port | Host Port | Role |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `fullstack-frontend` | `frontend` | `nginx:alpine` | `80` | `5173` | Serves compiled React app & proxies `/api/` |
| `fullstack-backend` | `backend` | `node:20-alpine` | `5001` | `5001` | Express REST API & Mongoose |
| `fullstack-mongodb` | `mongodb` | `mongo:7.0` | `27017` | `27017` | Persistent document storage |
