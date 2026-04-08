"""
AI Cost Prediction Module — Cloud FinOps AI Optimizer

Implements:
  1. Linear Regression for 7-30 day cost forecasting
  2. Feature engineering: day-of-week, month, trend index
  3. Confidence intervals via residual analysis

This produces actionable forecasts for budget planning.
"""

import numpy as np
import pandas as pd
from sklearn.linear_model import LinearRegression
from sklearn.preprocessing import PolynomialFeatures
from datetime import datetime, timedelta
from typing import Dict, List, Optional


def predict_costs(
    daily_costs: List[Dict],
    forecast_days: int = 14,
) -> Dict:
    """
    Predict future cloud costs using Linear Regression.

    Args:
        daily_costs: List of {"date": str, "amount": float} from the cost service
        forecast_days: Number of days to forecast (7-30)

    Returns:
        Dict with historical data, forecast points, trend assessment,
        predicted monthly total, and model accuracy (R²)
    """
    forecast_days = max(7, min(forecast_days, 30))

    if len(daily_costs) < 14:
        return {
            "historical": daily_costs,
            "forecast": [],
            "trend": "insufficient_data",
            "predicted_monthly": 0.0,
            "model_accuracy": 0.0,
        }

    # ── Prepare training data ──────────────────────────
    df = pd.DataFrame(daily_costs)
    df["date"] = pd.to_datetime(df["date"])
    df = df.sort_values("date").reset_index(drop=True)

    # Feature engineering
    df["day_index"] = np.arange(len(df))
    df["day_of_week"] = df["date"].dt.dayofweek
    df["is_weekend"] = (df["day_of_week"] >= 5).astype(int)
    df["month"] = df["date"].dt.month
    df["day_of_month"] = df["date"].dt.day

    # Features matrix
    feature_cols = ["day_index", "day_of_week", "is_weekend", "month"]
    X = df[feature_cols].values
    y = df["amount"].values

    # ── Train Linear Regression ────────────────────────
    model = LinearRegression()
    model.fit(X, y)

    # Model accuracy (R² score)
    r2_score = model.score(X, y)

    # Calculate residuals for confidence intervals
    predictions_train = model.predict(X)
    residuals = y - predictions_train
    residual_std = np.std(residuals)

    # ── Generate forecast ──────────────────────────────
    last_date = df["date"].iloc[-1]
    last_index = df["day_index"].iloc[-1]

    forecast_points = []
    forecast_sum = 0.0

    for i in range(1, forecast_days + 1):
        future_date = last_date + timedelta(days=i)
        future_index = last_index + i
        dow = future_date.weekday()
        is_weekend = 1 if dow >= 5 else 0
        month = future_date.month

        X_pred = np.array([[future_index, dow, is_weekend, month]])
        predicted = model.predict(X_pred)[0]
        predicted = max(predicted, 0)  # Floor at zero

        # 90% confidence interval
        lower = max(predicted - 1.645 * residual_std, 0)
        upper = predicted + 1.645 * residual_std

        forecast_points.append({
            "date": future_date.strftime("%Y-%m-%d"),
            "predicted": round(predicted, 2),
            "lower_bound": round(lower, 2),
            "upper_bound": round(upper, 2),
        })
        forecast_sum += predicted

    # ── Trend assessment ───────────────────────────────
    trend_coef = model.coef_[0]  # day_index coefficient
    if trend_coef > 0.3:
        trend = "increasing"
    elif trend_coef < -0.3:
        trend = "decreasing"
    else:
        trend = "stable"

    # Extrapolate for full month
    predicted_monthly = round(forecast_sum * (30 / forecast_days), 2)

    # Format historical for response
    historical = [
        {"date": row["date"].strftime("%Y-%m-%d"), "amount": round(row["amount"], 2)}
        for _, row in df.tail(60).iterrows()
    ]

    return {
        "historical": historical,
        "forecast": forecast_points,
        "trend": trend,
        "predicted_monthly": predicted_monthly,
        "model_accuracy": round(r2_score * 100, 1),
    }
