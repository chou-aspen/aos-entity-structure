# AOS Blueprint - Ngrok Production Setup

## Quick Start (Recommended)

```bash
# 1. Start backend (in terminal 1)
cd /home/chou/AOS/aos-entity-structure/backend
# ... your backend startup command

# 2. Start frontend (in terminal 2)
cd /home/chou/AOS/aos-entity-structure/frontend
npm run dev

# 3. Start ngrok (in terminal 3)
cd /home/chou/AOS/aos-entity-structure
./start-ngrok-production.sh
```

The script will display your public URLs. Copy the backend URL and update `frontend/.env`, then restart the frontend.

---

## Understanding ERR_NGROK_334

### What This Error Means

```
ERROR: failed to start tunnel: The endpoint 'https://xxx.ngrok-free.dev' is already online.
ERR_NGROK_334
```

**This error occurs when:**
1. The same ngrok domain is already being used by another active tunnel
2. You're trying to start a tunnel with a domain that's currently in use on another machine
3. Your ngrok account has reached its endpoint limit (3 for free accounts)

### Why It Happened to You

Your ngrok account was trying to reuse the domain `expiatory-pearly-remediless.ngrok-free.dev`, which is currently active on your other PC for a different webapp.

**Key Concept:**
- **Endpoints** = Active host-port combinations exposed by ngrok
- **Endpoint Limit** = Max number of simultaneous endpoints your account allows
- Free accounts: **3 endpoints max**
- Your usage: 1 endpoint (other PC) + 2 endpoints (this PC) = 3 total ✓

### The Fix

Our solution **forces ngrok to generate NEW random domains** instead of reusing the conflicting one:

```yaml
# Updated config (no domain specification = random domains)
version: "3"
agent:
  authtoken: YOUR_TOKEN

tunnels:
  aos-backend:
    proto: http
    addr: 8000
    # No domain specified = ngrok generates random URL

  aos-frontend:
    proto: http
    addr: 5174
    # No domain specified = ngrok generates random URL
```

This generates fresh URLs like:
- `https://abc123.ngrok-free.app` (backend)
- `https://xyz789.ngrok-free.app` (frontend)

---

## Production Setup Steps

### Step 1: Check for Conflicts (If Needed)

If you still encounter ERR_NGROK_334:

1. **Check Active Endpoints:**
   - Visit: https://dashboard.ngrok.com/endpoints
   - Look for `expiatory-pearly-remediless.ngrok-free.dev`
   - Note which agent is using it

2. **Stop Conflicting Tunnel:**
   - Visit: https://dashboard.ngrok.com/agents
   - Find the agent using the conflicting domain
   - Click "Stop" or "Terminate"

3. **Or Stop on Other PC:**
   ```bash
   # Linux/Mac
   pkill ngrok

   # Windows
   taskkill /F /IM ngrok.exe
   ```

### Step 2: Start Your Services

```bash
# Terminal 1: Backend
cd /home/chou/AOS/aos-entity-structure/backend
# Start your backend as normal (port 8000)

# Terminal 2: Frontend
cd /home/chou/AOS/aos-entity-structure/frontend
npm run dev
# Should start on port 5174
```

### Step 3: Start Ngrok

```bash
# Terminal 3: Ngrok
cd /home/chou/AOS/aos-entity-structure
./start-ngrok-production.sh
```

**What this script does:**
1. ✓ Checks if backend (8000) and frontend (5174) are running
2. ✓ Kills any existing ngrok processes to avoid conflicts
3. ✓ Starts ngrok tunnels with random domains
4. ✓ Fetches and displays your public URLs
5. ✓ Provides next steps for configuration

### Step 4: Configure Frontend

The script will show output like:

```
======================================
   ✓ Tunnels Active!
======================================

Backend API:  https://abc123.ngrok-free.app
Frontend App: https://xyz789.ngrok-free.app

Ngrok Dashboard: http://localhost:4040
======================================
```

**Copy the Backend URL** and update your frontend:

```bash
# Edit frontend/.env
nano /home/chou/AOS/aos-entity-structure/frontend/.env

# Update to:
VITE_API_BASE_URL=https://abc123.ngrok-free.app/api
```

**Important:** Include `/api` at the end!

### Step 5: Restart Frontend

```bash
# Stop frontend (Ctrl+C in terminal 2)
# Start it again
cd /home/chou/AOS/aos-entity-structure/frontend
npm run dev
```

Now your frontend will connect to the backend through ngrok.

### Step 6: Share and Test

Share the **Frontend URL** with your testers:
```
https://xyz789.ngrok-free.app
```

They can now access your AOS Blueprint app from anywhere!

---

## Monitoring and Management

### Ngrok Web Interface

Visit: **http://localhost:4040**

Features:
- View active tunnels and their URLs
- Inspect HTTP requests/responses
- Replay requests for debugging
- See bandwidth usage and errors

### ngrok Dashboard

Visit: **https://dashboard.ngrok.com**

Features:
- View all active endpoints across all machines
- Manage active agents
- Stop/start tunnels remotely
- View account limits and usage

### Check Tunnel Status

```bash
# Get tunnel info via API
curl http://localhost:4040/api/tunnels | python3 -m json.tool

# Check if ngrok is running
ps aux | grep ngrok
```

### Stop Ngrok

```bash
# Kill ngrok process
pkill ngrok

# Or use Ctrl+C in the ngrok terminal
```

---

## Free Account Limitations

**Endpoint Limit:** 3 simultaneous endpoints
- Currently using: 1 (other PC) + 2 (this PC) = 3 total ✓

**Static Domains:** 1 free static domain
- Random domains (like `abc123.ngrok-free.app`) change every restart
- You can claim 1 permanent domain at https://dashboard.ngrok.com/domains

**Other Limits:**
- 40 connections/minute
- 2-hour session timeout (need to restart)
- Interstitial warning page on first visit
- No custom domains

---

## Upgrading to Paid Plan (Recommended for Production)

### Why Upgrade?

**Personal Plan ($8/month annually):**
- Multiple reserved/static domains (URLs don't change)
- No 2-hour session limit
- Remove interstitial warning page
- Higher rate limits (120 connections/min)
- Custom domain support

**Pay-as-you-go:**
- Unlimited endpoints
- As many static domains as needed
- Run multiple projects across multiple machines
- $0.10 per GB traffic
- Perfect for multi-project setups

### How Multiple Projects Work with Paid Plan

**Machine 1 (AOS Blueprint):**
```yaml
tunnels:
  backend:
    proto: http
    addr: 8000
    domain: aos-backend.ngrok.app  # Reserved domain

  frontend:
    proto: http
    addr: 5174
    domain: aos-frontend.ngrok.app  # Reserved domain
```

**Machine 2 (Other Webapp):**
```yaml
tunnels:
  webapp:
    proto: http
    addr: 3000
    domain: other-webapp.ngrok.app  # Different reserved domain
```

No conflicts! Each project has its own dedicated domain.

### To Upgrade

1. Visit: https://dashboard.ngrok.com/billing
2. Choose plan (Personal or Pay-as-you-go)
3. Reserve domains: https://dashboard.ngrok.com/domains
4. Update your configs with reserved domains

---

## Troubleshooting

### ERR_NGROK_334: Endpoint Already Online

**Cause:** Domain is in use by another tunnel

**Solution:**
1. Visit https://dashboard.ngrok.com/endpoints
2. Stop conflicting endpoint
3. Restart ngrok on this machine

### Frontend Can't Connect to Backend

**Check:**
1. ✓ Backend ngrok URL in `frontend/.env` is correct
2. ✓ URL ends with `/api`
3. ✓ Frontend was restarted after updating `.env`
4. ✓ Backend is actually running on port 8000

**Debug:**
```bash
# Test backend directly
curl http://localhost:8000/api/health

# Test backend via ngrok
curl https://your-backend-url.ngrok-free.app/api/health
```

### Ngrok Won't Start

**Check:**
```bash
# View ngrok logs
cat /tmp/ngrok.log

# Check config syntax
ngrok config check

# Verify authtoken
grep authtoken /home/chou/snap/ngrok/325/.config/ngrok/ngrok.yml
```

### Ports Already in Use

**Find what's using the port:**
```bash
# Check port 8000
lsof -i:8000

# Check port 5174
lsof -i:5174

# Kill process on port
kill $(lsof -ti:8000)
```

### Random Domains Change on Restart

**This is normal for free accounts.** Solutions:
1. Use your 1 free static domain for the most important tunnel (backend)
2. Upgrade to paid plan for multiple static domains
3. Accept that testers need a new URL each session

---

## Configuration Files

### Active Ngrok Config
**Location:** `/home/chou/snap/ngrok/325/.config/ngrok/ngrok.yml`

```yaml
version: "3"
agent:
  authtoken: 2jHyJ8XGyI0QWl4qDI2IFk5r0T3_26Cr3tKFSYfoetZLEC5KU

tunnels:
  aos-backend:
    proto: http
    addr: 8000

  aos-frontend:
    proto: http
    addr: 5174
```

### Frontend Environment
**Location:** `/home/chou/AOS/aos-entity-structure/frontend/.env`

```env
VITE_API_BASE_URL=https://YOUR-BACKEND-URL.ngrok-free.app/api
```

### Backup Configs
- Original config backed up at: `/home/chou/snap/ngrok/325/.config/ngrok/ngrok.yml.backup`
- Project configs at: `/home/chou/AOS/aos-entity-structure/ngrok*.yml`

---

## Security Considerations

**⚠️ Important:**

1. **Public Access:** Anyone with the ngrok URL can access your app
2. **No Authentication:** ngrok tunnels have no password by default
3. **Temporary URLs:** Free account URLs change on restart (good for security)
4. **Credentials:** Your `.env` files contain Dynamics credentials - never commit them
5. **Interstitial Page:** Free accounts show warning page on first visit

**Best Practices:**
- Only share URLs with trusted testers
- Stop tunnels when not in use (`pkill ngrok`)
- Don't commit `ngrok.yml` with authtoken to public repos
- Monitor traffic at http://localhost:4040
- Consider adding authentication to your app for production
- Use paid plan to remove interstitial warning

---

## Quick Reference

**Start Everything:**
```bash
./start-ngrok-production.sh
```

**Stop Everything:**
```bash
pkill ngrok
```

**View URLs:**
- Local: http://localhost:4040
- Dashboard: https://dashboard.ngrok.com

**Update Frontend:**
```bash
nano frontend/.env
# Update VITE_API_BASE_URL with backend ngrok URL
```

**Check Status:**
```bash
curl http://localhost:4040/api/tunnels
```

---

## Support Resources

- **Ngrok Docs:** https://ngrok.com/docs
- **Error Reference:** https://ngrok.com/docs/errors/err_ngrok_334
- **Dashboard:** https://dashboard.ngrok.com
- **Pricing:** https://ngrok.com/pricing
- **Status Page:** https://status.ngrok.com
- **AOS Blueprint Docs:** See `SYSTEM_ARCHITECTURE.md`

---

## Summary

✅ **Configuration Updated:** Random domains to avoid conflicts
✅ **Script Created:** `start-ngrok-production.sh` for easy startup
✅ **Works with Free Account:** Uses 2 of your 3 available endpoints
✅ **Compatible:** Doesn't interfere with your other webapp on another PC
✅ **Production Ready:** Handles errors, displays URLs, provides next steps

**Next Steps:**
1. Run `./start-ngrok-production.sh`
2. Copy backend URL to `frontend/.env`
3. Restart frontend
4. Share frontend URL with testers
5. Consider upgrading to paid plan for static domains
