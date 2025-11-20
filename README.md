# Dynamics 365 Entity Structure Visualizer

An interactive web application for visualizing Dynamics 365 entity relationships with hierarchical color coding and focused radial views.

## Features

- **Hierarchy Visualization**: Color-coded entities (Red: Account → Blue: Portfolio/Project → Green: Child entities)
- **Circular Layout**: All entities arranged in concentric circles by hierarchy level for equal space distribution
- **Focused View**: Click any entity to show only direct connections in radial layout with auto-centering
- **Smart Filtering**: Displays 270 relevant entities (filtered from 964) with custom prefix support
- **Smooth Animations**: 300ms fade transitions and 800ms pan/zoom animations for seamless interactions
- **Interactive Controls**: Zoom, pan, and click background to restore full view

## Tech Stack

**Backend**: FastAPI + MSAL + Python 3.10
**Frontend**: React 18 + TypeScript + React Flow v12 + Tailwind CSS + Vite
**Layouts**: Dagre (hierarchical), Custom Circular, Custom Radial

## Data Flow

```
Dynamics 365 CRM (964 entities, 12,490 relationships)
    ↓ MSAL Authentication
DynamicsAPI (dynamics_api.py)
    ↓ Entity Definitions + Relationships
DynamicsService (adds hierarchyLevel: 1/2/3)
    ↓ Filter to core + custom (qrt_, msdyn_)
EntityFilters (270 entities, 452 relationships)
    ↓ FastAPI /api/graph endpoint
Frontend useGraphData hook
    ↓ Apply layout algorithm
getFullCircularLayout() or getRadialLayout()
    ↓ Render with React Flow
Interactive Graph Visualization
```

## Architecture

**Hierarchy Levels**:
- **Level 1 (Red)**: `account` - Top level
- **Level 2 (Blue)**: `qrt_portfolio`, `msdyn_project` - Portfolio/Project
- **Level 3 (Green)**: Child entities (bonds, permits, studies, etc.)

**Layout Algorithms**:
- **Full View**: Concentric circles (radii: 400px, 800px, 1200px, 2400px)
- **Focused View**: Radial layout (selected entity at center, connections in rings)

## Project Structure

```
aos-entity-structure/
├── backend/
│   ├── app.py                          # FastAPI app (port 8000)
│   ├── routes/entities.py              # /api/graph endpoint
│   ├── services/
│   │   ├── dynamics_service.py         # get_hierarchy_level(), entity fetching
│   │   └── entity_filters.py           # Filtering logic (270 from 964)
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EntityGraph.tsx         # Main graph + focused view logic
│   │   │   └── EntityNode.tsx          # Hierarchy color styling
│   │   ├── utils/layoutHelpers.ts      # getFullCircularLayout(), getRadialLayout()
│   │   ├── types/index.ts              # Entity interface + hierarchyLevel
│   │   ├── hooks/useGraphData.ts       # API data fetching
│   │   └── App.tsx                     # ReactFlowProvider wrapper
│   └── package.json
├── dynamics_api/dynamics_api.py        # MSAL auth + CRM API wrapper
├── .env                                # Dynamics 365 credentials
├── start-backend.sh                    # Quick start script
└── start-frontend.sh                   # Quick start script
```

## Setup Instructions

### Prerequisites

- Python 3.8+
- Node.js 18+ and npm
- Dynamics 365 instance with API access
- Azure AD App Registration with:
  - Client ID
  - Client Secret (active/non-expired)
  - Tenant ID
  - Dynamics 365 API permissions

### 1. Azure AD Setup

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Create or select your app registration
4. Go to **Certificates & secrets** → Create new client secret
5. Copy the secret value immediately (you won't see it again!)
6. Go to **API permissions** → Ensure Dynamics 365 permissions are granted

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
# Dynamics 365 Credentials
DYNAMICS_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
DYNAMICS_CLIENT_ID=YOUR_CLIENT_ID
DYNAMICS_CLIENT_SECRET=YOUR_CLIENT_SECRET
DYNAMICS_RESOURCE_URL=https://YOUR_ORG.crm.dynamics.com/
DYNAMICS_SCOPES=https://YOUR_ORG.crm.dynamics.com/.default
```

**Important**: Never commit the `.env` file to Git. It's already in `.gitignore`.

### 3. Install Dependencies

```bash
# Backend
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt

# Frontend
cd frontend && npm install && cd ..
```

### 4. Quick Start

```bash
# Terminal 1 - Backend
./start-backend.sh    # Runs on http://localhost:8000

# Terminal 2 - Frontend
./start-frontend.sh   # Runs on http://localhost:5174
```

**API Docs**: http://localhost:8000/docs

## Usage

1. Open browser to `http://localhost:5174`
2. Wait for data to load (5-7 seconds, fetches 270 entities)
3. **Interact with the graph**:
   - **Click entity**: Shows only direct connections in radial layout (auto-centers)
   - **Click background**: Restore full circular view
   - **Scroll**: Zoom in/out
   - **Drag**: Pan around the graph
4. **View hierarchy** by color: Red (top) → Blue (middle) → Green (children)

## API Endpoints

### `GET /api/graph`
Fetch complete graph data with smart filtering.

**Query Parameters**:
- `filter_mode`: `core_custom` (default), `business`, `custom`, or `all`
- `prefixes`: Comma-separated prefixes (e.g., `qrt_,msdyn_`)
- `limit`: Optional entity limit

**Example**:
```
GET /api/graph?filter_mode=core_custom&prefixes=qrt_,msdyn_
```

**Response**:
```json
{
  "nodes": [...],           // 270 entities with hierarchyLevel field
  "edges": [...],           // 452 relationships
  "nodeCount": 270,
  "edgeCount": 452
}
```

### `GET /health`
Health check endpoint - returns `{"status":"healthy"}`

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"invalid_client" or expired secret** | Generate new client secret in Azure Portal and update `.env` |
| **"KeyError: 'access_token'"** | Verify Azure AD app permissions and tenant ID in `.env` |
| **Network/CORS error** | Ensure backend is running on port 8000 |
| **Graph not rendering** | Check browser console and verify `/api/graph` returns valid data |
| **Slow loading** | Normal for initial load (5-7 seconds for 270 entities) |

**Test connection**:
```bash
python test_connection.py
```

## Development

**Key Files**:
- Backend logic: `backend/services/dynamics_service.py` (hierarchy levels)
- Filtering: `backend/services/entity_filters.py` (270 from 964)
- Layout algorithms: `frontend/src/utils/layoutHelpers.ts`
- Focused view: `frontend/src/components/EntityGraph.tsx` (lines 108-219)

## Security

- Never commit `.env` to version control (already in `.gitignore`)
- Rotate Azure client secrets regularly
- Use Azure Key Vault for production
- Review API permissions quarterly

## License

Internal use only for AOS organization.
