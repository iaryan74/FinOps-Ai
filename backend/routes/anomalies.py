"""
Anomaly Detection API Route — Intelligent spike detection.
"""

from fastapi import APIRouter
from services.cost_service import get_daily_costs
from ai.anomaly import detect_anomalies

router = APIRouter(tags=["Anomalies"])


@router.get("/anomalies")
def anomalies():
    """
    Detect unusual cost spikes or drops using AI + statistical methods.
    Returns anomalies with human-readable explanations and severity levels.
    """
    cost_data = get_daily_costs()
    daily = cost_data["daily_costs"]

    result = detect_anomalies(daily)
    return result
