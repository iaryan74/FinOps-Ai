"""
Hybrid Data Provider for Cloud FinOps AI Optimizer.

Provides a clean abstraction layer:
  - If AWS credentials exist → fetches real data from AWS Cost Explorer + EC2
  - Else → generates realistic simulated data with trends, spikes, and idle resources

This module is the single source of truth for all cloud cost and resource data.
"""

import random
import math
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional

from config import has_aws_credentials, SIMULATION_MONTHS
from database import get_db

# ── Random seed for reproducible simulations ───────────
random.seed(42)
np.random.seed(42)

# ── Service Configuration ──────────────────────────────

CLOUD_SERVICES = {
    "Amazon EC2":       {"base_share": 0.42, "growth_rate": 0.003, "volatility": 0.12},
    "Amazon S3":        {"base_share": 0.14, "growth_rate": 0.001, "volatility": 0.08},
    "Amazon RDS":       {"base_share": 0.19, "growth_rate": 0.002, "volatility": 0.06},
    "AWS Lambda":       {"base_share": 0.11, "growth_rate": 0.004, "volatility": 0.15},
    "Amazon CloudWatch":{"base_share": 0.05, "growth_rate": 0.001, "volatility": 0.05},
    "Other Services":   {"base_share": 0.09, "growth_rate": 0.001, "volatility": 0.10},
}

# EC2 instance types and their hourly costs
EC2_INSTANCES = [
    {"type": "t3.micro",    "cost": 0.0104},
    {"type": "t3.small",    "cost": 0.0208},
    {"type": "t3.medium",   "cost": 0.0416},
    {"type": "m5.large",    "cost": 0.096},
    {"type": "m5.xlarge",   "cost": 0.192},
    {"type": "c5.large",    "cost": 0.085},
    {"type": "c5.xlarge",   "cost": 0.170},
    {"type": "r5.large",    "cost": 0.126},
    {"type": "r5.xlarge",   "cost": 0.252},
    {"type": "t3.large",    "cost": 0.0832},
]

ENVIRONMENTS = ["production", "staging", "development", "testing"]


# ══════════════════════════════════════════════════════
#  SIMULATED DATA GENERATOR
# ══════════════════════════════════════════════════════

def _generate_daily_costs() -> List[Dict[str, Any]]:
    """
    Generate 6 months of realistic daily cloud cost data.

    Characteristics:
      - Gradual upward trend (realistic cloud growth ~15-20% over 6 months)
      - Weekly seasonality (weekdays 15-25% higher than weekends)
      - 3-5 random anomaly spikes (30-80% above normal)
      - Per-service breakdown with independent noise
    """
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=SIMULATION_MONTHS * 30)
    num_days = (end_date - start_date).days + 1

    # Base daily cost: starts around $120-150/day
    base_daily_cost = 135.0

    # Pick 4 random days for anomaly spikes
    anomaly_days = sorted(random.sample(range(30, num_days - 7), 4))

    daily_records = []

    for day_idx in range(num_days):
        current_date = start_date + timedelta(days=day_idx)
        date_str = current_date.strftime("%Y-%m-%d")
        day_of_week = current_date.weekday()  # 0=Mon, 6=Sun

        # ── Trend component: gradual growth ──
        trend = base_daily_cost * (1 + 0.001 * day_idx)

        # ── Weekly seasonality ──
        if day_of_week < 5:  # Weekday
            weekly_factor = 1.0 + random.uniform(0.05, 0.15)
        else:  # Weekend
            weekly_factor = 0.65 + random.uniform(0.0, 0.10)

        # ── Anomaly spike ──
        anomaly_factor = 1.0
        is_anomaly = False
        for spike_day in anomaly_days:
            if abs(day_idx - spike_day) <= 1:
                anomaly_factor = 1.0 + random.uniform(0.35, 0.80)
                is_anomaly = True
                break

        # ── Daily total with noise ──
        daily_total = trend * weekly_factor * anomaly_factor
        daily_total *= (1 + np.random.normal(0, 0.03))  # 3% noise
        daily_total = max(daily_total, 50.0)  # Floor

        # ── Break down by service ──
        service_costs = {}
        remaining = daily_total

        for i, (service, config) in enumerate(CLOUD_SERVICES.items()):
            if i == len(CLOUD_SERVICES) - 1:
                # Last service gets the remainder
                amount = remaining
            else:
                # Service share with growth and noise
                day_growth = 1 + config["growth_rate"] * day_idx
                noise = 1 + np.random.normal(0, config["volatility"] * 0.3)
                share = config["base_share"] * day_growth * noise
                share = max(share, 0.02)
                amount = daily_total * share
                amount = min(amount, remaining * 0.95)

            amount = round(max(amount, 1.0), 2)
            service_costs[service] = amount
            remaining -= amount

        # If rounding left residual, add to EC2
        if remaining > 0.5:
            service_costs["Amazon EC2"] = round(service_costs["Amazon EC2"] + remaining, 2)

        daily_records.append({
            "date": date_str,
            "total": round(sum(service_costs.values()), 2),
            "services": service_costs,
            "is_anomaly": is_anomaly,
        })

    return daily_records


def _generate_idle_resources() -> List[Dict[str, Any]]:
    """
    Generate 5 idle EC2 instances with realistic characteristics.

    Idle = running but CPU utilization < 5%.
    """
    idle_resources = []

    # Select 5 random instance types for idle instances
    idle_configs = [
        {"env": "development", "cpu": round(random.uniform(0.5, 3.0), 1)},
        {"env": "staging",     "cpu": round(random.uniform(1.0, 4.5), 1)},
        {"env": "testing",     "cpu": round(random.uniform(0.2, 2.0), 1)},
        {"env": "development", "cpu": round(random.uniform(0.8, 4.0), 1)},
        {"env": "production",  "cpu": round(random.uniform(1.5, 4.8), 1)},
    ]

    for i, config in enumerate(idle_configs):
        instance_type_info = random.choice(EC2_INSTANCES[2:])  # Pick medium+ instances
        instance_id = f"i-{random.randint(10000000, 99999999):08x}{random.randint(10, 99)}"
        cost_per_hour = instance_type_info["cost"]
        monthly_waste = round(cost_per_hour * 24 * 30, 2)

        idle_resources.append({
            "instance_id": instance_id,
            "instance_type": instance_type_info["type"],
            "state": "running",
            "cpu_utilization": config["cpu"],
            "cost_per_hour": cost_per_hour,
            "monthly_waste": monthly_waste,
            "environment": config["env"],
        })

    return idle_resources


def _generate_active_resources() -> List[Dict[str, Any]]:
    """Generate 8 properly utilized EC2 instances."""
    active = []
    envs = ["production"] * 4 + ["staging"] * 2 + ["development"] * 2

    for i, env in enumerate(envs):
        instance_type_info = random.choice(EC2_INSTANCES)
        instance_id = f"i-{random.randint(10000000, 99999999):08x}{random.randint(10, 99)}"

        active.append({
            "instance_id": instance_id,
            "instance_type": instance_type_info["type"],
            "state": "running",
            "cpu_utilization": round(random.uniform(25.0, 85.0), 1),
            "cost_per_hour": instance_type_info["cost"],
            "monthly_waste": 0.0,
            "environment": env,
        })

    return active


# ══════════════════════════════════════════════════════
#  AWS DATA FETCHER (Real Data)
# ══════════════════════════════════════════════════════

def _fetch_aws_costs() -> List[Dict[str, Any]]:
    """Fetch real cost data from AWS Cost Explorer API."""
    try:
        import boto3
        from config import AWS_REGION

        client = boto3.client("ce", region_name=AWS_REGION)
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=SIMULATION_MONTHS * 30)

        response = client.get_cost_and_usage(
            TimePeriod={
                "Start": start_date.strftime("%Y-%m-%d"),
                "End": end_date.strftime("%Y-%m-%d"),
            },
            Granularity="DAILY",
            Metrics=["UnblendedCost"],
            GroupBy=[{"Type": "DIMENSION", "Key": "SERVICE"}],
        )

        daily_records = {}
        for result in response["ResultsByTime"]:
            date_str = result["TimePeriod"]["Start"]
            services = {}
            total = 0.0

            for group in result["Groups"]:
                service_name = group["Keys"][0]
                amount = float(group["Metrics"]["UnblendedCost"]["Amount"])
                if amount > 0.01:
                    services[service_name] = round(amount, 2)
                    total += amount

            daily_records[date_str] = {
                "date": date_str,
                "total": round(total, 2),
                "services": services,
                "is_anomaly": False,
            }

        return sorted(daily_records.values(), key=lambda x: x["date"])

    except Exception as e:
        print(f"⚠ AWS Cost Explorer fetch failed: {e}")
        print("  Falling back to simulated data...")
        return _generate_daily_costs()


def _fetch_aws_resources() -> tuple:
    """Fetch real EC2 instance data from AWS."""
    try:
        import boto3
        from config import AWS_REGION

        ec2 = boto3.client("ec2", region_name=AWS_REGION)
        cloudwatch = boto3.client("cloudwatch", region_name=AWS_REGION)

        instances = ec2.describe_instances(
            Filters=[{"Name": "instance-state-name", "Values": ["running"]}]
        )

        idle = []
        active = []

        for reservation in instances["Reservations"]:
            for inst in reservation["Instances"]:
                instance_id = inst["InstanceId"]
                instance_type = inst["InstanceType"]

                # Get CPU utilization from CloudWatch
                cpu_stats = cloudwatch.get_metric_statistics(
                    Namespace="AWS/EC2",
                    MetricName="CPUUtilization",
                    Dimensions=[{"Name": "InstanceId", "Value": instance_id}],
                    StartTime=datetime.utcnow() - timedelta(hours=24),
                    EndTime=datetime.utcnow(),
                    Period=86400,
                    Statistics=["Average"],
                )

                cpu_avg = 0.0
                if cpu_stats["Datapoints"]:
                    cpu_avg = cpu_stats["Datapoints"][0]["Average"]

                # Get environment tag
                env = "untagged"
                for tag in inst.get("Tags", []):
                    if tag["Key"].lower() in ("environment", "env"):
                        env = tag["Value"]
                        break

                # Estimate hourly cost (simplified)
                cost_map = {t["type"]: t["cost"] for t in EC2_INSTANCES}
                cost_per_hour = cost_map.get(instance_type, 0.05)

                resource = {
                    "instance_id": instance_id,
                    "instance_type": instance_type,
                    "state": "running",
                    "cpu_utilization": round(cpu_avg, 1),
                    "cost_per_hour": cost_per_hour,
                    "monthly_waste": round(cost_per_hour * 24 * 30, 2) if cpu_avg < 5 else 0.0,
                    "environment": env,
                }

                if cpu_avg < 5.0:
                    idle.append(resource)
                else:
                    active.append(resource)

        return idle, active

    except Exception as e:
        print(f"⚠ AWS EC2 fetch failed: {e}")
        print("  Falling back to simulated data...")
        return _generate_idle_resources(), _generate_active_resources()


# ══════════════════════════════════════════════════════
#  PUBLIC API — Data Provider Interface
# ══════════════════════════════════════════════════════

def get_cost_data() -> List[Dict[str, Any]]:
    """
    Get daily cost data. Uses AWS if credentials exist, else simulated.
    Returns list of daily records with date, total, services breakdown.
    """
    if has_aws_credentials():
        print("📡 Fetching real data from AWS Cost Explorer...")
        return _fetch_aws_costs()
    else:
        print("🔧 Using simulated cost data (no AWS credentials)")
        return _generate_daily_costs()


def get_resources() -> Dict[str, List[Dict[str, Any]]]:
    """
    Get EC2 resource data. Returns dict with 'idle' and 'active' lists.
    """
    if has_aws_credentials():
        print("📡 Fetching real data from AWS EC2...")
        idle, active = _fetch_aws_resources()
    else:
        print("🔧 Using simulated resource data")
        idle = _generate_idle_resources()
        active = _generate_active_resources()

    return {"idle": idle, "active": active}


def get_data_source() -> str:
    """Return which data source is currently active."""
    return "aws" if has_aws_credentials() else "simulated"


# ══════════════════════════════════════════════════════
#  DATABASE SEEDING
# ══════════════════════════════════════════════════════

def seed_database_if_empty():
    """
    Check if the database has cost data. If empty, seed with
    simulated data so the app works immediately.
    """
    with get_db() as conn:
        count = conn.execute("SELECT COUNT(*) FROM cost_data").fetchone()[0]
        if count > 0:
            print(f"✓ Database already has {count} cost records")
            return

    print("📊 Seeding database with simulated data...")

    # Generate cost data
    daily_costs = _generate_daily_costs()

    with get_db() as conn:
        for day in daily_costs:
            for service, amount in day["services"].items():
                conn.execute(
                    "INSERT OR IGNORE INTO cost_data (date, service, amount) VALUES (?, ?, ?)",
                    (day["date"], service, round(amount, 2)),
                )

    print(f"  ✓ Inserted {len(daily_costs)} days of cost data")

    # Generate resource data
    idle_resources = _generate_idle_resources()
    active_resources = _generate_active_resources()

    with get_db() as conn:
        for resource in idle_resources + active_resources:
            conn.execute(
                """INSERT OR IGNORE INTO resources 
                   (instance_id, instance_type, state, cpu_utilization, cost_per_hour, environment)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (
                    resource["instance_id"],
                    resource["instance_type"],
                    resource["state"],
                    resource["cpu_utilization"],
                    resource["cost_per_hour"],
                    resource["environment"],
                ),
            )

    print(f"  ✓ Inserted {len(idle_resources)} idle + {len(active_resources)} active resources")

    # Set default budget
    with get_db() as conn:
        monthly_totals = {}
        for day in daily_costs:
            month = day["date"][:7]
            monthly_totals[month] = monthly_totals.get(month, 0) + day["total"]

        avg_monthly = sum(monthly_totals.values()) / max(len(monthly_totals), 1)
        budget_limit = round(avg_monthly * 1.1, 2)  # 10% above average

        conn.execute(
            "INSERT INTO budgets (user_id, monthly_limit, alert_threshold) VALUES (?, ?, ?)",
            (1, budget_limit, 80.0),
        )

    print(f"  ✓ Set default budget at ${budget_limit:,.2f}/month")
    print("✓ Database seeding complete")
