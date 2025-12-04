# AOS Blueprint

Interactive visualization tool for Dynamics 365 entity relationships. Filters 964 entities down to 38 business-relevant entities with hierarchical organization and interactive exploration.

---

## Quick Start (If Already Set Up)

### Linux / Mac
```bash
# Terminal 1 - Backend
source venv/bin/activate
./start-backend.sh

# Terminal 2 - Frontend
./start-frontend.sh

# Open: http://localhost:5174
```

### Windows
1. **Double-click** `start-backend.bat`
2. **Double-click** `start-frontend.bat` (in a new window)
3. **Open:** http://localhost:5174

---

## First Time Installation

### Prerequisites

Install these before starting:

- **Python 3.8+** - https://www.python.org/downloads/
  - Windows: Check "Add Python to PATH" during installation
- **Node.js 18+** - https://nodejs.org/
- **Git** - https://git-scm.com/

Verify installation:

**Linux/Mac:**
```bash
python3 --version  # Should be 3.8 or higher
node --version     # Should be 18 or higher
npm --version      # Comes with Node.js
```

**Windows:**
```cmd
python --version   # Should be 3.8 or higher
node --version     # Should be 18 or higher
npm --version      # Comes with Node.js
```

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd aos-entity-structure
```

### Step 2: Get Azure Credentials

You need credentials from Azure Portal:

1. Go to https://portal.azure.com
2. **Azure Active Directory** → **App registrations**
3. Select/create your app registration
4. **Certificates & secrets** → Create new client secret
   - **Copy the secret value immediately!** (won't be shown again)
5. **API permissions** → Add permission
   - **Dynamics CRM** → **Delegated** → **user_impersonation**
   - Click **Grant admin consent**
6. **Overview** → Copy:
   - Application (client) ID
   - Directory (tenant) ID

### Step 3: Create .env File

Create `.env` file in project root:

```bash
DYNAMICS_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
DYNAMICS_CLIENT_ID=YOUR_CLIENT_ID
DYNAMICS_CLIENT_SECRET=YOUR_CLIENT_SECRET
DYNAMICS_RESOURCE_URL=https://aos.crm.dynamics.com/
DYNAMICS_SCOPES=https://aos.crm.dynamics.com/.default
```

Replace `YOUR_TENANT_ID`, `YOUR_CLIENT_ID`, `YOUR_CLIENT_SECRET` with values from Step 2.

### Step 4: Automated Setup (Recommended)

**Windows:**
1. **Double-click** `setup-windows.bat`
2. Follow the on-screen instructions
3. Script will install everything automatically

**Linux/Mac:**
```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install backend
pip install -r backend/requirements.txt

# Install frontend
cd frontend
npm install
cd ..
```

### Step 5: Test Connection

**Windows:**
```cmd
venv\Scripts\activate
python test_connection.py
```

**Linux/Mac:**
```bash
source venv/bin/activate
python test_connection.py
```

Expected: `✅ Successfully authenticated with Dynamics 365`

### Step 6: Run Application

See **Quick Start** section above for your platform.

---

## Production (Ngrok)

For sharing over internet:

**Windows:**
1. Start backend and frontend first (see Quick Start)
2. **Double-click** `start-aos-production.bat`

**Linux/Mac:**
```bash
# Make sure backend and frontend are running first
./start-aos-production.sh
```

**Production URLs:**
- https://aos-entity-map-frontend.ngrok.app
- https://aos-entity-map-backend.ngrok.app

See [docs/NGROK_PRODUCTION.md](docs/NGROK_PRODUCTION.md) for details.

---

## Project Structure

```
aos-entity-structure/
├── backend/              # Python FastAPI backend
│   ├── app.py           # Main app with CORS
│   ├── routes/          # API endpoints
│   ├── services/        # Business logic
│   └── requirements.txt # Python dependencies
├── frontend/            # React TypeScript frontend
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── utils/       # Layout algorithms
│   │   ├── hooks/       # Data fetching
│   │   └── api/         # API client
│   ├── package.json     # Node dependencies
│   └── vite.config.ts   # Vite + ngrok config
├── dynamics_api/        # Dynamics 365 API client
├── scripts/             # Dev/testing scripts
├── deployment test/     # Ngrok deployment scripts
├── config/              # Ngrok configuration
├── docs/                # Documentation
├── venv/                # Python virtual environment
├── .env                 # Credentials (create this)
├── start-backend.sh     # Start backend (Linux/Mac)
├── start-backend.bat    # Start backend (Windows)
├── start-frontend.sh    # Start frontend (Linux/Mac)
├── start-frontend.bat   # Start frontend (Windows)
├── start-aos-production.sh   # Production deploy (Linux/Mac)
├── start-aos-production.bat  # Production deploy (Windows)
└── setup-windows.bat    # Automated setup (Windows)
```

---

## Troubleshooting

### Backend Issues

**"invalid_client" error:**
- Client secret expired → Create new one in Azure Portal → Update `.env`

**"ModuleNotFoundError":**
```bash
source venv/bin/activate
pip install -r backend/requirements.txt
```

**Port 8000 in use:**
```bash
lsof -i:8000
kill <PID>
```

### Frontend Issues

**"CORS error":**
- Make sure backend is running on port 8000
- Restart backend after updating `backend/app.py`

**Port 5174 in use:**
```bash
lsof -i:5174
kill <PID>
```

**"Network Error":**
- Backend not running
- Check `.env` credentials
- Run `python test_connection.py`

### Ngrok Issues

**403 Forbidden:**
- Restart frontend after backend CORS changes
- Check `frontend/vite.config.ts` has ngrok domains

---

## Documentation

- **[SYSTEM_ARCHITECTURE.md](docs/SYSTEM_ARCHITECTURE.md)** - Complete architecture & design
- **[NGROK_PRODUCTION.md](docs/NGROK_PRODUCTION.md)** - Production deployment guide
- **[BUSINESS_ENTITY_SUMMARY.md](docs/BUSINESS_ENTITY_SUMMARY.md)** - Business entities overview

**API Docs:**
- http://localhost:8000/docs (local)
- https://aos-entity-map-backend.ngrok.app/docs (production)

---

## Key Technologies

**Backend:** Python 3.10, FastAPI, MSAL, Dynamics 365 Web API
**Frontend:** React 18, TypeScript, Vite, React Flow, Tailwind CSS
**Production:** Ngrok with reserved domains
**Ports:** 8000 (backend), 5174 (frontend)

---

**Version:** 2.0.0
**Last Updated:** December 2025
**Production:** https://aos-entity-map-frontend.ngrok.app
