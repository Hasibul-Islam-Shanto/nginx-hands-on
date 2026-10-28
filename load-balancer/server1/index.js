const os = require('os');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;
const SERVER_NAME = process.env.SERVER_NAME || 'server1';
const HOSTNAME = os.hostname();
let requestCount = 0;

app.use((req, res, next) => {
  console.log(`[${SERVER_NAME} | ${HOSTNAME}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

// Standard endpoint (supports ?delay=<ms> to simulate slow requests)
app.get('/', (req, res) => {
  requestCount++;
  const delay = parseInt(req.query.delay, 10) || 0;

  setTimeout(() => {
    res.json({
      message: `Hello from ${SERVER_NAME}`,
      serverName: SERVER_NAME,
      hostname: HOSTNAME,
      requestCount,
      delayMs: delay,
    });
  }, delay);
});

// Dedicated slow endpoint for testing least_conn load balancing
app.get('/slow', (req, res) => {
  requestCount++;
  const duration = 3000;
  console.log(`[${SERVER_NAME}] Handling long-running request (3s)...`);

  setTimeout(() => {
    res.json({
      message: `Completed slow request from ${SERVER_NAME}`,
      serverName: SERVER_NAME,
      hostname: HOSTNAME,
      requestCount,
      durationMs: duration,
    });
  }, duration);
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: SERVER_NAME, hostname: HOSTNAME });
});

app.listen(PORT, () => {
  console.log(`${SERVER_NAME} [${HOSTNAME}] running on http://localhost:${PORT}`);
});
