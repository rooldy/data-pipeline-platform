"""
FastAPI Application - Data Pipeline Platform
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1.pipelines import router as pipelines_router
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Data Pipeline Platform API",
    description="API pour la création de pipelines ETL no-code avec architecture Medallion",
    version="0.2.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ──────────────────────────────────────────────────────────────────

app.include_router(pipelines_router)

# ── Events ───────────────────────────────────────────────────────────────────

@app.on_event("startup")
async def startup_event():
    logger.info("🚀 Starting Data Pipeline Platform API v0.2.0")
    logger.info("🏗️  Architecture: Medallion (Bronze/Silver/Gold)")

@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down...")

# ── Endpoints de base ────────────────────────────────────────────────────────

@app.get("/")
async def root():
    return {
        "message": "Data Pipeline Platform API",
        "version": "0.2.0",
        "status": "running",
        "architecture": "Medallion (Bronze/Silver/Gold)",
        "endpoints": {
            "docs":      "/docs",
            "health":    "/health",
            "pipelines": "/api/v1/pipelines",
        },
    }

@app.get("/health")
async def health():
    return {"status": "healthy", "service": "backend-api", "version": "0.2.0"}

@app.get("/api/v1/layers")
async def list_layers():
    return {
        "layers": [
            {"name": "bronze", "description": "Raw data ingestion",          "color": "#CD7F32"},
            {"name": "silver", "description": "Cleaned and validated data",  "color": "#C0C0C0"},
            {"name": "gold",   "description": "Business-ready aggregations", "color": "#FFD700"},
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)