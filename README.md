# NGINX Architecture & Production Labs

A comprehensive, hands-on repository covering core **NGINX** architectural concepts, configuration patterns, and containerized implementations—from reverse proxying and load balancing to HTTP microcaching and Gzip compression.

---

## What is NGINX?

**NGINX** (pronounced *"engine-x"*) is an open-source, high-performance HTTP web server, reverse proxy, load balancer, and HTTP cache. 

Unlike traditional web servers (like Apache) that create a new thread or process for every incoming connection, NGINX uses an **event-driven, asynchronous, non-blocking architecture**.

```
                           [ Master Process ] (Reads config, binds ports)
                                   │
         ┌─────────────────────────┼─────────────────────────┐
         ▼                         ▼                         ▼
 [ Worker Process 1 ]      [ Worker Process 2 ]      [ Worker Process 3 ]
 (Event Loop / epoll)      (Event Loop / epoll)      (Event Loop / epoll)
         │                         │                         │
 ═════════════════════════════════════════════════════════════════════════
         10,000+ Concurrent Non-Blocking Client Connections per Worker
```

### Why NGINX Matters:
* **The C10K / C100K Problem:** Handles tens of thousands of simultaneous connections per worker with predictable, low memory consumption (~2–5 MB RAM per worker).
* **Zero-Copy File Serving:** Utilizes the Linux kernel's `sendfile()` system call to transfer files directly from disk to network sockets without copying into userspace memory.
* **Unified Gateway:** Shields backend microservices, manages SSL termination, normalizes HTTP headers, and eliminates CORS complexity.

---

## Core Working Areas of NGINX

```
                              ┌──> 1. Static File Serving (sendfile zero-copy)
                              ├──> 2. Reverse Proxy (API routing, header rewriting)
[ Incoming HTTP/S Traffic ] ──┼──> 3. Load Balancing (Round Robin, least_conn, ip_hash)
                              ├──> 4. HTTP Caching (proxy_cache & browser Cache-Control)
                              ├──> 5. HTTP Compression (Gzip text/json ~85% reduction)
                              └──> 6. SSL/TLS Termination (Let's Encrypt / Certbot)
```

1. **Reverse Proxying:** Sits between public clients and private application servers to protect backend infrastructure, manage request buffering, and unify routing.
2. **Load Balancing:** Distributes incoming traffic across horizontal backend clusters to ensure high availability, prevent bottlenecks, and handle failover.
3. **HTTP Caching:** Caches dynamic API responses directly on the edge (`proxy_cache`) to drop response latencies from ~350ms to ~1ms while saving database resources.
4. **HTTP Compression:** Compresses text, JSON, and SVG data in-flight using Gzip/Brotli, reducing bandwidth consumption by 70–95%.
5. **Static File Serving:** Delivers compiled frontend bundles (React, Vue, static HTML) at maximum wire speed.
6. **SSL/TLS Termination:** Offloads cryptographic computation from application servers, managing HTTPS certificates centrally.

---

## Hands-On Labs Directory

This repository is organized into self-contained, containerized modules. Each module contains its own configuration, Docker Compose setup, and testing utilities:

| Module | Description | Quick Link |
| :--- | :--- | :---: |
| ⚡ **HTTP Caching** | Interactive web dashboard demonstrating server-side API caching (`proxy_cache`) and browser asset caching (`Cache-Control`) with automated benchmark loader. | [**Explore Lab**](./http-caching/README.md) |
| ⚖️ **Load Balancer** | Multi-server traffic distribution across 3 backend instances testing Round Robin, Least Connections, IP Hash, and Standby failover with side-by-side terminal reporting. | [**Explore Lab**](./load-balancer/README.md) |
| 🗜️ **HTTP Compression** | Hands-on Gzip compression lab demonstrating a ~93% bandwidth reduction on large JSON payloads with compression level tuning. | [**Explore Lab**](./http-compression/README.md) |
| 🌐 **Fullstack Reverse Proxy** | Three-tier production application unifying a React SPA, Node.js REST API, and MongoDB behind an NGINX reverse proxy with SSL/HTTPS configuration. | [**Explore Lab**](./reverse-proxy/fullstack-app/README.md) |
| 📄 **Static Site Serving** | Ultra-fast zero-copy static file delivery demonstrating directory index resolution, SPA fallback (`try_files`), and MIME type handling. | [**Explore Lab**](./reverse-proxy/static-site/README.md) |

---

## Quick Reference: Essential NGINX Commands

### When Running via Docker Compose:
```bash
# Test configuration syntax inside container
docker compose exec nginx nginx -t

# Reload configuration with zero downtime (after editing nginx.conf)
docker compose exec nginx nginx -s reload

# View live access & upstream routing logs
docker compose logs -f nginx
```

### When Running Directly on Host OS (e.g. Ubuntu):
```bash
# Test configuration syntax
sudo nginx -t

# Graceful reload (does not terminate active client connections)
sudo systemctl reload nginx

# Check service status
sudo systemctl status nginx
```

---

## Cleanliness & Privacy Assurance

This codebase is clean, modular, and privacy-safe:
* All domain references use generic placeholders (`<your-domain.com>`, `localhost`).
* All IP addresses use local interfaces (`127.0.0.1`, `0.0.0.0`).
* Secrets, environment variables (`.env`), private keys (`*.pem`, `*.key`), and operating system artifacts (`.DS_Store`) are excluded via `.gitignore`.

