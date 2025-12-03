#!/bin/bash

# AOS Blueprint - Start Backend, Frontend, and Ngrok Tunnels
# This script starts all services needed for remote access

echo "========================================"
echo "   AOS Blueprint - Ngrok Setup"
echo "========================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ngrok is installed
if ! command -v ngrok &> /dev/null; then
    echo -e "${YELLOW}⚠️  ngrok is not installed!${NC}"
    echo ""
    echo "Please install ngrok:"
    echo "1. Visit: https://ngrok.com/download"
    echo "2. Or use: snap install ngrok (Linux)"
    echo "3. Or use: brew install ngrok (macOS)"
    exit 1
fi

# Step 1: Start Backend
echo -e "${BLUE}[1/4] Starting Backend Server...${NC}"
cd backend
source venv/bin/activate 2>/dev/null || source venv/Scripts/activate 2>/dev/null
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"
cd ..

# Wait for backend to be ready
echo "Waiting for backend to start..."
sleep 5

# Step 2: Start Frontend
echo ""
echo -e "${BLUE}[2/4] Starting Frontend Dev Server...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"
cd ..

# Wait for frontend to be ready
echo "Waiting for frontend to start..."
sleep 5

# Step 3: Start Ngrok Tunnels
echo ""
echo -e "${BLUE}[3/4] Starting Ngrok Tunnels...${NC}"
ngrok start --all --config ngrok.yml > /dev/null 2>&1 &
NGROK_PID=$!
echo -e "${GREEN}✓ Ngrok started (PID: $NGROK_PID)${NC}"

# Wait for ngrok to establish connections
echo "Waiting for ngrok tunnels to establish..."
sleep 3

# Step 4: Display Tunnel URLs
echo ""
echo -e "${BLUE}[4/4] Fetching Tunnel URLs...${NC}"
sleep 2

# Get tunnel information from ngrok API
NGROK_API="http://localhost:4040/api/tunnels"

echo ""
echo "========================================"
echo "   🚀 All Services Running!"
echo "========================================"
echo ""

# Try to fetch and display URLs
if command -v curl &> /dev/null; then
    TUNNELS=$(curl -s $NGROK_API)

    # Extract URLs (simple grep approach)
    BACKEND_URL=$(echo $TUNNELS | grep -o 'https://[^"]*' | grep -v 'localhost' | head -1)
    FRONTEND_URL=$(echo $TUNNELS | grep -o 'https://[^"]*' | grep -v 'localhost' | tail -1)

    echo -e "${GREEN}Backend API:${NC}  $BACKEND_URL"
    echo -e "${GREEN}Frontend App:${NC} $FRONTEND_URL"
    echo ""
else
    echo "Visit http://localhost:4040 to see your ngrok URLs"
    echo ""
fi

echo "Local Services:"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:5173"
echo "  Ngrok UI: http://localhost:4040"
echo ""
echo "========================================"
echo ""
echo -e "${YELLOW}IMPORTANT NEXT STEPS:${NC}"
echo "1. Copy your ngrok URLs from above (or visit http://localhost:4040)"
echo "2. Update frontend/.env with your backend ngrok URL"
echo "3. Restart frontend: cd frontend && npm run dev"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Trap Ctrl+C to kill all processes
trap "echo ''; echo 'Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $NGROK_PID 2>/dev/null; echo 'Done!'; exit" INT

# Keep script running
wait
