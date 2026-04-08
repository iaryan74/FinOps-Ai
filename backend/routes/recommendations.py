"""
Recommendations API Route — AI-driven cost optimization suggestions.
"""

from fastapi import APIRouter
from services.recommendation_service import generate_recommendations

router = APIRouter(tags=["Recommendations"])


@router.get("/recommendations")
def recommendations():
    """
    Get AI-generated cost-saving recommendations.
    Each recommendation includes estimated savings, confidence level, and priority.
    """
    return generate_recommendations()
