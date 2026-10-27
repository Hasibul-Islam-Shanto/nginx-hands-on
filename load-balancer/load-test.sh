#!/bin/bash
URL="http://localhost/app1/"
TOTAL=100
CONCURRENCY=10
LOG="/tmp/lb-detailed.log"
RESULTS="/tmp/lb-results.json"

echo "Sending $TOTAL requests to $URL (concurrency: $CONCURRENCY) ..."
: > "$LOG"
: > "$RESULTS"

export URL
seq 1 $TOTAL | xargs -P $CONCURRENCY -I {} sh -c '
  resp=$(curl -s "$URL")
  hostname=$(echo "$resp" | jq -r ".hostname // \"unknown\"")
  echo "[req {}] hostname=$hostname | $resp" >&2
  echo "$resp"
' >> "$RESULTS" 2>> "$LOG"

echo ""
echo "=== Per-request log ==="
cat "$LOG"

echo ""
echo "=== Traffic distribution by hostname ==="
jq -r .hostname "$RESULTS" | sort | uniq -c | sort -rn

echo ""
echo "=== Sample responses ==="
head -3 "$RESULTS" | jq .
