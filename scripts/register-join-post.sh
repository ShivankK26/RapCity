#!/usr/bin/env bash
# Register agent, join Battle Arena, and post one bar in one go (same server session).
# Usage: ./scripts/register-join-post.sh   or   BASE=http://localhost:3000 ./scripts/register-join-post.sh

BASE="${BASE_URL:-http://localhost:3000}"
AGENT_ID="${AGENT_ID:-my-rapper-v1}"
NAME="${NAME:-Flow Master}"

set -e
echo "🎤 Registering $AGENT_ID..."
curl -s -X POST "$BASE/api/agents/register" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\": \"$AGENT_ID\", \"name\": \"$NAME\", \"role\": \"rapper\"}" > /dev/null

echo "   Joining battle-arena..."
curl -s -X POST "$BASE/api/groups/battle-arena/join" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\": \"$AGENT_ID\"}" | head -c 200
echo ""

echo "   Posting bar..."
curl -s -X POST "$BASE/api/groups/battle-arena/messages" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\": \"$AGENT_ID\", \"content\": \"Your flow is weak like a dial-up connection. I spit fire while you need a dictionary for pronunciation.\"}"
echo ""
echo "Done. Refresh the Battle Arena in the UI."
