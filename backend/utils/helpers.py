"""
Utility helpers for Cloud FinOps AI Optimizer.
"""

from datetime import datetime, timedelta
from typing import List, Tuple


def date_range(start_date: str, end_date: str) -> List[str]:
    """Generate a list of date strings (YYYY-MM-DD) between two dates inclusive."""
    start = datetime.strptime(start_date, "%Y-%m-%d")
    end = datetime.strptime(end_date, "%Y-%m-%d")
    dates = []
    current = start
    while current <= end:
        dates.append(current.strftime("%Y-%m-%d"))
        current += timedelta(days=1)
    return dates


def get_default_date_range() -> Tuple[str, str]:
    """Return default date range: 6 months ago to today."""
    end = datetime.now()
    start = end - timedelta(days=180)
    return start.strftime("%Y-%m-%d"), end.strftime("%Y-%m-%d")


def format_currency(amount: float) -> str:
    """Format amount as USD currency string."""
    return f"${amount:,.2f}"


def severity_from_deviation(pct: float) -> str:
    """Determine anomaly severity from percentage deviation."""
    if pct >= 80:
        return "critical"
    elif pct >= 50:
        return "high"
    elif pct >= 30:
        return "medium"
    return "low"


def priority_from_savings(amount: float) -> str:
    """Determine recommendation priority based on potential savings."""
    if amount >= 500:
        return "critical"
    elif amount >= 200:
        return "high"
    elif amount >= 50:
        return "medium"
    return "low"
