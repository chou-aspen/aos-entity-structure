#!/bin/bash
# Start Backend Server

echo "🚀 Starting Dynamics 365 Entity Visualizer - Backend"
echo "=================================================="
echo ""

# Activate virtual environment
source venv/bin/activate

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please create .env file with your Dynamics 365 credentials"
    exit 1
fi

# Test connection first
echo "🔍 Testing Dynamics 365 connection..."
python test_connection.py

if [ $? -ne 0 ]; then
    echo ""
    echo "❌ Connection test failed!"
    echo "Please check your credentials in .env file"
    exit 1
fi

echo ""
echo "✅ Connection successful!"
echo ""
echo "🌐 Starting FastAPI server..."
echo "   API: http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""

# Start the backend
python backend/app.py
