#!/bin/bash

echo "========================================"
echo "   AOS Blueprint - Ngrok Setup"
echo "========================================"
echo ""

# Check what's running
echo "Checking running services..."
BACKEND_RUNNING=$(lsof -ti:8000 || echo "")
FRONTEND_RUNNING=$(lsof -ti:5174 || echo "")

if [ -n "$BACKEND_RUNNING" ]; then
    echo "✓ Backend already running on port 8000"
else
    echo "⚠ Backend not running on port 8000"
    echo "  Please start your backend manually first"
fi

if [ -n "$FRONTEND_RUNNING" ]; then
    echo "✓ Frontend already running on port 5174"
else
    echo "⚠ Frontend not running on port 5174"
    echo "  Please start your frontend manually first"
fi

echo ""
read -p "Press Enter to start ngrok tunnels (or Ctrl+C to cancel)..."

# Start ngrok
echo ""
echo "Starting ngrok tunnels..."
ngrok start --all

# This will run in foreground and show the dashboard
# Press Ctrl+C to stop when you're done testing
