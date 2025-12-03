"""
FastAPI application for Dynamics 365 Entity Visualization
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import logging
import sys
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import routes
from routes.entities import router as entities_router

# Create FastAPI app
app = FastAPI(
    title="Dynamics 365 Entity Visualization API",
    description="API for fetching and visualizing Dynamics 365 entity structures",
    version="1.0.0"
)

# Configure CORS for local development and ngrok production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        # Local development
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://localhost:3000",
        # Ngrok production (reserved domains)
        "https://aos-entity-map-frontend.ngrok.app",
        "https://aos-entity-map-backend.ngrok.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(entities_router, prefix="/api", tags=["entities"])


@app.get("/")
async def root():
    """
    Root endpoint
    """
    return {
        "message": "Dynamics 365 Entity Visualization API",
        "version": "1.0.0",
        "docs": "/docs"
    }


@app.get("/health")
async def health_check():
    """
    Health check endpoint
    """
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
