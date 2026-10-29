# NGINX Reverse Proxy Examples

A collection of hands-on implementations demonstrating **Reverse Proxying** and **Static File Delivery** with NGINX.

---

## What is a Reverse Proxy?

A **Reverse Proxy** sits in front of one or more web applications, intercepting incoming client requests and forwarding them to the appropriate backend service.

```
[ Client Browser ] ───(Public Internet)───> [ NGINX Reverse Proxy ] ───(Internal Network)───> [ Backend API / App ]
```

### Why Use an NGINX Reverse Proxy?
1. **Security & Obfuscation:** Backend application ports, internal IPs, and operating system details are never exposed to the public internet.
2. **Unified Domain Access:** Expose frontend SPA assets and backend REST APIs under a single domain name (avoiding CORS issues).
3. **SSL/TLS Termination:** Decrypt incoming HTTPS requests at the proxy layer, passing unencrypted HTTP over the secure internal network to reduce backend CPU load.
4. **Buffer & Slow Client Protection:** NGINX handles slow mobile connections and buffering, protecting Node.js / Python event loops from starvation.

---

## Available Modules

| Directory | Description | Stack |
| :--- | :--- | :--- |
| **[`static-site/`](./static-site/)** | High-performance static web server with custom routing and fallback rules. | NGINX, HTML5, CSS3 |
| **[`fullstack-app/`](./fullstack-app/)** | Three-tier production application uniting a React SPA frontend, Express Node.js API, and MongoDB with SSL configuration. | React (Vite), Node.js, MongoDB, NGINX, Docker |

---

## Getting Started

Visit either module directory for detailed setup instructions:

* [Static Site Documentation](./static-site/README.md)
* [Fullstack App Documentation](./fullstack-app/README.md)

