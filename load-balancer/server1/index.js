const os = require('os');
const express = require('express');

const app = express();
const PORT = process.env.PORT || 3001;
const HOSTNAME = os.hostname();
let requestCount = 0;

app.use((req, res, next) => {
  console.log(`[${HOSTNAME}] ${req.method} ${req.url} from ${req.ip}`);
  next();
});

app.get('/', (req, res) => {
  requestCount++;
  res.json({
    message: 'Hello from Server 1',
    hostname: HOSTNAME,
    requestCount,
  });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', server: 'server1', hostname: HOSTNAME });
});

app.listen(PORT, () => {
  console.log(`Server 1 [${HOSTNAME}] running on http://localhost:${PORT}`);
});
