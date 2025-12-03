#!/bin/bash

echo "========================================"
echo "   AOS Blueprint - Production Start"
echo "========================================"
echo ""

# Kill any existing ngrok
pkill ngrok 2>/dev/null
sleep 1

# Check services
echo "[1/2] Checking services..."
BACKEND_RUNNING=$(lsof -ti:8000 2>/dev/null || echo "")
FRONTEND_RUNNING=$(lsof -ti:5174 2>/dev/null || echo "")

if [ -n "$BACKEND_RUNNING" ]; then
    echo "✓ Backend running on port 8000"
else
    echo "✗ Backend NOT running - please start it first"
    exit 1
fi

if [ -n "$FRONTEND_RUNNING" ]; then
    echo "✓ Frontend running on port 5174"
else
    echo "✗ Frontend NOT running - please start it first"
    exit 1
fi

# Start ngrok
echo ""
echo "[2/2] Starting ngrok with reserved domains..."
ngrok start --all > /dev/null 2>&1 &
NGROK_PID=$!
echo "✓ Ngrok started (PID: $NGROK_PID)"
sleep 3

# Display URLs
echo ""
echo "========================================"
echo "   ✅ AOS Blueprint is LIVE!"
echo "========================================"
echo ""
echo "Backend API:"
echo "  https://aos-entity-map-backend.ngrok.app"
echo ""
echo "Frontend App:"
echo "  https://aos-entity-map-frontend.ngrok.app"
echo ""
echo "Ngrok Dashboard:"
echo "  http://localhost:4040"
echo ""
echo "========================================"
echo ""
echo "✨ Benefits of Reserved Domains:"
echo "  • URLs never change (no need to update .env)"
echo "  • No conflicts with other projects"
echo "  • Share consistent URLs with testers"
echo ""
echo "To stop ngrok: pkill ngrok"
echo ""
