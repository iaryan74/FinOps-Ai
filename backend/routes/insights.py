"""
Insights API Route — AI-generated textual insights.
"""

from fastapi import APIRouter
from services.insight_service import generate_insights

router = APIRouter(tags=["Insights"])


@router.get("/insights")
def insights():
    """
    Get AI-generated human-readable insights about cloud spending.
    """
    return generate_insights()
