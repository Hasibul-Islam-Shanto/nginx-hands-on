#!/bin/bash
URL="http://localhost/app1/"
TOTAL=100
CONCURRENCY=10
LOG="/tmp/lb-detailed.log"
RESULTS="/tmp/lb-results.json"

echo "====================================================================="
echo " Sending $TOTAL requests to $URL (concurrency: $CONCURRENCY) ..."
echo "====================================================================="
: > "$LOG"
: > "$RESULTS"

export URL
seq 1 $TOTAL | xargs -P $CONCURRENCY -I {} sh -c '
  resp=$(curl -s "$URL")
  hostname=$(echo "$resp" | jq -r ".hostname // \"unknown\"")
  serverName=$(echo "$resp" | jq -r ".serverName // \"unknown\"")
  echo "[req {}] server=$serverName ($hostname) | $resp" >&2
  echo "$resp"
' >> "$RESULTS" 2>> "$LOG"

# Extract statistics for each server
read s1_cnt s1_host s1_pct <<< $(jq -s --argjson total "$TOTAL" '
  (map(select(.serverName=="server1")) // []) as $items |
  "\($items | length) \($items[0].hostname // "---") \((($items | length) / $total * 1000 | round) / 10)"
' "$RESULTS" | tr -d '"')

read s2_cnt s2_host s2_pct <<< $(jq -s --argjson total "$TOTAL" '
  (map(select(.serverName=="server2")) // []) as $items |
  "\($items | length) \($items[0].hostname // "---") \((($items | length) / $total * 1000 | round) / 10)"
' "$RESULTS" | tr -d '"')

read s3_cnt s3_host s3_pct <<< $(jq -s --argjson total "$TOTAL" '
  (map(select(.serverName=="server3")) // []) as $items |
  "\($items | length) \($items[0].hostname // "---") \((($items | length) / $total * 1000 | round) / 10)"
' "$RESULTS" | tr -d '"')

echo ""
echo "======================= TRAFFIC DISTRIBUTION ======================="
echo "┌─────────────────────────┬─────────────────────────┬─────────────────────────┐"
printf "│ %-23s │ %-23s │ %-23s │\n" "        SERVER 1" "        SERVER 2" "        SERVER 3"
echo "├─────────────────────────┼─────────────────────────┼─────────────────────────┤"
printf "│ Container: %-12s │ Container: %-12s │ Container: %-12s │\n" "${s1_host:0:12}" "${s2_host:0:12}" "${s3_host:0:12}"
printf "│ Requests:  %-12s │ Requests:  %-12s │ Requests:  %-12s │\n" "$s1_cnt" "$s2_cnt" "$s3_cnt"
printf "│ Share:     %-12s │ Share:     %-12s │ Share:     %-12s │\n" "${s1_pct}%" "${s2_pct}%" "${s3_pct}%"
echo "└─────────────────────────┴─────────────────────────┴─────────────────────────┘"
printf "Total Requests: %s  |  Target: %s  |  Concurrency: %s\n" "$TOTAL" "$URL" "$CONCURRENCY"

# Check for any unexpected or failed responses
unknown_cnt=$(jq -s 'map(select(.serverName != "server1" and .serverName != "server2" and .serverName != "server3")) | length' "$RESULTS")
if [ "$unknown_cnt" -gt 0 ]; then
  echo ""
  echo "⚠️  Note: $unknown_cnt request(s) failed or were returned by an unexpected server."
fi

echo ""
echo "=== Sample Response Logs (Last 5) ==="
tail -5 "$LOG"
