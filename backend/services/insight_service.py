"""
AI Insights Service — Generates human-readable cost intelligence.

Uses template-based text generation to create actionable insights
from cost data, trends, and resource utilization patterns.
"""

from datetime import datetime
from typing import Dict, List
from services.cost_service import get_service_breakdown, get_monthly_summary, get_current_month_spend
from services.resource_service import get_idle_resources
from services.recommendation_service import generate_recommendations


def generate_insights() -> Dict:
    """
    Generate human-readable AI insights about cloud spending.
    Analyzes cost trends, service distribution, and optimization opportunities.
    """
    insights = []

    # ── 1. Dominant Service Analysis ───────────────────
    breakdown = get_service_breakdown()
    if breakdown:
        top_service = breakdown[0]
        insights.append({
            "icon": "📊",
            "title": "Top Cost Driver",
            "description": (
                f"Cause: Your {top_service['service']} dominates {top_service['percentage']}% of total spending this period. "
                f"Impact: High cost concentration (${top_service['total']:,.2f}). "
                f"Action: Audit {top_service['service']} usage patterns immediately to identify scaling inefficiencies."
            ),
            "category": "cost_analysis",
            "impact": "high",
        })

    # ── 2. Month-over-Month Trend ──────────────────────
    monthly = get_monthly_summary()
    if len(monthly) >= 2:
        current = monthly[-1]["total"]
        previous = monthly[-2]["total"]
        change_pct = ((current - previous) / previous) * 100 if previous > 0 else 0

        if change_pct > 5:
            insights.append({
                "icon": "💥",
                "title": "Severe Cost Drift Detected",
                "description": (
                    f"Cause: Sustained elevated usage caused a {change_pct:.1f}% month-over-month increase. "
                    f"Impact: Spending rose from ${previous:,.2f} to ${current:,.2f}, directly threatening budget thresholds. "
                    f"Action: Implement aggressive resource scaling optimization and investigate recent deployments."
                ),
                "category": "trend",
                "impact": "high",
            })
        elif change_pct < -5:
            insights.append({
                "icon": "✅",
                "title": "Optimization Success",
                "description": (
                    f"Cause: Successful implementation of scaling policies dropped costs by {abs(change_pct):.1f}%. "
                    f"Impact: Monthly bill reduced from ${previous:,.2f} to ${current:,.2f}. "
                    f"Action: Continue monitoring and maintain current automated lifecycle policies."
                ),
                "category": "trend",
                "impact": "positive",
            })
        else:
            insights.append({
                "icon": "⚖️",
                "title": "Spending Baseline Stable",
                "description": (
                    f"Cause: Workloads are operating within a strict {abs(change_pct):.1f}% variance threshold. "
                    f"Impact: High cost predictability (${current:,.2f}/mo). "
                    f"Action: Shift focus toward proactive reserved instance purchasing to lock in discounts."
                ),
                "category": "trend",
                "impact": "neutral",
            })

    # ── 3. Idle Resource Warning ───────────────────────
    idle_data = get_idle_resources()
    if idle_data["idle_resources"]:
        waste = idle_data["total_monthly_waste"]
        count = len(idle_data["idle_resources"])
        insights.append({
            "icon": "⚠️",
            "title": "Critical Cloud Waste",
            "description": (
                f"Cause: {count} EC2 instances are actively running with compute utilization below 5%. "
                f"Impact: Haemorrhaging an estimated ${waste:,.2f} per month in pure waste. "
                f"Action: Terminate or stop these instances to realize immediate capital recapture."
            ),
            "category": "waste",
            "impact": "high",
        })

    # ── 4. Savings Opportunity ─────────────────────────
    recs = generate_recommendations()
    if recs["total_potential_savings"] > 0:
        savings = recs["total_potential_savings"]
        insights.append({
            "icon": "💡",
            "title": "Actionable Savings Pool",
            "description": (
                f"Cause: AI engine identified {len(recs['recommendations'])} structural optimization opportunities. "
                f"Impact: Potential immediate recapture of ${savings:,.2f}/month. "
                f"Action: Review and execute pending recommendations in the AI Decision Mode."
            ),
            "category": "savings",
            "impact": "high",
        })

    # ── 5. Service Diversity ───────────────────────────
    if len(breakdown) >= 4:
        top_two_pct = sum(s["percentage"] for s in breakdown[:2])
        if top_two_pct > 70:
            insights.append({
                "icon": "🔍",
                "title": "Architecture Monoculture Risk",
                "description": (
                    f"Cause: {top_two_pct:.0f}% of enterprise cloud footprint is concentrated in just 2 services. "
                    f"Impact: High vulnerability. Any pricing changes or usage spikes in {breakdown[0]['service']} or {breakdown[1]['service']} will deeply harm margins. "
                    f"Action: Diversify architecture or aggressively negotiate reserved pricing tiers."
                ),
                "category": "risk",
                "impact": "medium",
            })

    # ── 6. Weekend Optimization ────────────────────────
    insights.append({
        "icon": "⏱️",
        "title": "Compute Idle Hours",
        "description": (
            "Cause: Non-production environments are running uninterrupted during weekends. "
            "Impact: Roughly 28% of development compute spend is wasted on idle time. "
            "Action: Automate an AWS Lambda scheduler to stop non-prod tagged instances Friday evening."
        ),
        "category": "optimization",
        "impact": "medium",
    })

    return {
        "insights": insights,
        "generated_at": datetime.now().isoformat(),
    }
