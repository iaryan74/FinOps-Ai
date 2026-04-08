"""
AI-Driven Recommendation Engine — Cloud FinOps AI Optimizer

Generates dynamic cost-saving recommendations based on:
  1. Idle resource analysis
  2. Service-level spending patterns 
  3. Reserved Instance opportunities
  4. Right-sizing suggestions

Each recommendation includes estimated savings and confidence level.
"""

from typing import Dict, List
from services.cost_service import get_service_breakdown, get_monthly_summary, get_current_month_spend
from services.resource_service import get_idle_resources
from utils.helpers import priority_from_savings


def generate_recommendations() -> Dict:
    """
    Analyze usage patterns and generate actionable cost-saving recommendations.
    Combines rule-based logic with data-driven insights.
    """
    recommendations = []
    rec_id = 1

    # ── 1. Idle Resource Recommendations ───────────────
    idle_data = get_idle_resources()
    if idle_data["idle_resources"]:
        total_idle_waste = idle_data["total_monthly_waste"]

        recommendations.append({
            "id": rec_id,
            "category": "Idle Resources",
            "title": f"Terminate or stop {len(idle_data['idle_resources'])} idle EC2 instances",
            "description": (
                f"Detected {len(idle_data['idle_resources'])} EC2 instances with CPU utilization "
                f"below 5%. These instances are consuming resources without meaningful workload. "
                f"Consider stopping non-production instances and right-sizing production ones."
            ),
            "estimated_savings": round(total_idle_waste, 2),
            "confidence": 0.92,
            "priority": priority_from_savings(total_idle_waste),
            "action": "Review and stop/terminate idle instances",
        })
        rec_id += 1

        # Individual high-waste instances
        for resource in idle_data["idle_resources"][:3]:
            if resource["monthly_waste"] > 30:
                recommendations.append({
                    "id": rec_id,
                    "category": "Right-Sizing",
                    "title": f"Stop instance {resource['instance_id']} ({resource['environment']})",
                    "description": (
                        f"Instance {resource['instance_id']} ({resource['instance_type']}) in "
                        f"{resource['environment']} has only {resource['cpu_utilization']}% "
                        f"CPU utilization. {resource['suggested_action']}."
                    ),
                    "estimated_savings": resource["monthly_waste"],
                    "confidence": 0.88,
                    "priority": priority_from_savings(resource["monthly_waste"]),
                    "action": resource["suggested_action"],
                })
                rec_id += 1

    # ── 2. Reserved Instance Opportunity ───────────────
    breakdown = get_service_breakdown()
    ec2_spend = next((s for s in breakdown if "EC2" in s["service"]), None)

    if ec2_spend and ec2_spend["total"] > 500:
        ri_savings = round(ec2_spend["total"] * 0.35, 2)  # ~35% RI discount
        recommendations.append({
            "id": rec_id,
            "category": "Reserved Instances",
            "title": "Switch EC2 on-demand to Reserved Instances",
            "description": (
                f"Your EC2 spend of ${ec2_spend['total']:,.2f} this period accounts for "
                f"{ec2_spend['percentage']}% of total costs. Converting stable workloads "
                f"to 1-year Reserved Instances could save approximately 35% on compute costs."
            ),
            "estimated_savings": ri_savings,
            "confidence": 0.78,
            "priority": priority_from_savings(ri_savings),
            "action": "Analyze EC2 usage patterns and purchase Reserved Instances",
        })
        rec_id += 1

    # ── 3. S3 Storage Optimization ─────────────────────
    s3_spend = next((s for s in breakdown if "S3" in s["service"]), None)
    if s3_spend and s3_spend["total"] > 100:
        s3_savings = round(s3_spend["total"] * 0.25, 2)
        recommendations.append({
            "id": rec_id,
            "category": "Storage Optimization",
            "title": "Implement S3 Intelligent-Tiering",
            "description": (
                f"S3 spend of ${s3_spend['total']:,.2f} can be optimized by enabling "
                f"Intelligent-Tiering to automatically move infrequently accessed data "
                f"to cheaper storage classes. Estimated 20-30% reduction."
            ),
            "estimated_savings": s3_savings,
            "confidence": 0.72,
            "priority": priority_from_savings(s3_savings),
            "action": "Enable S3 Intelligent-Tiering on all buckets",
        })
        rec_id += 1

    # ── 4. Lambda Optimization ─────────────────────────
    lambda_spend = next((s for s in breakdown if "Lambda" in s["service"]), None)
    if lambda_spend and lambda_spend["total"] > 50:
        lambda_savings = round(lambda_spend["total"] * 0.20, 2)
        recommendations.append({
            "id": rec_id,
            "category": "Compute Optimization",
            "title": "Optimize Lambda memory allocation",
            "description": (
                f"Lambda functions spend ${lambda_spend['total']:,.2f}. Right-sizing "
                f"memory allocation using AWS Lambda Power Tuning can reduce costs by "
                f"10-25% while maintaining or improving performance."
            ),
            "estimated_savings": lambda_savings,
            "confidence": 0.65,
            "priority": priority_from_savings(lambda_savings),
            "action": "Run Lambda Power Tuning for top functions",
        })
        rec_id += 1

    # ── 5. Cost Trend Warning ──────────────────────────
    monthly = get_monthly_summary()
    if len(monthly) >= 3:
        recent_months = monthly[-3:]
        if all(
            recent_months[i]["total"] < recent_months[i + 1]["total"]
            for i in range(len(recent_months) - 1)
        ):
            growth = (
                (recent_months[-1]["total"] - recent_months[-3]["total"])
                / recent_months[-3]["total"]
            ) * 100
            recommendations.append({
                "id": rec_id,
                "category": "Cost Trend",
                "title": f"Address rising costs — {growth:.0f}% increase over 3 months",
                "description": (
                    f"Cloud costs have been increasing consistently over the past 3 months "
                    f"(from ${recent_months[-3]['total']:,.2f} to ${recent_months[-1]['total']:,.2f}). "
                    f"Review recent deployments and infrastructure changes to identify "
                    f"opportunities to optimize resource utilization."
                ),
                "estimated_savings": round(recent_months[-1]["total"] * 0.10, 2),
                "confidence": 0.60,
                "priority": "high",
                "action": "Conduct cost review of recent infrastructure changes",
            })
            rec_id += 1

    # ── Sort by estimated savings ──────────────────────
    recommendations.sort(key=lambda r: r["estimated_savings"], reverse=True)

    total_savings = round(sum(r["estimated_savings"] for r in recommendations), 2)

    return {
        "recommendations": recommendations,
        "total_potential_savings": total_savings,
    }
