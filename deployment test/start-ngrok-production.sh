#!/bin/bash

echo "========================================"
echo "   AOS Blueprint - Production Ngrok"
echo "========================================"
echo ""

# Check what's running
echo "[1/3] Checking running services..."
BACKEND_RUNNING=$(lsof -ti:8000 2>/dev/null || echo "")
FRONTEND_RUNNING=$(lsof -ti:5174 2>/dev/null || echo "")

if [ -n "$BACKEND_RUNNING" ]; then
    echo "✓ Backend running on port 8000"
else
    echo "✗ Backend NOT running on port 8000"
    echo "  Start your backend first!"
    exit 1
fi

if [ -n "$FRONTEND_RUNNING" ]; then
    echo "✓ Frontend running on port 5174"
else
    echo "✗ Frontend NOT running on port 5174"
    echo "  Start your frontend first!"
    exit 1
fi

echo ""
echo "[2/3] Starting ngrok tunnels with RANDOM domains..."
echo "      (This avoids conflicts with other running tunnels)"
echo ""

# Kill any existing ngrok processes
pkill ngrok 2>/dev/null
sleep 1

# Start ngrok tunnels
ngrok start --all > /tmp/ngrok.log 2>&1 &
NGROK_PID=$!

echo "✓ Ngrok started (PID: $NGROK_PID)"
echo "  Waiting for tunnels to establish..."
sleep 5

# Check if ngrok is still running
if ! ps -p $NGROK_PID > /dev/null; then
    echo ""
    echo "✗ ERROR: Ngrok failed to start!"
    echo ""
    echo "Log output:"
    cat /tmp/ngrok.log
    echo ""
    echo "Common causes:"
    echo "1. Another ngrok instance using the same domain (check dashboard)"
    echo "2. Invalid authtoken"
    echo "3. Network connectivity issues"
    echo ""
    echo "Solutions:"
    echo "- Visit https://dashboard.ngrok.com/endpoints to stop conflicting tunnels"
    echo "- Visit https://dashboard.ngrok.com/agents to manage active agents"
    exit 1
fi

# Fetch tunnel URLs
echo ""
echo "[3/3] Fetching tunnel URLs..."
sleep 2

TUNNEL_DATA=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null)

if [ -z "$TUNNEL_DATA" ]; then
    echo "✗ Could not connect to ngrok API (port 4040)"
    echo "  Ngrok might still be starting..."
    echo "  Visit http://localhost:4040 manually to see your URLs"
else
    # Extract URLs using python
    BACKEND_URL=$(echo "$TUNNEL_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('config', {}).get('addr', '').endswith(':8000'):
            print(tunnel.get('public_url', ''))
            break
except: pass
" 2>/dev/null)

    FRONTEND_URL=$(echo "$TUNNEL_DATA" | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    for tunnel in data.get('tunnels', []):
        if tunnel.get('config', {}).get('addr', '').endswith(':5174'):
            print(tunnel.get('public_url', ''))
            break
except: pass
" 2>/dev/null)

    echo ""
    echo "========================================"
    echo "   ✓ Tunnels Active!"
    echo "========================================"
    echo ""

    if [ -n "$BACKEND_URL" ]; then
        echo "Backend API:  $BACKEND_URL"
    else
        echo "Backend API:  (see http://localhost:4040)"
    fi

    if [ -n "$FRONTEND_URL" ]; then
        echo "Frontend App: $FRONTEND_URL"
    else
        echo "Frontend App: (see http://localhost:4040)"
    fi

    echo ""
    echo "Ngrok Dashboard: http://localhost:4040"
    echo "========================================"
fi

echo ""
echo "IMPORTANT NEXT STEPS:"
echo "1. Copy your BACKEND URL from above"
echo "2. Update frontend/.env:"
echo "   VITE_API_BASE_URL=<YOUR_BACKEND_URL>/api"
echo "3. Restart your frontend (Ctrl+C and npm run dev)"
echo "4. Share your FRONTEND URL with testers"
echo ""
echo "To stop ngrok: pkill ngrok"
echo ""
