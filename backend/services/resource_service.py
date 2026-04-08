"""
Resource service — EC2 instance analysis and idle detection.
"""

from typing import Dict, List
from database import get_db


def get_idle_resources() -> Dict:
    """
    Get idle (underutilized) EC2 instances.
    Idle = running with CPU utilization < 5%.
    """
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT instance_id, instance_type, state, cpu_utilization,
                   cost_per_hour, environment
            FROM resources
            WHERE state = 'running' AND cpu_utilization < 5.0
            ORDER BY cost_per_hour DESC
            """
        ).fetchall()

    idle_resources = []
    total_waste = 0.0

    for row in rows:
        monthly_waste = round(row["cost_per_hour"] * 24 * 30, 2)
        total_waste += monthly_waste

        # Determine suggested action based on utilization and environment
        cpu = row["cpu_utilization"]
        env = row["environment"]

        if env in ("development", "testing") and cpu < 2.0:
            action = "Terminate — non-production instance with negligible usage"
        elif cpu < 1.0:
            action = "Stop instance — virtually no activity detected"
        elif cpu < 3.0:
            action = "Schedule auto-stop during off-hours (nights/weekends)"
        else:
            action = "Downsize to a smaller instance type"

        idle_resources.append({
            "instance_id": row["instance_id"],
            "instance_type": row["instance_type"],
            "cpu_utilization": row["cpu_utilization"],
            "cost_per_hour": row["cost_per_hour"],
            "monthly_waste": monthly_waste,
            "environment": env,
            "suggested_action": action,
        })

    # Total instance count
    with get_db() as conn:
        total = conn.execute(
            "SELECT COUNT(*) as cnt FROM resources WHERE state = 'running'"
        ).fetchone()["cnt"]

    return {
        "idle_resources": idle_resources,
        "total_monthly_waste": round(total_waste, 2),
        "total_instances": total,
    }


def get_all_resources() -> List[Dict]:
    """Get all EC2 instances with their details."""
    with get_db() as conn:
        rows = conn.execute(
            """
            SELECT instance_id, instance_type, state, cpu_utilization,
                   cost_per_hour, environment
            FROM resources
            ORDER BY cpu_utilization ASC
            """
        ).fetchall()

    return [dict(row) for row in rows]
