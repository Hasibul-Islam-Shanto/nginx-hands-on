# NGINX HTTP Compression Lab (Gzip)

A practical demonstration of **HTTP Payload Compression (Gzip)** using NGINX to dramatically reduce bandwidth usage and improve page load times for text and JSON assets.

---

## Architecture & How It Works

```
[ Client / Browser ] ──── (Accept-Encoding: gzip) ────> [ NGINX Web Server ]
         │                                                       │
         │                                                       ▼ (File: users.json ~1.8 MB)
         │                                                 [ Gzip Engine ] (Level 6)
         │                                                       │
         ▼                                                       ▼ (~110 KB)
[ Client Decompresses ] <── (Content-Encoding: gzip) ────────────┘
```

1. **Client Request:** The client advertises compression support with `Accept-Encoding: gzip`.
2. **NGINX Filter:** If the MIME type matches `gzip_types` and the size exceeds `gzip_min_length`, NGINX compresses the payload in-flight.
3. **Response:** NGINX returns the compressed binary payload with `Content-Encoding: gzip` and `Vary: Accept-Encoding`.

---

## 1. Quick Start

Start the compression test container using Docker Compose:

```bash
cd http-compression

# Start NGINX with test data mounted
docker compose up -d
```

---

## 2. Benchmark Compression Savings

Run the included automated benchmark script:

```bash
./test-compression.sh
```

### Sample Output:
```text
==========================================================================
                   NGINX HTTP COMPRESSION TEST BENCHMARK                  
==========================================================================
Target Endpoint: http://localhost:8081/users.json

┌─────────────────────────────────────────────────────────────┐
│                    BENCHMARK RESULTS                        │
├─────────────────────────────────────────────────────────────┤
│  Uncompressed Transfer Size : 1847782 bytes (~1804 KB)      │
│  Gzip Compressed Size       : 112520 bytes (~109 KB)        │
│  Bandwidth Reduction        : 93% saved                     │
└─────────────────────────────────────────────────────────────┘

--- Response Headers with Gzip ---
Content-Type: application/json
Vary: Accept-Encoding
Content-Encoding: gzip
```

---

## 3. Manual Testing via cURL

### Request Without Compression:
```bash
curl -s http://localhost:8081/users.json | wc -c
# Output: ~1,847,782 bytes
```

### Request With Compression:
```bash
curl -s -H "Accept-Encoding: gzip" http://localhost:8081/users.json | wc -c
# Output: ~112,520 bytes (~93% bandwidth reduction!)
```

---

## 4. Key NGINX Directives Explained

| Directive | Recommended Value | Purpose |
| :--- | :--- | :--- |
| `gzip on;` | `on;` | Enables the Gzip compression module. |
| `gzip_comp_level` | `5` or `6` | Compression level (1–9). 5-6 is the production sweet spot (balances CPU usage with size reduction). |
| `gzip_min_length` | `1024;` (1 KB) | Prevents compressing tiny files where compression header overhead increases total size. |
| `gzip_vary on;` | `on;` | Injects `Vary: Accept-Encoding` header so CDNs and proxies don't serve gzipped data to non-supporting clients. |
| `gzip_proxied any;` | `any;` | Compresses responses proxied from upstream backend APIs. |
| `gzip_types` | `text/* application/json ...` | Whitelist of text-based formats to compress. |

> [!WARNING]
> **Never compress images (JPEG, PNG, WebP) or video files!**  
> Media files are already compressed. Applying Gzip to them wastes CPU cycles and can actually increase the final transfer size.

---

## 5. Cleaning Up

```bash
docker compose down
```

