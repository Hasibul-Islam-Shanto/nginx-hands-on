document.addEventListener('DOMContentLoaded', () => {
  const btnFetch = document.getElementById('btnFetch');
  const btnBenchmark = document.getElementById('btnBenchmark');
  const btnReset = document.getElementById('btnReset');
  const chkBypass = document.getElementById('chkBypass');

  const cacheStatusEl = document.getElementById('cacheStatus');
  const latencyEl = document.getElementById('latency');
  const backendHitsEl = document.getElementById('backendHits');
  const terminalLogsEl = document.getElementById('terminalLogs');
  const progressFill = document.getElementById('progressFill');

  // Helper to append log
  function addLog(text, type = 'hit') {
    const time = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `log-entry ${type}`;
    entry.innerHTML = `<span>[${time}]</span> <span>${text}</span>`;
    terminalLogsEl.appendChild(entry);
    terminalLogsEl.scrollTop = terminalLogsEl.scrollHeight;
  }

  // Update status badge UI
  function updateBadge(status) {
    cacheStatusEl.className = 'badge';
    const cleanStatus = (status || 'UNKNOWN').toUpperCase();

    if (cleanStatus.includes('HIT')) {
      cacheStatusEl.classList.add('badge-hit');
      cacheStatusEl.textContent = '⚡ CACHE HIT';
    } else if (cleanStatus.includes('MISS')) {
      cacheStatusEl.classList.add('badge-miss');
      cacheStatusEl.textContent = '⏳ CACHE MISS';
    } else if (cleanStatus.includes('BYPASS')) {
      cacheStatusEl.classList.add('badge-bypass');
      cacheStatusEl.textContent = '🚀 CACHE BYPASS';
    } else if (cleanStatus.includes('EXPIRED')) {
      cacheStatusEl.classList.add('badge-expired');
      cacheStatusEl.textContent = '🔄 CACHE EXPIRED';
    } else {
      cacheStatusEl.classList.add('badge-miss');
      cacheStatusEl.textContent = cleanStatus;
    }
  }

  // Fetch API function
  async function fetchProducts(bypass = false) {
    const headers = {};
    if (bypass) {
      headers['Cache-Bypass'] = '1';
    }

    const startTime = performance.now();
    try {
      const res = await fetch('/api/products', { headers });
      const durationMs = Math.round(performance.now() - startTime);

      const cacheStatus = res.headers.get('x-cache-status') || 'MISS';
      const data = await res.json();

      // Update UI metrics
      latencyEl.textContent = `${durationMs} ms`;
      updateBadge(cacheStatus);

      const backendInvocation = data.meta ? data.meta.backendInvocation : '?';
      backendHitsEl.textContent = backendInvocation;

      const logType = cacheStatus.toLowerCase().includes('hit') ? 'hit' :
                      cacheStatus.toLowerCase().includes('bypass') ? 'bypass' : 'miss';

      addLog(`GET /api/products -> <strong>${cacheStatus}</strong> (${durationMs}ms) [Backend Count: ${backendInvocation}]`, logType);

      return { status: cacheStatus, latency: durationMs };
    } catch (err) {
      addLog(`Error fetching API: ${err.message}`, 'miss');
      return null;
    }
  }

  // Button Click Handlers
  btnFetch.addEventListener('click', () => {
    fetchProducts(chkBypass.checked);
  });

  // Automated 10x Benchmark Test
  btnBenchmark.addEventListener('click', async () => {
    btnBenchmark.disabled = true;
    btnFetch.disabled = true;
    addLog(`--- Starting 10-Request Cache Benchmark ---`, 'bypass');

    let hits = 0;
    let misses = 0;
    let totalHitLatency = 0;
    let totalMissLatency = 0;

    for (let i = 1; i <= 10; i++) {
      progressFill.style.width = `${(i / 10) * 100}%`;
      const result = await fetchProducts(false);

      if (result) {
        if (result.status.includes('HIT')) {
          hits++;
          totalHitLatency += result.latency;
        } else {
          misses++;
          totalMissLatency += result.latency;
        }
      }
      // Brief pause between requests
      await new Promise(r => setTimeout(r, 60));
    }

    const avgHit = hits > 0 ? Math.round(totalHitLatency / hits) : 0;
    const avgMiss = misses > 0 ? Math.round(totalMissLatency / misses) : 0;

    addLog(`Benchmark Complete: ${hits} HITs (avg ${avgHit}ms) vs ${misses} MISS (avg ${avgMiss}ms)`, 'hit');
    btnBenchmark.disabled = false;
    btnFetch.disabled = false;
  });

  // Reset Backend Counter
  btnReset.addEventListener('click', async () => {
    try {
      await fetch('/api/reset', { method: 'POST' });
      backendHitsEl.textContent = '0';
      addLog(`Backend invocation counter reset.`, 'bypass');
    } catch (e) {
      console.error(e);
    }
  });

  // Inspect Static Assets Headers on Load
  async function inspectStaticAssets() {
    const assets = ['/css/style.css', '/js/app.js', '/images/logo.svg'];
    for (const path of assets) {
      try {
        const res = await fetch(path, { method: 'HEAD' });
        const cacheControl = res.headers.get('cache-control') || 'None';
        const expires = res.headers.get('expires') || 'None';
        const el = document.getElementById(`asset-${path.replace(/[^a-z0-9]/gi, '')}`);
        if (el) {
          el.innerHTML = `<code>${cacheControl}</code>`;
        }
      } catch (err) {
        console.warn('Could not inspect asset:', path);
      }
    }
  }

  // Initial load
  inspectStaticAssets();
  fetchProducts(false);
});

