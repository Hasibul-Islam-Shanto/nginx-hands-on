# Static Site Serving with NGINX

Demonstrates how to configure NGINX as an ultra-fast, lightweight web server for delivering static HTML, CSS, JavaScript, and media assets.

---

## How It Works

NGINX serves static files using the Linux kernel's `sendfile` syscall, which transfers file data directly from disk cache to the network socket buffer (**zero-copy**), bypassing userspace memory entirely.

```
[ Browser ] ───(HTTP GET /)───> [ NGINX ] ───(Zero-Copy sendfile)───> [ index.html on Disk ]
```

---

## 1. NGINX Configuration Breakdown

From [static-site.conf](./static-site.conf):

```nginx
server {
    listen 80;
    server_name localhost;

    # Root directory where files are located
    root /var/www/static-site;
    index index.html;

    # Handle client routing and fallback
    location / {
        try_files $uri $uri/ =404;
    }
}
```

### Key Directives:
* **`root`**: The base folder on disk from which files will be served.
* **`index index.html;`**: The default file returned when a directory path (e.g. `/`) is requested.
* **`try_files $uri $uri/ =404;`**:
  1. Checks if an exact matching file exists (`$uri`).
  2. If not, checks if a directory exists (`$uri/`).
  3. If neither exists, returns a `404 Not Found` error.

---

## 2. Running Locally with Docker

You can test this static site using the official NGINX Docker image:

```bash
cd reverse-proxy/static-site

# Run NGINX container mapping port 8082
docker run -d --name static-site-demo \
  -p 8082:80 \
  -v $(pwd)/static-site.conf:/etc/nginx/conf.d/default.conf:ro \
  -v $(pwd):/var/www/static-site:ro \
  nginx:alpine
```

Visit:
👉 **[http://localhost:8082](http://localhost:8082)**

---

## 3. Stopping the Container

```bash
docker stop static-site-demo && docker rm static-site-demo
```

