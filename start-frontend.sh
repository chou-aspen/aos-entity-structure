#!/bin/bash
# AOS Blueprint - Start Frontend (Linux/Mac)

echo "========================================"
echo "   AOS Blueprint - Frontend Server"
echo "========================================"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install dependencies"
        exit 1
    fi
fi

echo ""
echo "Starting Vite dev server on http://localhost:5174"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev
