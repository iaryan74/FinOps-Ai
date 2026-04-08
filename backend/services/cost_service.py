"""
Cost service — aggregates and transforms cost data for the API.
"""

from typing import List, Dict, Optional, Tuple
from datetime import datetime, timedelta
from database import get_db


def get_daily_costs(start_date: Optional[str] = None, end_date: Optional[str] = None) -> Dict:
    """
    Get daily cost data aggregated across all services.
    Returns daily totals + overall summary.
    """
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    if not start_date:
        start_date = (datetime.now() - timedelta(days=90)).strftime("%Y-%m-%d")

    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT date, SUM(amount) as total
            FROM cost_data
            WHERE date BETWEEN ? AND ?
            GROUP BY date
            ORDER BY date
            """,
            (start_date, end_date),
        ).fetchall()

    daily_costs = []
    total = 0.0

    for row in rows:
        day_total = round(row["total"], 2)
        total += day_total

        # Get service breakdown for this day
        with get_db() as conn:
            services_rows = conn.execute(
                "SELECT service, amount FROM cost_data WHERE date = ?",
                (row["date"],),
            ).fetchall()

        services = {s["service"]: round(s["amount"], 2) for s in services_rows}

        daily_costs.append({
            "date": row["date"],
            "amount": day_total,
            "services": services,
        })

    num_days = max(len(daily_costs), 1)

    return {
        "daily_costs": daily_costs,
        "total": round(total, 2),
        "avg_daily": round(total / num_days, 2),
        "period_start": start_date,
        "period_end": end_date,
    }


def get_service_breakdown(start_date: Optional[str] = None, end_date: Optional[str] = None) -> List[Dict]:
    """
    Get cost breakdown by service for the given period.
    Returns sorted list of services with totals and percentages.
    """
    if not end_date:
        end_date = datetime.now().strftime("%Y-%m-%d")
    if not start_date:
        start_date = (datetime.now() - timedelta(days=30)).strftime("%Y-%m-%d")

    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT service, SUM(amount) as total
            FROM cost_data
            WHERE date BETWEEN ? AND ?
            GROUP BY service
            ORDER BY total DESC
            """,
            (start_date, end_date),
        ).fetchall()

    grand_total = sum(row["total"] for row in rows) or 1.0

    breakdown = []
    for row in rows:
        breakdown.append({
            "service": row["service"],
            "total": round(row["total"], 2),
            "percentage": round((row["total"] / grand_total) * 100, 1),
        })

    return breakdown


def get_monthly_summary() -> List[Dict]:
    """Get monthly cost totals for trend analysis."""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT 
                substr(date, 1, 7) as month,
                SUM(amount) as total
            FROM cost_data
            GROUP BY month
            ORDER BY month
            """
        ).fetchall()

    return [{"month": row["month"], "total": round(row["total"], 2)} for row in rows]


def get_current_month_spend() -> float:
    """Get total spending for the current month."""
    current_month = datetime.now().strftime("%Y-%m")
    with get_db() as conn:
        row = conn.execute(
            "SELECT SUM(amount) as total FROM cost_data WHERE date LIKE ?",
            (f"{current_month}%",),
        ).fetchone()
    return round(row["total"] or 0.0, 2)
