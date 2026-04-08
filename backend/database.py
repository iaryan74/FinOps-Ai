"""
Database setup and initialization for Cloud FinOps AI Optimizer.
Uses SQLite with a clean relational schema.
"""

import sqlite3
from contextlib import contextmanager
from config import DB_PATH


def get_connection() -> sqlite3.Connection:
    """Create a new database connection with row factory."""
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    conn.execute("PRAGMA foreign_keys=ON")
    return conn


@contextmanager
def get_db():
    """Context manager for database connections."""
    conn = get_connection()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db():
    """Initialize database schema. Safe to call multiple times."""
    with get_db() as conn:
        conn.executescript("""
            -- Users table for authentication
            CREATE TABLE IF NOT EXISTS users (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                email       TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                full_name   TEXT DEFAULT '',
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Daily cost records (per service)
            CREATE TABLE IF NOT EXISTS cost_data (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                date        TEXT NOT NULL,
                service     TEXT NOT NULL,
                amount      REAL NOT NULL,
                region      TEXT DEFAULT 'us-east-1',
                UNIQUE(date, service, region)
            );

            -- EC2 resource inventory
            CREATE TABLE IF NOT EXISTS resources (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                instance_id     TEXT UNIQUE NOT NULL,
                instance_type   TEXT NOT NULL,
                state           TEXT NOT NULL DEFAULT 'running',
                cpu_utilization REAL DEFAULT 0.0,
                cost_per_hour   REAL DEFAULT 0.0,
                environment     TEXT DEFAULT 'production',
                last_updated    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- User budget settings
            CREATE TABLE IF NOT EXISTS budgets (
                id              INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id         INTEGER DEFAULT 1,
                monthly_limit   REAL NOT NULL,
                alert_threshold REAL DEFAULT 80.0,
                created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            -- System alerts
            CREATE TABLE IF NOT EXISTS alerts (
                id          INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id     INTEGER DEFAULT 1,
                type        TEXT NOT NULL,
                title       TEXT NOT NULL,
                message     TEXT NOT NULL,
                severity    TEXT DEFAULT 'info',
                is_read     INTEGER DEFAULT 0,
                created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            );

            -- Savings tracking log
            CREATE TABLE IF NOT EXISTS savings_log (
                id                  INTEGER PRIMARY KEY AUTOINCREMENT,
                recommendation_type TEXT NOT NULL,
                description         TEXT NOT NULL,
                estimated_saving    REAL NOT NULL,
                status              TEXT DEFAULT 'pending',
                created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            -- Create indexes for performance
            CREATE INDEX IF NOT EXISTS idx_cost_date ON cost_data(date);
            CREATE INDEX IF NOT EXISTS idx_cost_service ON cost_data(service);
            CREATE INDEX IF NOT EXISTS idx_resources_state ON resources(state);
            CREATE INDEX IF NOT EXISTS idx_alerts_user ON alerts(user_id, is_read);
        """)
    print("✓ Database initialized successfully")
