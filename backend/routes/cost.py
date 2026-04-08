"""
Cost API Routes — Daily costs, service breakdowns, and monthly summaries.
"""

from fastapi import APIRouter, Query
from typing import Optional
from services.cost_service import get_daily_costs, get_service_breakdown, get_monthly_summary

router = APIRouter(prefix="/cost", tags=["Cost"])


@router.get("/daily")
def daily_costs(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """
    Get daily cost data with optional date range filtering.
    Returns daily totals, average, and service breakdown per day.
    """
    return get_daily_costs(start_date, end_date)


@router.get("/breakdown")
def service_breakdown(
    start_date: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
):
    """
    Get cost breakdown by AWS service.
    Shows each service's total spend and percentage of overall cost.
    """
    return get_service_breakdown(start_date, end_date)


@router.get("/monthly")
def monthly_summary():
    """
    Get monthly cost totals for trend visualization.
    """
    return get_monthly_summary()
