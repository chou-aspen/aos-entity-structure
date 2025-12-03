#!/bin/bash

echo "========================================"
echo "   Testing Ngrok Setup"
echo "========================================"
echo ""

# Step 1: Start simple test servers
echo "[1/2] Starting test servers on ports 8000 and 5173..."
python3 -m http.server 8000 &
SERVER1=$!
python3 -m http.server 5173 &
SERVER2=$!
echo "✓ Test servers started (PIDs: $SERVER1, $SERVER2)"
sleep 2

# Step 2: Start ngrok
echo ""
echo "[2/2] Starting ngrok tunnels..."
ngrok start --all > /dev/null 2>&1 &
NGROK_PID=$!
echo "✓ Ngrok started (PID: $NGROK_PID)"
sleep 5

# Display URLs
echo ""
echo "========================================"
echo "   Ngrok Tunnels Active!"
echo "========================================"
echo ""
echo "Visit http://localhost:4040 to see your URLs"
echo ""
echo "Press Ctrl+C to stop all services"

# Cleanup on exit
trap "echo ''; echo 'Stopping all services...'; kill $SERVER1 $SERVER2 $NGROK_PID 2>/dev/null; echo 'Done!'; exit" INT

wait
