"""
AI Anomaly Detection Module — Cloud FinOps AI Optimizer

Implements dual detection strategy:
  1. Statistical: Moving average + Z-score for interpretable alerts
  2. Machine Learning: Isolation Forest for pattern-based detection

Each detected anomaly includes a human-readable explanation.
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from datetime import datetime, timedelta
from typing import Dict, List

from config import ANOMALY_Z_THRESHOLD
from utils.helpers import severity_from_deviation


def detect_anomalies(
    daily_costs: List[Dict],
    z_threshold: float = None,
    window: int = 14,
) -> Dict:
    """
    Detect cost anomalies using both statistical and ML methods.

    Args:
        daily_costs: List of {"date": str, "amount": float}
        z_threshold: Z-score threshold (default from config)
        window: Moving average window size in days

    Returns:
        Dict with detected anomalies, count, and monitoring period info
    """
    if z_threshold is None:
        z_threshold = ANOMALY_Z_THRESHOLD

    if len(daily_costs) < window + 5:
        return {
            "anomalies": [],
            "total_detected": 0,
            "monitoring_period": "Insufficient data for analysis",
        }

    # ── Prepare data ───────────────────────────────────
    df = pd.DataFrame(daily_costs)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)
    df["amount"] = df["amount"].astype(float)

    # ── Method 1: Moving Average + Z-Score ─────────────
    df["moving_avg"] = df["amount"].rolling(window=window, min_periods=7).mean()
    df["moving_std"] = df["amount"].rolling(window=window, min_periods=7).std()
    df["z_score"] = (df["amount"] - df["moving_avg"]) / df["moving_std"].replace(0, 1)

    # ── Method 2: Isolation Forest ─────────────────────
    features = df[["amount"]].dropna().values
    if len(features) > 20:
        iso_forest = IsolationForest(
            contamination=0.05,  # Expect ~5% anomalies
            random_state=42,
            n_estimators=100,
        )
        df["iso_label"] = -1  # default
        valid_mask = df["amount"].notna()
        predictions = iso_forest.fit_predict(df.loc[valid_mask, ["amount"]].values)
        df.loc[valid_mask, "iso_label"] = predictions
    else:
        df["iso_label"] = 1  # all normal if insufficient data

    # ── Combine results ────────────────────────────────
    anomalies = []

    for _, row in df.iterrows():
        if pd.isna(row["z_score"]):
            continue

        is_z_anomaly = abs(row["z_score"]) > z_threshold
        is_iso_anomaly = row["iso_label"] == -1
        is_anomaly = is_z_anomaly or is_iso_anomaly

        if not is_anomaly:
            continue

        expected = row["moving_avg"]
        actual = row["amount"]
        deviation_pct = ((actual - expected) / expected) * 100 if expected > 0 else 0

        # Generate human-readable explanation
        if deviation_pct > 0:
            direction = "higher"
            explanation = (
                f"Cost spike detected: {abs(deviation_pct):.0f}% higher than "
                f"the {window}-day moving average (${expected:.2f}). "
                f"Actual spend was ${actual:.2f}."
            )
        else:
            direction = "lower"
            explanation = (
                f"Unusual cost drop: {abs(deviation_pct):.0f}% lower than "
                f"the {window}-day moving average (${expected:.2f}). "
                f"Actual spend was ${actual:.2f}."
            )

        # Detection method info
        methods = []
        if is_z_anomaly:
            methods.append("Z-score")
        if is_iso_anomaly:
            methods.append("Isolation Forest")

        explanation += f" Detected by: {', '.join(methods)}."

        anomalies.append({
            "date": row["date"].strftime("%Y-%m-%d"),
            "actual_cost": round(actual, 2),
            "expected_cost": round(expected, 2),
            "deviation_pct": round(deviation_pct, 1),
            "severity": severity_from_deviation(abs(deviation_pct)),
            "explanation": explanation,
        })

    # Sort by absolute deviation (most severe first)
    anomalies.sort(key=lambda x: abs(x["deviation_pct"]), reverse=True)

    # Monitoring period
    if len(df) > 0:
        period_start = df["date"].iloc[0].strftime("%Y-%m-%d")
        period_end = df["date"].iloc[-1].strftime("%Y-%m-%d")
        monitoring = f"{period_start} to {period_end}"
    else:
        monitoring = "No data"

    return {
        "anomalies": anomalies,
        "total_detected": len(anomalies),
        "monitoring_period": monitoring,
    }
