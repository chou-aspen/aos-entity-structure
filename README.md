# Dynamics 365 Entity Structure Visualizer

An interactive web application for visualizing Dynamics 365 entity relationships, built with React Flow and FastAPI.

## Features

- **Interactive Entity Graph**: Visualize all Dynamics 365 entities and their relationships
- **Click Interactions**: Click on any entity to highlight its related entities and gray out unrelated ones
- **Relationship Highlighting**: See connections animate when viewing entity relationships
- **Layout Options**: Toggle between vertical and horizontal graph layouts
- **Entity Information**: View entity metadata including custom entities, activities, and descriptions
- **Responsive Controls**: Zoom, pan, and navigate the graph with intuitive controls

## Tech Stack

### Backend
- **FastAPI**: Modern Python web framework
- **MSAL**: Microsoft Authentication Library for Dynamics 365 API access
- **Python 3.x**: Core language

### Frontend
- **React 18**: UI framework
- **TypeScript**: Type-safe JavaScript
- **React Flow**: Graph visualization library
- **Tailwind CSS**: Utility-first CSS framework
- **Vite**: Fast build tool
- **Dagre**: Graph layout algorithm

## Project Structure

```
aos-entity-structure/
├── backend/
│   ├── app.py                    # FastAPI application
│   ├── routes/
│   │   └── entities.py           # API endpoints
│   ├── services/
│   │   └── dynamics_service.py   # Business logic
│   └── requirements.txt          # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── dynamicsApi.ts    # API client
│   │   ├── components/
│   │   │   ├── EntityGraph.tsx   # Main graph component
│   │   │   └── EntityNode.tsx    # Custom node component
│   │   ├── hooks/
│   │   │   └── useGraphData.ts   # Data fetching hook
│   │   ├── types/
│   │   │   └── index.ts          # TypeScript types
│   │   ├── utils/
│   │   │   └── layoutHelpers.ts  # Layout algorithms
│   │   └── App.tsx               # Root component
│   └── package.json
├── dynamics_api/
│   ├── dynamics_api.py           # Dynamics 365 API wrapper
│   └── utils.py
├── .env                          # Environment variables (DO NOT COMMIT)
├── .gitignore
└── README.md
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

### 3. Backend Setup

```bash
# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r backend/requirements.txt

# Test Dynamics 365 connection
python test_connection.py

# Start backend server
python backend/app.py
```

The backend will run on `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### 4. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

1. **Start both servers** (backend and frontend)
2. **Open browser** to `http://localhost:5173`
3. **Wait for data to load** (initial load may take 30-60 seconds for large orgs)
4. **Interact with the graph**:
   - Click on any entity to highlight its relationships
   - Click on empty space to reset the view
   - Use mouse wheel to zoom in/out
   - Drag to pan around the graph
   - Toggle layout direction using the button in the top-left panel

## API Endpoints

### `GET /api/entities`
Fetch all entity definitions

### `GET /api/relationships`
Fetch all relationship definitions

### `GET /api/graph`
Fetch complete graph data (entities + relationships)

Response:
```json
{
  "nodes": [...],
  "edges": [...],
  "nodeCount": 500,
  "edgeCount": 1200
}
```

## Troubleshooting

### Backend Issues

**"invalid_client" or "expired secret"**
- Your client secret has expired
- Generate a new secret in Azure Portal
- Update `.env` file with the new secret

**"KeyError: 'access_token'"**
- Check your Azure AD app permissions
- Ensure the app has Dynamics 365 API access
- Verify tenant ID is correct

**Import errors**
- Ensure virtual environment is activated
- Run `pip install -r backend/requirements.txt`

### Frontend Issues

**"Network Error" or "CORS error"**
- Ensure backend is running on port 8000
- Check CORS settings in `backend/app.py`

**Graph not rendering**
- Check browser console for errors
- Verify API responses in Network tab
- Ensure backend is returning valid data

**Slow loading**
- Large organizations (500+ entities) may take time
- Consider implementing pagination or filtering
- Check network speed and backend response times

## Development

### Adding New Features

1. **Backend**: Add new endpoints in `backend/routes/`
2. **Frontend**: Add new components in `frontend/src/components/`
3. **API Client**: Update `frontend/src/api/dynamicsApi.ts`

### Testing Backend Connection

```bash
python test_connection.py
```

This will verify your Dynamics 365 credentials without starting the full server.

## Deployment

### Using ngrok for Remote Access

```bash
# Install ngrok
# https://ngrok.com/download

# Expose backend
ngrok http 8000

# Update frontend API_BASE_URL in src/api/dynamicsApi.ts
# to use ngrok URL
```

### Production Deployment

For production deployment, consider:
- Using environment-specific `.env` files
- Implementing authentication/authorization
- Setting up HTTPS
- Using Docker containers
- Deploying to Azure App Service or similar platform

## Security Notes

- **Never commit `.env` files** to version control
- **Rotate client secrets regularly**
- **Use Azure Key Vault** for production secrets
- **Implement proper authentication** for production deployment
- **Review API permissions** regularly

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

Internal use only for AOS organization.

## Contact

For questions or issues, contact the development team.
