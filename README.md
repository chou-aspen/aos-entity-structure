# Dynamics 365 Entity Relationship Visualizer

An interactive web application for visualizing Dynamics 365 entity relationships with intelligent filtering, hierarchical color coding, and advanced interaction features.

## Overview

This application provides a comprehensive visualization of your Dynamics 365 entity structure, filtered to show only your team's custom entities plus essential system entities. It reduces visual complexity from 964 entities to a focused set of 38 entities that matter for your business.

## Key Features

### Visualization
- **Hierarchical Color Coding**: 4-level color system (Rose → Cyan → Emerald → Purple)
- **Circular Layout**: Concentric circles arranged by hierarchy level for optimal space distribution
- **Radial Focused View**: Click any entity to show only direct connections with auto-centering
- **Smooth Animations**: 300ms fade transitions and 800ms pan/zoom for seamless UX

### Filtering & Search
- **Smart Entity Filtering**: Shows 38 relevant entities from 964 total
  - Team custom entities (qrt_*)
  - Essential system entities (account, contact, systemuser)
  - Portfolio/Project entity (msdyn_project)
  - Excludes internal/system tables
- **Autocomplete Search**: Find entities quickly with real-time filtering
- **Hierarchy Level Filters**: Toggle visibility by entity level
- **Breadcrumb Navigation**: Track your path through entity relationships

### Interactive Features
- **Hover Tooltips**: View required fields or descriptions
  - Shows actual required fields from Dynamics for L1/L2/L3 entities
  - Displays field display names (not technical names)
  - Scrollable for long lists
- **Click to Focus**: See only direct relationships for selected entity
- **Background Click**: Restore full circular view
- **Dark Mode**: Automatic light/dark theme support
- **Pan & Zoom**: Full viewport control

## Entity Hierarchy

### Level 1 (Rose/Pink) - Account
- `account` - Top-level customer entity

### Level 2 (Cyan/Blue) - Portfolio/Project
- `qrt_portfolio` - Portfolio management
- `msdyn_project` - Microsoft Project entity

### Level 3 (Emerald/Green) - Child Entities (15)
- `qrt_agreements` - Legal agreements
- `qrt_bonds` - Financial bonds
- `qrt_designrequests` - Design requests
- `qrt_epca` - EPCA documents
- `qrt_estimateresquests` - Estimate requests (fixed typo)
- `qrt_financerequests` - Finance requests
- `qrt_icrequest` - IC requests
- `qrt_incentives` - Incentive programs
- `qrt_interconnectionagreementsandpayments` - Interconnection agreements
- `qrt_interconnectionapplicationsstudies` - Interconnection studies
- `qrt_permits` - Permits and approvals
- `qrt_procurementrequests` - Procurement requests
- `qrt_sitecontrol` - Site control documents
- `qrt_studies` - Various studies
- `qrt_titleandalta` - Title and ALTA documents

### Level 0 (Purple/Slate) - Other Entities (20)
**Other qrt_ custom entities:**
- Equipment, schedules, cost codes, etc. (18 entities)

**System entities:**
- `contact` - Contacts
- `systemuser` - Users

## Tech Stack

**Backend:**
- Python 3.10+
- FastAPI (Web framework)
- MSAL (Microsoft Authentication Library)
- Dynamics 365 Web API integration

**Frontend:**
- React 18 + TypeScript
- React Flow v12 (Graph visualization)
- Tailwind CSS (Styling)
- Vite (Build tool)

**Data Source:**
- Dynamics 365 CRM (aos.crm.dynamics.com)
- 964 total entities → 38 filtered
- Real-time API fetching (~2 seconds)

## Architecture

See [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for detailed system design.

```
Dynamics 365 (964 entities) → MSAL Auth → DynamicsAPI
  ↓
Entity Filtering (should_include_entity)
  ↓
38 Entities (team entities + system entities)
  ↓
Hierarchy Assignment (L0/L1/L2/L3)
  ↓
Required Fields Fetching (L1/L2/L3 only)
  ↓
FastAPI /api/graph endpoint
  ↓
React Frontend → Circular/Radial Layout
  ↓
Interactive Visualization
```

## Project Structure

```
aos-entity-structure/
├── backend/
│   ├── app.py                          # FastAPI app (port 8000)
│   ├── routes/
│   │   └── entities.py                 # API endpoints (/api/graph, /api/entities)
│   ├── services/
│   │   ├── dynamics_service.py         # Entity filtering & hierarchy logic
│   │   └── entity_filters.py           # Core + custom filtering
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── EntityGraph.tsx         # Main graph + interactions
│   │   │   └── EntityNode.tsx          # Node styling + tooltips
│   │   ├── utils/
│   │   │   └── layoutHelpers.ts        # Circular & radial layouts
│   │   ├── types/index.ts              # TypeScript interfaces
│   │   ├── hooks/useGraphData.ts       # Data fetching
│   │   └── api/dynamicsApi.ts          # API client
│   ├── package.json
│   └── vite.config.ts
├── dynamics_api/
│   ├── dynamics_api.py                 # MSAL + Web API wrapper
│   └── utils.py
├── scripts/                             # Utility scripts
│   ├── explore_entity_metadata.py      # Metadata exploration
│   ├── find_entity_creators.py         # Creator detection research
│   ├── final_creator_check.py          # Comprehensive creator detection testing
│   ├── test_final_filtering.py         # Filtering validation
│   ├── test_required_fields.py         # Required fields API testing
│   └── test_connection.py              # Dynamics API connection testing
├── .env                                 # Credentials (gitignored)
├── README.md                            # This file
└── SYSTEM_ARCHITECTURE.md               # Detailed architecture
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
  - Dynamics 365 API permissions (`user_impersonation`)

### 1. Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Azure Active Directory** → **App registrations**
3. Create or select your app registration
4. Go to **Certificates & secrets** → Create new client secret
5. **Copy the secret value immediately** (you won't see it again!)
6. Go to **API permissions**:
   - Add **Dynamics CRM** → **Delegated permissions** → **user_impersonation**
   - Grant admin consent

### 2. Environment Configuration

Create a `.env` file in the project root:

```bash
# Dynamics 365 Credentials
DYNAMICS_AUTHORITY=https://login.microsoftonline.com/YOUR_TENANT_ID
DYNAMICS_CLIENT_ID=YOUR_CLIENT_ID
DYNAMICS_CLIENT_SECRET=YOUR_CLIENT_SECRET
DYNAMICS_RESOURCE_URL=https://aos.crm.dynamics.com/
DYNAMICS_SCOPES=https://aos.crm.dynamics.com/.default
```

**Security Note:** The `.env` file is gitignored. Never commit credentials to version control.

### 3. Install Dependencies

```bash
# Backend
cd backend
pip install -r requirements.txt
cd ..

# Frontend
cd frontend
npm install
cd ..
```

### 4. Run Application

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m uvicorn app:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Access:** http://localhost:5174

**API Docs:** http://localhost:8000/docs

## API Endpoints

### `GET /api/graph`
Fetch complete graph data with entities and relationships.

**Query Parameters:**
- `filter_mode`: `core_custom` (default - recommended)
- `prefixes`: Comma-separated (e.g., `qrt_,msdyn_`)
- `limit`: Optional limit

**Example:**
```bash
curl http://localhost:8000/api/graph?filter_mode=core_custom&prefixes=qrt_,msdyn_
```

**Response:**
```json
{
  "nodes": [...],        // 38 entities with hierarchyLevel
  "edges": [...],        // Relationships between entities
  "nodeCount": 38,
  "edgeCount": 126
}
```

### `GET /api/entities`
Fetch all filtered entities with metadata.

**Response:**
```json
{
  "entities": [
    {
      "id": "account",
      "label": "Account",
      "logicalName": "account",
      "hierarchyLevel": 1,
      "requiredFields": [
        {"displayName": "Account Name", "logicalName": "name"},
        {"displayName": "Account Number", "logicalName": "accountnumber"}
      ],
      "isCustomEntity": false,
      ...
    }
  ],
  "count": 38
}
```

### `GET /health`
Health check endpoint.

**Response:** `{"status": "healthy"}`

## Usage Guide

### Basic Navigation
1. **Load the app** - Wait ~2 seconds for data to load (38 entities, 126 relationships)
2. **View full graph** - All entities in circular layout by hierarchy level
3. **Click entity** - Focus view shows only direct connections
4. **Click background** - Return to full circular view
5. **Use search** - Type to find entities with autocomplete
6. **Toggle filters** - Show/hide by hierarchy level
7. **Hover entities** - View required fields or descriptions

### Entity Filtering Logic

**Included (38 entities):**
```python
# Team custom entities (qrt_* prefix)
- All qrt_ entities EXCEPT excluded ones

# Required system entities
- account, contact, systemuser

# Microsoft entities
- msdyn_project
```

**Excluded (11 qrt_ entities):**
```python
excluded = [
    'qrt_taskconfiguration',
    'qrt_taskrules',
    'qrt_taskconfigrule',
    'qrt_bidissuance',
    'qrt_submittals',
    'qrt_assetcontract',
    'qrt_bidpackage',
    'qrt_bidpackage_account',
    'qrt_bidpackage_msdyn_project',
    'qrt_departmentheadsmeetingagenda',
    'qrt_flowconfiguration',
]
```

## Performance

- **Initial Load:** ~2 seconds (fetches 38 entities with required fields for L1/L2/L3)
- **Entity Switch:** <100ms (client-side layout calculation)
- **Search:** Real-time (client-side filtering)
- **API Response:**
  - `/api/entities`: ~2s
  - `/api/graph`: ~2s

**Optimization:**
- Only L1/L2/L3 entities (18 total) fetch required fields from Dynamics
- L0 entities use cached descriptions
- Client-side caching of entity data

## Troubleshooting

| Issue | Solution |
|-------|----------|
| **"invalid_client" error** | Generate new client secret in Azure Portal and update `.env` |
| **"KeyError: 'access_token'"** | Verify tenant ID and app permissions in `.env` |
| **Network/CORS error** | Ensure backend is running on port 8000 |
| **Graph not rendering** | Check browser console - verify `/api/graph` returns 38 entities |
| **Slow loading** | Normal for initial load (~2s for 38 entities + required fields) |
| **Missing entities** | Check `should_include_entity()` in `dynamics_service.py` |

**Test API Connection:**
```bash
curl http://localhost:8000/api/graph | jq '.nodeCount'
# Should return: 38
```

## Development

### Adding/Removing Entities

**To add an entity to L1/L2/L3:**
1. Edit `backend/services/dynamics_service.py`
2. Update `get_hierarchy_level()` function
3. Restart backend

**To exclude an entity:**
1. Edit `backend/services/dynamics_service.py`
2. Add to `excluded_entities` set in `should_include_entity()`
3. Restart backend

### Key Configuration Files

- **Entity filtering:** `backend/services/dynamics_service.py` (lines 25-72)
- **Hierarchy levels:** `backend/services/dynamics_service.py` (lines 75-118)
- **Layout radii:** `frontend/src/utils/layoutHelpers.ts` (lines 103, 189)
- **Colors:** `frontend/src/components/EntityNode.tsx` (lines 29-41)

## Security Best Practices

- ✅ Never commit `.env` to version control (already in `.gitignore`)
- ✅ Rotate Azure client secrets every 90 days
- ✅ Use Azure Key Vault for production deployments
- ✅ Review API permissions quarterly
- ✅ Limit app registration to minimum required scopes
- ✅ Enable Azure AD conditional access policies

## Production Deployment

For production deployment recommendations, see [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) section on "Production Considerations."

**Quick checklist:**
- [ ] Set up Redis caching (reduces load time to <100ms)
- [ ] Implement rate limiting
- [ ] Configure environment-based CORS
- [ ] Enable monitoring (Sentry, Application Insights)
- [ ] Set up SSL/TLS certificates
- [ ] Configure auto-scaling (Azure App Service)

## License

Internal use only for AOS organization.

## Support

For issues or questions:
1. Check [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md) for technical details
2. Review API docs at http://localhost:8000/docs
3. Check browser console for frontend errors
4. Review backend logs for API issues

---

**Version:** 1.0.0
**Last Updated:** November 2025
**Maintained by:** AOS Development Team
