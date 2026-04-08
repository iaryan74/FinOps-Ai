"""
Budget API Route — Budget management and alert system.
"""

from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from services.budget_service import get_budget_status, set_budget

router = APIRouter(prefix="/budget", tags=["Budget"])


class BudgetInput(BaseModel):
    monthly_limit: float
    alert_threshold: Optional[float] = 80.0


@router.get("")
def budget_status():
    """
    Get current budget status: spend %, remaining, alerts.
    """
    return get_budget_status()


@router.post("")
def update_budget(data: BudgetInput):
    """
    Set or update the monthly budget limit and alert threshold.
    """
    return set_budget(data.monthly_limit, data.alert_threshold)
