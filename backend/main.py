"""
Cloud FinOps AI Optimizer — Main Application Entry Point

A production-quality SaaS platform that monitors cloud costs,
detects anomalies, predicts future spending, and suggests
AI-driven optimizations to reduce cloud waste.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from datetime import datetime

from config import CORS_ORIGINS
from database import init_db


# ── Application Lifespan ──────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize database and seed data on startup."""
    print("🚀 Starting Cloud FinOps AI Optimizer...")
    init_db()

    # Seed simulated data if DB is empty
    from data_provider import seed_database_if_empty
    seed_database_if_empty()

    print("✓ Server ready")
    yield
    print("👋 Shutting down...")


# ── FastAPI App ────────────────────────────────────────

app = FastAPI(
    title="Cloud FinOps AI Optimizer",
    description="AI-powered cloud cost optimization platform",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS — allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health Check ───────────────────────────────────────

@app.get("/health")
def health_check():
    """Health check endpoint to verify server is running."""
    return {
        "status": "healthy",
        "service": "Cloud FinOps AI Optimizer",
        "version": "1.0.0",
        "timestamp": datetime.now().isoformat(),
    }


# ── Register Routers ──────────────────────────────────

from routes.cost import router as cost_router
from routes.forecast import router as forecast_router
from routes.anomalies import router as anomalies_router
from routes.resources import router as resources_router
from routes.recommendations import router as recommendations_router
from routes.budget import router as budget_router
from routes.insights import router as insights_router
from routes.export import router as export_router
from routes.auth import router as auth_router

app.include_router(cost_router)
app.include_router(forecast_router)
app.include_router(anomalies_router)
app.include_router(resources_router)
app.include_router(recommendations_router)
app.include_router(budget_router)
app.include_router(insights_router)
app.include_router(export_router)
app.include_router(auth_router)


@app.get("/savings")
def savings_tracker():
    """Combined savings data from recommendations and idle resources."""
    from services.recommendation_service import generate_recommendations
    from services.resource_service import get_idle_resources

    recs = generate_recommendations()
    idle = get_idle_resources()

    # Category breakdown
    categories = {}
    for rec in recs["recommendations"]:
        cat = rec["category"]
        if cat not in categories:
            categories[cat] = 0
        categories[cat] += rec["estimated_savings"]

    top_categories = [
        {"category": k, "amount": round(v, 2)}
        for k, v in sorted(categories.items(), key=lambda x: x[1], reverse=True)
    ]

    return {
        "total_potential_savings": recs["total_potential_savings"],
        "savings_this_month": round(recs["total_potential_savings"] * 0.6, 2),
        "savings_implemented": round(idle["total_monthly_waste"] * 0.3, 2),
        "top_categories": top_categories,
    }
