"""
Budget service — budget management and alert generation.
"""

from typing import Dict, List
from database import get_db
from services.cost_service import get_current_month_spend


def get_budget_status() -> Dict:
    """
    Get current budget status including spend %, remaining, and alerts.
    """
    with get_db() as conn:
        budget_row = conn.execute(
            "SELECT * FROM budgets ORDER BY created_at DESC LIMIT 1"
        ).fetchone()

    if not budget_row:
        return {
            "monthly_limit": 0,
            "current_spend": 0,
            "percentage_used": 0,
            "remaining": 0,
            "alert_threshold": 80.0,
            "is_over_budget": False,
            "alerts": ["No budget configured. Set a monthly budget to enable tracking."],
        }

    monthly_limit = budget_row["monthly_limit"]
    alert_threshold = budget_row["alert_threshold"]
    current_spend = get_current_month_spend()
    percentage_used = round((current_spend / monthly_limit) * 100, 1) if monthly_limit > 0 else 0
    remaining = round(monthly_limit - current_spend, 2)
    is_over = current_spend > monthly_limit

    # Generate alerts
    alerts = []
    if is_over:
        overage = round(current_spend - monthly_limit, 2)
        alerts.append(f"🚨 OVER BUDGET by ${overage:,.2f}! Current spend: ${current_spend:,.2f}")
    elif percentage_used >= 95:
        alerts.append(f"⚠️ Critical: {percentage_used}% of budget used. Only ${remaining:,.2f} remaining.")
    elif percentage_used >= alert_threshold:
        alerts.append(f"⚠️ Budget alert: {percentage_used}% of monthly budget consumed.")

    if percentage_used >= 50 and percentage_used < alert_threshold:
        alerts.append(f"📊 Budget check: {percentage_used}% used — ${remaining:,.2f} remaining this month.")

    return {
        "monthly_limit": monthly_limit,
        "current_spend": current_spend,
        "percentage_used": percentage_used,
        "remaining": max(remaining, 0),
        "alert_threshold": alert_threshold,
        "is_over_budget": is_over,
        "alerts": alerts,
    }


def set_budget(monthly_limit: float, alert_threshold: float = 80.0) -> Dict:
    """
    Create or update the monthly budget.
    """
    with get_db() as conn:
        conn.execute("DELETE FROM budgets")
        conn.execute(
            "INSERT INTO budgets (user_id, monthly_limit, alert_threshold) VALUES (?, ?, ?)",
            (1, monthly_limit, alert_threshold),
        )

    return get_budget_status()
