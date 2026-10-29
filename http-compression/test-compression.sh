#!/bin/bash
PORT="${1:-8081}"
URL="http://localhost:${PORT}/users.json"

echo "=========================================================================="
echo "                   NGINX HTTP COMPRESSION TEST BENCHMARK                  "
echo "=========================================================================="
echo "Target Endpoint: $URL"
echo ""

# 1. Uncompressed transfer
raw_bytes=$(curl -s "$URL" | wc -c | tr -d ' ')

# 2. Gzip-compressed transfer
gzip_bytes=$(curl -s -H "Accept-Encoding: gzip" "$URL" | wc -c | tr -d ' ')

# Calculate savings
if [ "$raw_bytes" -gt 0 ]; then
  saved_bytes=$(( raw_bytes - gzip_bytes ))
  savings_pct=$(( (saved_bytes * 100) / raw_bytes ))
else
  echo "❌ Error: Could not fetch $URL. Ensure container is running: docker compose up -d"
  exit 1
fi

echo "┌─────────────────────────────────────────────────────────────┐"
echo "│                    BENCHMARK RESULTS                        │"
├─────────────────────────────────────────────────────────────┤
printf "│  Uncompressed Transfer Size : %-29s │\n" "$raw_bytes bytes (~$(( raw_bytes / 1024 )) KB)"
printf "│  Gzip Compressed Size       : %-29s │\n" "$gzip_bytes bytes (~$(( gzip_bytes / 1024 )) KB)"
printf "│  Bandwidth Reduction        : %-29s │\n" "${savings_pct}% saved"
echo "└─────────────────────────────────────────────────────────────┘"
echo ""

echo "--- Response Headers with Gzip ---"
curl -I -s -H "Accept-Encoding: gzip" "$URL" | grep -iE "content-encoding|vary|content-type"
echo ""

