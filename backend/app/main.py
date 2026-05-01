"""
FastAPI Application - Data Pipeline Platform
Main entry point for the API
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Data Pipeline Platform API",
    description="API pour la création de pipelines ETL no-code avec architecture Medallion",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "http://pipeline-frontend:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    """Actions au démarrage"""
    logger.info("🚀 Starting Data Pipeline Platform API...")
    logger.info("📊 Version: 0.1.0")
    logger.info("🏗️  Architecture: Medallion (Bronze/Silver/Gold)")

@app.on_event("shutdown")
async def shutdown_event():
    """Actions à l'arrêt"""
    logger.info("🛑 Shutting down Data Pipeline Platform API...")

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Data Pipeline Platform API",
        "version": "0.1.0",
        "status": "running",
        "architecture": "Medallion (Bronze/Silver/Gold)",
        "endpoints": {
            "docs": "/docs",
            "health": "/health",
            "pipelines": "/api/v1/pipelines"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint for Docker"""
    return {
        "status": "healthy",
        "service": "backend-api",
        "version": "0.1.0"
    }

@app.get("/api/v1/pipelines")
async def list_pipelines():
    """Liste des pipelines (placeholder)"""
    return {
        "pipelines": [],
        "total": 0,
        "message": "No pipelines yet. Start creating your first pipeline!"
    }

@app.get("/api/v1/layers")
async def list_layers():
    """Liste des couches Medallion"""
    return {
        "layers": [
            {
                "name": "bronze",
                "description": "Raw data ingestion layer",
                "color": "#CD7F32"
            },
            {
                "name": "silver",
                "description": "Cleaned and validated data layer",
                "color": "#C0C0C0"
            },
            {
                "name": "gold",
                "description": "Business-ready aggregated data layer",
                "color": "#FFD700"
            }
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
