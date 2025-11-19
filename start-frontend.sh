#!/bin/bash
# Start Frontend Server

echo "🚀 Starting Dynamics 365 Entity Visualizer - Frontend"
echo "======================================================"
echo ""

cd frontend

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🌐 Starting Vite dev server..."
echo "   App: http://localhost:5174"
echo ""

# Start the frontend
npm run dev
