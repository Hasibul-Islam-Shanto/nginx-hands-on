# NGINX Load Balancer Lab

A hands-on environment to test and compare multiple **Load Balancing Algorithms** across three backend application instances using NGINX and Docker Compose.

---

## Architecture Overview

```
                                    ┌───> [ Server 1 (:3001) ]
[ Client / load-test.sh ] ───> [ NGINX Load Balancer (:80) ] ┼───> [ Server 2 (:3001) ]
                                    └───> [ Server 3 (:3001) ]
```

NGINX sits in front of three independent Node.js container instances (`server1`, `server2`, `server3`), distributing incoming HTTP traffic based on the active upstream algorithm.

---

## 1. Quick Start

Start all services (NGINX + 3 Backend Containers):

```bash
cd load-balancer

# Build and start all 4 containers in the background
docker compose up -d --build
```

Verify running containers:
```bash
docker compose ps
```

---

## 2. Running the Load Balancer Test Suite

Run the included load-testing script to send 100 concurrent requests:

```bash
./load-test.sh
```

### Side-by-Side Results Display:
```text
=====================================================================
 Sending 100 requests to http://localhost/app1/ (concurrency: 10) ...
=====================================================================

======================= TRAFFIC DISTRIBUTION =======================
┌─────────────────────────┬─────────────────────────┬─────────────────────────┐
│         SERVER 1        │         SERVER 2        │         SERVER 3        │
├─────────────────────────┼─────────────────────────┼─────────────────────────┤
│ Container: 5b9e2c6c39a8 │ Container: 4a123f81e821 │ Container: 9d871a2c0199 │
│ Requests:  34           │ Requests:  33           │ Requests:  33           │
│ Share:     34.0%        │ Share:     33.0%        │ Share:     33.0%        │
└─────────────────────────┴─────────────────────────┴─────────────────────────┘
Total Requests: 100  |  Target: http://localhost/app1/  |  Concurrency: 10
```

---

## 3. Switching Load Balancing Algorithms

To test different algorithms, edit `nginx/nginx.conf` and reload NGINX without restarting Docker:

```bash
# Reload NGINX instantly after changing nginx.conf
docker compose exec nginx nginx -s reload
```

### Supported Algorithms in `nginx/nginx.conf`:

#### 1. Round Robin (Default)
Distributes requests sequentially and equally across all healthy backend nodes.
```nginx
upstream app1 {
    server server1:3001;
    server server2:3001;
    server server3:3001;
}
```

#### 2. Weighted Round Robin
Routes disproportionately more traffic to higher-capacity servers.
```nginx
upstream app1 {
    server server1:3001 weight=3; # Receives ~60% of all traffic
    server server2:3001 weight=1; # Receives ~20%
    server server3:3001 weight=1; # Receives ~20%
}
```

#### 3. Least Connections (`least_conn;`)
Routes requests to whichever backend currently has the fewest active, in-flight connections (ideal for long-running queries or WebSocket sessions).
```nginx
upstream app1 {
    least_conn;
    server server1:3001;
    server server2:3001;
    server server3:3001;
}
```

#### 4. IP Hash (`ip_hash;`)
Uses client IP hashing to ensure a given user consistently routes to the same backend server (sticky sessions).
```nginx
upstream app1 {
    ip_hash;
    server server1:3001;
    server server2:3001;
    server server3:3001;
}
```
*(With IP Hash, `./load-test.sh` will show 100% of traffic directed to a single node because all requests originate from `localhost`).*

#### 5. Failover / Standby (`backup;`)
Standby nodes receive 0% traffic during normal operation, activating only if all primary backends become unavailable.
```nginx
upstream app1 {
    server server1:3001;
    server server2:3001;
    server server3:3001 backup; # Only activates if server1 and server2 go down
}
```

---

## 4. Live Log Monitoring

View live upstream routing logs:

```bash
docker compose logs -f nginx
```

Log entry format:
```text
172.20.0.1 - [29/Oct/2026:04:20:00 +0000] "GET /app1/ HTTP/1.1" 200 upstream=172.20.0.3:3001 upstream_status=200
```

---

## 5. Cleaning Up

```bash
docker compose down
```

