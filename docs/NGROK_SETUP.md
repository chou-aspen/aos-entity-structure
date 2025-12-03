# AOS Blueprint - Ngrok Setup Guide

This guide helps you expose your AOS Blueprint application to the internet for remote testing using ngrok.

## Prerequisites

1. **Ngrok Account**: Your authtoken is already configured in `ngrok.yml`
2. **Ngrok Installed**: Install from https://ngrok.com/download
   ```bash
   # Linux
   snap install ngrok

   # macOS
   brew install ngrok

   # Windows
   # Download from https://ngrok.com/download
   ```

## Quick Start (Automated)

Run the automated startup script:

```bash
./start-with-ngrok.sh
```

This will:
1. Start the backend server (port 8000)
2. Start the frontend dev server (port 5173)
3. Start ngrok tunnels for both
4. Display your public URLs

**Important**: After getting your URLs, you need to update the frontend configuration (see Step 3 below).

## Manual Setup (Step by Step)

### Step 1: Start Backend

```bash
cd backend
source venv/bin/activate  # On Windows: venv\Scripts\activate
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Keep this terminal running.

### Step 2: Start Ngrok Tunnels

Open a new terminal:

```bash
cd /home/chou/AOS/aos-entity-structure
ngrok start --all --config ngrok.yml
```

You'll see output like:

```
Session Status    online
Account           Your Account
Version           3.x.x

Forwarding        https://abc123.ngrok.io -> http://localhost:8000 (backend)
Forwarding        https://xyz789.ngrok.io -> http://localhost:5173 (frontend)

Web Interface     http://127.0.0.1:4040
```

**Copy your ngrok URLs!** You'll need them for the next step.

### Step 3: Configure Frontend

Edit `frontend/.env`:

```bash
cd frontend
nano .env  # or use your preferred editor
```

Update with your **backend ngrok URL**:

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-NGROK-URL.ngrok.io/api
```

**Example:**
```env
VITE_API_BASE_URL=https://abc123.ngrok.io/api
```

⚠️ **Important**:
- Use the **backend** ngrok URL (port 8000)
- Include `/api` at the end
- Use `https://` (not `http://`)

### Step 4: Start Frontend

```bash
# Still in frontend directory
npm run dev
```

The frontend will now connect to your backend through ngrok.

### Step 5: Share Your Application

Send your **frontend ngrok URL** to users:

```
https://xyz789.ngrok.io
```

They can now access your AOS Blueprint application from anywhere!

## Ngrok Dashboard

Monitor your tunnels at: **http://localhost:4040**

This dashboard shows:
- Active tunnel URLs
- Request/response inspection
- Traffic statistics
- Replay requests for debugging

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                     Remote User                         │
│                                                         │
│  Browser: https://xyz789.ngrok.io                     │
└───────────────────────┬─────────────────────────────────┘
                        │
                        │ HTTPS
                        │
┌───────────────────────▼─────────────────────────────────┐
│                   Ngrok Cloud                           │
│                                                         │
│  Frontend Tunnel:  https://xyz789.ngrok.io             │
│  Backend Tunnel:   https://abc123.ngrok.io             │
└─────────┬─────────────────────────┬─────────────────────┘
          │                         │
          │ HTTP                    │ HTTP
          │                         │
┌─────────▼─────────┐    ┌──────────▼──────────┐
│  Frontend Server  │    │   Backend Server    │
│  localhost:5173   │───▶│  localhost:8000     │
│  (Vite)           │    │  (FastAPI)          │
└───────────────────┘    └──────────┬──────────┘
                                    │
                                    │ REST API
                                    │
                         ┌──────────▼──────────┐
                         │  Dynamics 365 API   │
                         │  (Microsoft Cloud)  │
                         └─────────────────────┘
```

## Configuration Files

### `ngrok.yml`
Ngrok configuration with authtoken and tunnel definitions:
- **backend**: Port 8000 (FastAPI)
- **frontend**: Port 5173 (Vite)

### `frontend/.env`
Frontend environment variables:
- `VITE_API_BASE_URL`: Backend API URL (ngrok or localhost)

### `start-with-ngrok.sh`
Automated startup script that launches all services

## Troubleshooting

### "ngrok not found"
Install ngrok:
```bash
# Linux
snap install ngrok

# macOS
brew install ngrok
```

### "Tunnel session failed"
Check your authtoken in `ngrok.yml`:
```yaml
authtoken: 2jHyJ8XGyI0QWl4qDI2IFk5r0T3_26Cr3tKFSYfoetZLEC5KU
```

### Frontend can't connect to backend
1. Check `frontend/.env` has the correct backend ngrok URL
2. Verify the URL includes `/api` at the end
3. Make sure you restarted the frontend after updating `.env`
4. Check ngrok dashboard (http://localhost:4040) for errors

### "ERR_NGROK_3200" - Tunnel limit reached
Free ngrok accounts support 3 endpoints, which is what we're using:
- 1 backend tunnel (HTTP)
- 1 frontend tunnel (HTTP)
- 1 web dashboard

If you see this error:
- Stop any other running ngrok instances
- Run: `pkill ngrok` to kill all ngrok processes
- Restart with `./start-with-ngrok.sh`

### Backend can't connect to Dynamics 365
This is a **credentials issue**, not ngrok:
1. Check `backend/.env` has valid Dynamics credentials
2. Verify MSAL authentication is working locally first
3. Ngrok doesn't affect backend → Dynamics 365 connections

### CORS errors in browser console
Backend should already have CORS configured for all origins. If you see CORS errors:
1. Check `backend/main.py` has CORS middleware enabled
2. Verify the frontend is using the correct backend URL
3. Clear browser cache and reload

## Security Notes

⚠️ **Important Security Considerations:**

1. **Ngrok URLs are public**: Anyone with the URL can access your application
2. **No authentication**: The ngrok tunnel itself has no password protection
3. **Temporary URLs**: Ngrok URLs change every time you restart (unless you have a paid plan)
4. **Rate limits**: Free ngrok accounts have request limits
5. **Dynamics credentials**: Your backend has Dynamics 365 credentials - ensure your `.env` file is in `.gitignore`

**Best Practices:**
- Only share ngrok URLs with trusted testers
- Stop ngrok tunnels when not in use (`Ctrl+C` in terminal)
- Don't commit `ngrok.yml` with your authtoken to public repositories
- Consider adding authentication to your application for production use
- Monitor traffic in ngrok dashboard (http://localhost:4040)

## Stopping Services

**If using automated script:**
Press `Ctrl+C` in the terminal running `start-with-ngrok.sh` - this will stop all services.

**If running manually:**
1. Press `Ctrl+C` in each terminal (backend, frontend, ngrok)
2. Or run: `pkill uvicorn && pkill node && pkill ngrok`

## Upgrading to Ngrok Paid Plan

For longer testing periods, consider upgrading to get:
- **Custom domains**: `aos-blueprint.ngrok.io` instead of random URLs
- **Reserved domains**: URLs don't change on restart
- **More tunnels**: Run additional services
- **Higher limits**: More requests per minute

Visit: https://ngrok.com/pricing

## Support

- **Ngrok Docs**: https://ngrok.com/docs
- **Ngrok Status**: https://status.ngrok.com
- **AOS Blueprint Issues**: Check `SYSTEM_ARCHITECTURE.md` for application details
