"""
Forecast API Route — AI-driven cost prediction.
"""

from fastapi import APIRouter, Query
from services.cost_service import get_daily_costs
from ai.prediction import predict_costs

router = APIRouter(tags=["Forecast"])


@router.get("/forecast")
def forecast(
    days: int = Query(14, ge=7, le=30, description="Forecast horizon (7-30 days)"),
):
    """
    Get AI-powered cost forecast for the next 7-30 days.
    Uses Linear Regression trained on historical spending patterns.
    """
    cost_data = get_daily_costs()
    daily = cost_data["daily_costs"]

    result = predict_costs(daily, forecast_days=days)
    return result
