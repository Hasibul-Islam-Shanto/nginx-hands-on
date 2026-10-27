const express = require('express');

const app = express();
const PORT = process.env.PORT || 3002;

app.get('/', (req, res) => {
  res.json({ message: 'Hello from Server 2' });
});

app.get('/info', (req, res) => {
  res.json({ name: 'server2', version: '1.0.0' });
});

app.listen(PORT, () => {
  console.log(`Server 2 running on http://localhost:${PORT}`);
});
