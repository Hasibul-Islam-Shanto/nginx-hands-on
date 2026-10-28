# NGINX HTTP Caching Lab (API & Browser Assets)

A hands-on, production-grade practice lab demonstrating both **Server-Side Reverse Proxy Caching (`proxy_cache`)** and **Client-Side Browser Asset Caching (`Cache-Control`)**.

---

## Architecture Overview

```
[ Client / Browser ] ───(HTTP)───> [ NGINX Reverse Proxy :8080 ] ───(Cache Miss: 350ms)───> [ Node.js Express API :5001 ]
        │                                      │                                                  │
        │                                      ▼                                                  ▼
        │                              ┌───────────────┐                                   (Simulates heavy
        │                              │  proxy_cache  │                                    database query)
        │                              │ (Disk/RAM 1ms)│
        │                              └───────────────┘
        ▼
   Browser Cache
(CSS, JS, SVG: 7 days)
```

---

## 1. Quick Start

Run both services (Node.js Backend and NGINX) using Docker Compose:

```bash
cd http-caching

# Build and start containers in the background
docker compose up -d --build
```

Access the interactive visual dashboard:
👉 **[http://localhost:8080](http://localhost:8080)**

---

## 2. What Is Being Demonstrated

### A. Server-Side Reverse Proxy Caching (`/api/products`)
* **First Request:** NGINX does not have the response in cache (**`X-Cache-Status: MISS`**). It queries the Node.js backend.
  * **Latency:** ~`350ms` (simulating database work).
  * **Action:** NGINX simultaneously responds to the client AND saves the JSON file to disk under `/var/cache/nginx/api_cache`.
* **Subsequent Requests (within 15s):** NGINX detects a cached copy (**`X-Cache-Status: HIT`**).
  * **Latency:** ~`1ms`!
  * **Key takeaway:** The Node.js backend is **never invoked**, zero database queries occur.
* **Cache Expiration:** After 15 seconds, the status transitions to **`EXPIRED`**, causing NGINX to re-fetch and update the cache.
* **Forced Bypass:** Sending the header `Cache-Bypass: 1` tells NGINX to bypass the cache (**`X-Cache-Status: BYPASS`**).

### B. Client-Side Browser Asset Caching (`/css/`, `/js/`, `/images/`)
* Static files (`style.css`, `app.js`, `logo.svg`, `caching-architecture.svg`) receive:
  ```http
  Cache-Control: public, max-age=604800, immutable
  Expires: <7 days later>
  ```
* Browsers store these files locally on disk/memory. Subsequent page refreshes load instantly with **0ms transfer time and 0 bytes transferred**.

---

## 3. Automated CLI Test Loader

We include a test script that validates the full cache lifecycle and runs a 20-request benchmark:

```bash
./test-cache.sh
```

### Expected Output:
```text
==========================================================================
          NGINX HTTP CACHING VERIFICATION & BENCHMARK SUITE               
==========================================================================
Target Endpoint: http://localhost:8080/api/products

--- STEP 1: Cold Cache Request (Expect: MISS) ---
  Cache Status : MISS
  Response Time: 354 ms
  ✅ SUCCESS: First request resulted in a Cache MISS (Backend queried).

--- STEP 2: Warm Cache Request (Expect: HIT) ---
  Cache Status : HIT
  Response Time: 2 ms
  ⚡ SUCCESS: Second request resulted in a Cache HIT (Served from NGINX disk/RAM)!
  🚀 Speedup: ~177x faster than direct backend query!

--- STEP 3: Forced Cache Bypass (Expect: BYPASS) ---
  Header sent  : 'Cache-Bypass: 1'
  Cache Status : BYPASS
  ✅ SUCCESS: NGINX bypassed proxy cache and queried backend.

--- STEP 4: 20-Request Batch Benchmark ---
Firing 20 concurrent requests...

┌─────────────────────────────────────────────────────────────┐
│                    BENCHMARK RESULTS                        │
├─────────────────────────────────────────────────────────────┤
│  Total Requests Sent        : 20                            │
│  Cache HITs (Served 1ms)    : 20 (100% of batch)            │
│  Cache MISSes               : 0                             │
│  Real Backend Invocations   : 2                             │
└─────────────────────────────────────────────────────────────┘
💡 The backend was ONLY called 2 times for all requests combined!
```

---

## 4. Key NGINX Directives Explained

| Directive in `nginx/nginx.conf` | Purpose |
| :--- | :--- |
| `proxy_cache_path ... keys_zone=API_CACHE:10m` | Defines where on disk cache files are stored and allocates 10MB RAM for key lookups. |
| `proxy_cache API_CACHE;` | Activates the cache zone for a specific location. |
| `proxy_cache_valid 200 15s;` | Defines cache time-to-live (TTL) for HTTP 200 responses. |
| `proxy_cache_bypass $http_cache_bypass;` | Instructs NGINX to skip the cache when client sends the specified header. |
| `add_header X-Cache-Status $upstream_cache_status;` | Injects headers (`HIT`, `MISS`, `BYPASS`, `EXPIRED`) for client verification. |
| `expires 7d; add_header Cache-Control ...` | Instructs browsers and CDNs to cache static assets for 7 days. |

---

## 5. Cleaning Up

To shut down the lab:
```bash
docker compose down -v
```
*(The `-v` flag also clears the cached disk volume).*

