"""
Application configuration for Cloud FinOps AI Optimizer.
Centralizes all settings, secrets, and environment-based config.
"""

import os
from pathlib import Path

# ── Paths ──────────────────────────────────────────────
BASE_DIR = Path(__file__).resolve().parent
DB_PATH = BASE_DIR / "finops.db"

# ── JWT / Auth ─────────────────────────────────────────
SECRET_KEY = os.getenv("FINOPS_SECRET_KEY", "finops-dev-secret-key-change-in-prod")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# ── AWS ────────────────────────────────────────────────
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_DEFAULT_REGION", "us-east-1")

def has_aws_credentials() -> bool:
    """Check if valid AWS credentials are available."""
    return bool(AWS_ACCESS_KEY and AWS_SECRET_KEY)

# ── Data ───────────────────────────────────────────────
SIMULATION_MONTHS = 6          # months of historical data to simulate
FORECAST_DAYS_DEFAULT = 14     # default prediction horizon
ANOMALY_Z_THRESHOLD = 2.5      # Z-score threshold for anomaly detection

# ── Server ─────────────────────────────────────────────
CORS_ORIGINS = [
    "*",
]
