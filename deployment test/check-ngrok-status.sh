#!/bin/bash
echo "========================================"
echo "   Ngrok Account Status Checker"
echo "========================================"
echo ""
echo "Opening ngrok dashboard in your browser..."
echo ""
echo "Please check these URLs:"
echo "1. Active Endpoints: https://dashboard.ngrok.com/endpoints"
echo "2. Active Agents: https://dashboard.ngrok.com/agents"
echo ""
echo "Look for the endpoint: expiatory-pearly-remediless.ngrok-free.dev"
echo "If it's active, you can stop it from the dashboard."
echo ""
echo "Press Enter when done..."
read

echo ""
echo "Now checking local ngrok config..."
cat /home/chou/snap/ngrok/325/.config/ngrok/ngrok.yml
