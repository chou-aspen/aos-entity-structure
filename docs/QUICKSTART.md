# Quick Start Guide

## Prerequisites Check
- [ ] Python 3.8+ installed
- [ ] Node.js 18+ installed (Vite 5.x compatible)
- [ ] Dynamics 365 credentials updated in `.env` file
- [ ] Client secret is not expired

## Quick Start (Recommended)

Use the provided startup scripts:

```bash
# Terminal 1 - Start Backend
./start-backend.sh

# Terminal 2 - Start Frontend
./start-frontend.sh
```

Then open http://localhost:5174 in your browser

---

## Manual Setup

## Step 1: Update Credentials

Edit `.env` file with your valid Dynamics 365 credentials:
```bash
DYNAMICS_CLIENT_SECRET=YOUR_NEW_SECRET_HERE
```

## Step 2: Test Connection

```bash
# Activate virtual environment
source venv/bin/activate

# Test credentials
python test_connection.py
```

You should see: ✓ Successfully acquired access token!

## Step 3: Start Backend

```bash
# From project root, with venv activated
python backend/app.py
```

Backend will run on: http://localhost:8000

## Step 4: Start Frontend

Open a new terminal:

```bash
# Navigate to frontend directory
cd frontend

# Start dev server
npm run dev
```

Frontend will run on: http://localhost:5174

## Step 5: Open Browser

Visit: http://localhost:5174

## Quick Commands

### Backend
```bash
# Activate venv
source venv/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend
python backend/app.py

# Test connection
python test_connection.py
```

### Frontend
```bash
# Install dependencies
cd frontend && npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Common Issues

**Backend won't start**: Check that venv is activated and dependencies are installed

**"Invalid client" error**: Update your client secret in `.env` file

**Frontend can't connect**: Ensure backend is running on port 8000

**Graph not loading**: Check browser console for errors, verify backend API at http://localhost:8000/docs

## File Structure Overview

```
├── .env                          # ⚠️ UPDATE THIS WITH VALID CREDENTIALS
├── backend/
│   ├── app.py                    # Main FastAPI app
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── EntityGraph.tsx   # Main visualization component
│   │   └── api/
│   │       └── dynamicsApi.ts    # API client
│   └── package.json
├── dynamics_api/
│   └── dynamics_api.py           # Dynamics 365 API wrapper
└── venv/                         # Virtual environment
```

## Next Steps

1. Update your client secret in `.env`
2. Run the test connection script
3. Start both servers
4. Explore the visualization!

For detailed information, see [README.md](README.md)
