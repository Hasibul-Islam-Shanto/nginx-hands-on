import express from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// In-memory counter to track real backend invocations
let backendHitCount = 0;
let lastInvokedAt = null;

// Logging middleware
app.use((req, res, next) => {
  console.log(`[Backend HIT #${backendHitCount + 1}] ${req.method} ${req.url} at ${new Date().toISOString()}`);
  next();
});

// Heavy endpoint: Simulates an expensive database query (350ms delay)
app.get('/api/products', (req, res) => {
  backendHitCount++;
  lastInvokedAt = new Date().toISOString();

  const simulatedDbDelay = 350; // ms

  setTimeout(() => {
    res.json({
      success: true,
      data: [
        { id: 1, name: 'Cloud Server Pro', category: 'Compute', price: 99.99, inStock: true },
        { id: 2, name: 'High-Speed SSD Storage', category: 'Storage', price: 49.50, inStock: true },
        { id: 3, name: 'Enterprise Load Balancer', category: 'Network', price: 149.00, inStock: false },
        { id: 4, name: 'Managed Redis Cluster', category: 'Database', price: 79.00, inStock: true },
      ],
      meta: {
        backendInvocation: backendHitCount,
        generatedAt: lastInvokedAt,
        simulatedDbLatencyMs: simulatedDbDelay,
        source: 'Computed directly by Node.js Backend',
      },
    });
  }, simulatedDbDelay);
});

// Fast stats endpoint to observe backend invocations
app.get('/api/stats', (req, res) => {
  res.json({
    totalBackendInvocations: backendHitCount,
    lastInvokedAt,
    uptimeSeconds: Math.floor(process.uptime()),
  });
});

// Reset counter
app.post('/api/reset', (req, res) => {
  backendHitCount = 0;
  lastInvokedAt = null;
  res.json({ message: 'Backend hit counter reset to 0' });
});

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'caching-backend' });
});

app.listen(PORT, () => {
  console.log(`🚀 Caching Demo Backend running on http://localhost:${PORT}`);
});

