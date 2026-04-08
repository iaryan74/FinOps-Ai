"""
Pydantic schemas for request/response validation.
"""

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date


# ── Auth Schemas ───────────────────────────────────────

class UserSignup(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = ""

class UserLogin(BaseModel):
    email: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: str

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str


# ── Cost Schemas ───────────────────────────────────────

class DailyCost(BaseModel):
    date: str
    amount: float
    services: Optional[dict] = None

class ServiceBreakdown(BaseModel):
    service: str
    total: float
    percentage: float

class CostResponse(BaseModel):
    daily_costs: List[DailyCost]
    total: float
    avg_daily: float
    period_start: str
    period_end: str


# ── Forecast Schemas ───────────────────────────────────

class ForecastPoint(BaseModel):
    date: str
    predicted: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    historical: List[DailyCost]
    forecast: List[ForecastPoint]
    trend: str
    predicted_monthly: float
    model_accuracy: float


# ── Anomaly Schemas ────────────────────────────────────

class Anomaly(BaseModel):
    date: str
    actual_cost: float
    expected_cost: float
    deviation_pct: float
    severity: str
    explanation: str

class AnomalyResponse(BaseModel):
    anomalies: List[Anomaly]
    total_detected: int
    monitoring_period: str


# ── Resource Schemas ───────────────────────────────────

class IdleResource(BaseModel):
    instance_id: str
    instance_type: str
    cpu_utilization: float
    cost_per_hour: float
    monthly_waste: float
    environment: str
    suggested_action: str

class ResourceResponse(BaseModel):
    idle_resources: List[IdleResource]
    total_monthly_waste: float
    total_instances: int


# ── Recommendation Schemas ─────────────────────────────

class Recommendation(BaseModel):
    id: int
    category: str
    title: str
    description: str
    estimated_savings: float
    confidence: float
    priority: str
    action: str

class RecommendationResponse(BaseModel):
    recommendations: List[Recommendation]
    total_potential_savings: float


# ── Budget Schemas ─────────────────────────────────────

class BudgetSet(BaseModel):
    monthly_limit: float
    alert_threshold: Optional[float] = 80.0

class BudgetStatus(BaseModel):
    monthly_limit: float
    current_spend: float
    percentage_used: float
    remaining: float
    alert_threshold: float
    is_over_budget: bool
    alerts: List[str]


# ── Insights Schema ───────────────────────────────────

class Insight(BaseModel):
    icon: str
    title: str
    description: str
    category: str
    impact: str

class InsightResponse(BaseModel):
    insights: List[Insight]
    generated_at: str


# ── Savings Schema ─────────────────────────────────────

class SavingsResponse(BaseModel):
    total_potential_savings: float
    savings_this_month: float
    savings_implemented: float
    top_categories: List[dict]
