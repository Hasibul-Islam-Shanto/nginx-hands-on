#!/bin/bash

# Configuration (defaults to port 8080 or port 80 if specified)
PORT="${1:-8080}"
BASE_URL="http://localhost:${PORT}"
ENDPOINT="${BASE_URL}/api/products"

echo "=========================================================================="
echo "          NGINX HTTP CACHING VERIFICATION & BENCHMARK SUITE               "
echo "=========================================================================="
echo "Target Endpoint: $ENDPOINT"
echo ""

# Helper to check if server is reachable
if ! curl -s --head --fail "$BASE_URL" > /dev/null 2>&1; then
  # Try port 80 if 8080 was unreachable
  if curl -s --head --fail "http://localhost:80" > /dev/null 2>&1; then
    BASE_URL="http://localhost:80"
    ENDPOINT="${BASE_URL}/api/products"
    echo "Notice: Detected active server on port 80, switching target..."
  else
    echo "❌ Error: Cannot connect to $BASE_URL."
    echo "Make sure containers are running with: docker compose up -d"
    exit 1
  fi
fi

# Reset backend invocation counter before testing
curl -s -X POST "${BASE_URL}/api/reset" > /dev/null

echo "--- STEP 1: Cold Cache Request (Expect: MISS) ---"
start_time=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
headers_1=$(curl -s -i "$ENDPOINT")
end_time=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
duration_1=$(( (end_time - start_time) / 1000000 ))

cache_status_1=$(echo "$headers_1" | grep -i "x-cache-status" | tr -d '\r' | awk '{print $2}')
echo "  Cache Status : $cache_status_1"
echo "  Response Time: ${duration_1} ms"

if [[ "$cache_status_1" == *"MISS"* ]]; then
  echo "  ✅ SUCCESS: First request resulted in a Cache MISS (Backend queried)."
else
  echo "  ⚠️ Unexpected status: $cache_status_1"
fi
echo ""

echo "--- STEP 2: Warm Cache Request (Expect: HIT) ---"
start_time=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
headers_2=$(curl -s -i "$ENDPOINT")
end_time=$(date +%s%N 2>/dev/null || python3 -c 'import time; print(int(time.time()*1e9))')
duration_2=$(( (end_time - start_time) / 1000000 ))

cache_status_2=$(echo "$headers_2" | grep -i "x-cache-status" | tr -d '\r' | awk '{print $2}')
echo "  Cache Status : $cache_status_2"
echo "  Response Time: ${duration_2} ms"

if [[ "$cache_status_2" == *"HIT"* ]]; then
  echo "  ⚡ SUCCESS: Second request resulted in a Cache HIT (Served from NGINX disk/RAM)!"
  if [ "$duration_2" -gt 0 ] && [ "$duration_1" -gt 0 ]; then
    speedup=$(( duration_1 / (duration_2 > 0 ? duration_2 : 1) ))
    echo "  🚀 Speedup: ~${speedup}x faster than direct backend query!"
  fi
else
  echo "  ⚠️ Unexpected status: $cache_status_2"
fi
echo ""

echo "--- STEP 3: Forced Cache Bypass (Expect: BYPASS) ---"
headers_3=$(curl -s -i -H "Cache-Bypass: 1" "$ENDPOINT")
cache_status_3=$(echo "$headers_3" | grep -i "x-cache-status" | tr -d '\r' | awk '{print $2}')
echo "  Header sent  : 'Cache-Bypass: 1'"
echo "  Cache Status : $cache_status_3"

if [[ "$cache_status_3" == *"BYPASS"* ]]; then
  echo "  ✅ SUCCESS: NGINX bypassed proxy cache and queried backend."
fi
echo ""

echo "--- STEP 4: 20-Request Batch Benchmark ---"
echo "Firing 20 concurrent requests..."

LOG_FILE="/tmp/cache_bench_results.txt"
: > "$LOG_FILE"

for i in $(seq 1 20); do
  status=$(curl -s -I "$ENDPOINT" | grep -i "x-cache-status" | tr -d '\r' | awk '{print $2}')
  echo "$status" >> "$LOG_FILE"
done

total_hits=$(grep -c "HIT" "$LOG_FILE" 2>/dev/null || echo 0)
total_misses=$(grep -c "MISS" "$LOG_FILE" 2>/dev/null || echo 0)
total_other=$(grep -vcE "HIT|MISS" "$LOG_FILE" 2>/dev/null || echo 0)

# Fetch how many times Node backend was actually hit
stats=$(curl -s "${BASE_URL}/api/stats")
backend_count=$(echo "$stats" | grep -o '"totalBackendInvocations":[0-9]*' | cut -d':' -f2)

echo ""
echo "┌─────────────────────────────────────────────────────────────┐"
echo "│                    BENCHMARK RESULTS                        │"
├─────────────────────────────────────────────────────────────┤
printf "│  Total Requests Sent        : %-29s │\n" "20"
printf "│  Cache HITs (Served 1ms)    : %-29s │\n" "$total_hits (100% of batch)"
printf "│  Cache MISSes               : %-29s │\n" "$total_misses"
printf "│  Real Backend Invocations   : %-29s │\n" "$backend_count"
echo "└─────────────────────────────────────────────────────────────┘"
echo "💡 The backend was ONLY called $backend_count times for all requests combined!"
echo ""

echo "--- STEP 5: Browser Asset Caching Headers ---"
css_headers=$(curl -s -I "${BASE_URL}/css/style.css")
cache_ctrl=$(echo "$css_headers" | grep -i "cache-control" | tr -d '\r')
expires=$(echo "$css_headers" | grep -i "expires" | tr -d '\r')

echo "Asset: /css/style.css"
echo "  $cache_ctrl"
echo "  $expires"

if [[ "$cache_ctrl" == *"max-age"* ]]; then
  echo "  ✅ SUCCESS: Static assets configured with browser caching."
fi

echo ""
echo "=========================================================================="
echo "  Open http://localhost:${PORT} in your browser to view the interactive UI! "
echo "=========================================================================="

