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
                f"Your {top_service['service']} cost dominates {top_service['percentage']}% "
                f"of total spending at ${top_service['total']:,.2f} this period. "
                f"Focus optimization efforts here for maximum impact."
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
                "icon": "📈",
                "title": "Costs Are Rising",
                "description": (
                    f"Your costs increased {change_pct:.1f}% month-over-month "
                    f"(${previous:,.2f} → ${current:,.2f}). Review recent deployments "
                    f"and scaling events to identify the cause."
                ),
                "category": "trend",
                "impact": "high",
            })
        elif change_pct < -5:
            insights.append({
                "icon": "📉",
                "title": "Costs Are Decreasing",
                "description": (
                    f"Great news! Costs dropped {abs(change_pct):.1f}% month-over-month "
                    f"(${previous:,.2f} → ${current:,.2f}). Your optimization efforts "
                    f"are paying off."
                ),
                "category": "trend",
                "impact": "positive",
            })
        else:
            insights.append({
                "icon": "➡️",
                "title": "Costs Are Stable",
                "description": (
                    f"Cloud spending is stable with only {abs(change_pct):.1f}% change "
                    f"month-over-month (${previous:,.2f} → ${current:,.2f}). "
                    f"A good time to focus on proactive optimization."
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
            "icon": "💤",
            "title": "Idle Resources Detected",
            "description": (
                f"{count} EC2 instances are running with less than 5% CPU utilization, "
                f"wasting an estimated ${waste:,.2f}/month. Stopping these could be your "
                f"quickest cost optimization win."
            ),
            "category": "waste",
            "impact": "high",
        })

    # ── 4. Savings Opportunity ─────────────────────────
    recs = generate_recommendations()
    if recs["total_potential_savings"] > 0:
        savings = recs["total_potential_savings"]
        insights.append({
            "icon": "💰",
            "title": "Savings Opportunity Identified",
            "description": (
                f"Our analysis identified potential savings of ${savings:,.2f}/month "
                f"across {len(recs['recommendations'])} optimization opportunities. "
                f"Check the Recommendations panel for actionable steps."
            ),
            "category": "savings",
            "impact": "high",
        })

    # ── 5. Service Diversity ───────────────────────────
    if len(breakdown) >= 4:
        top_two_pct = sum(s["percentage"] for s in breakdown[:2])
        if top_two_pct > 70:
            insights.append({
                "icon": "⚖️",
                "title": "Spending Concentration Risk",
                "description": (
                    f"Top 2 services account for {top_two_pct:.0f}% of your cloud spend. "
                    f"This concentration means cost spikes in {breakdown[0]['service']} or "
                    f"{breakdown[1]['service']} could significantly impact your budget."
                ),
                "category": "risk",
                "impact": "medium",
            })

    # ── 6. Weekend Optimization ────────────────────────
    insights.append({
        "icon": "🌙",
        "title": "Weekend Optimization Opportunity",
        "description": (
            "Non-production workloads (dev, staging, testing) can be automatically "
            "shut down during weekends. Implement scheduled scaling to save 20-30% "
            "on non-critical compute costs."
        ),
        "category": "optimization",
        "impact": "medium",
    })

    return {
        "insights": insights,
        "generated_at": datetime.now().isoformat(),
    }
