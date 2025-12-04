#!/bin/bash
# AOS Blueprint - Start Backend (Linux/Mac)

echo "========================================"
echo "   AOS Blueprint - Backend Server"
echo "========================================"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "ERROR: .env file not found!"
    echo "Please create .env file with your Dynamics 365 credentials"
    exit 1
fi

# Activate virtual environment
if [ -f venv/bin/activate ]; then
    source venv/bin/activate
else
    echo "ERROR: Virtual environment not found!"
    echo "Please run setup first or create venv manually"
    exit 1
fi

echo "Testing Dynamics 365 connection..."
python test_connection.py

if [ $? -ne 0 ]; then
    echo ""
    echo "WARNING: Connection test failed!"
    echo "Check your credentials in .env file"
    echo ""
fi

echo ""
echo "Starting FastAPI server on http://localhost:8000"
echo "API docs available at http://localhost:8000/docs"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

python backend/app.py
