# 🚀 Cloud FinOps AI Optimizer

**AI-powered cloud cost optimization platform** that monitors cloud spending, detects anomalies, predicts future costs, and generates actionable cost-saving recommendations.

![Dashboard](https://img.shields.io/badge/Status-Production--Ready-green) ![Python](https://img.shields.io/badge/Backend-FastAPI-009688) ![React](https://img.shields.io/badge/Frontend-React-61DAFB) ![AI](https://img.shields.io/badge/AI-scikit--learn-F7931E)

---

## 📋 Overview

Cloud FinOps AI Optimizer is a full-stack SaaS application designed to help engineering and finance teams understand, monitor, and reduce their cloud infrastructure costs using data analysis and machine learning.

### Key Capabilities
- **Real-time Cost Monitoring** — Daily and monthly cloud spending visualization
- **AI Cost Prediction** — Linear Regression model forecasting next 7-30 days
- **Anomaly Detection** — Dual strategy (Z-score + Isolation Forest) to identify cost spikes
- **Idle Resource Detection** — Identifies underutilized EC2 instances wasting money
- **Smart Recommendations** — AI-driven suggestions with estimated savings per action
- **Budget Management** — Set limits, track usage, and receive threshold alerts
- **AI Insights** — Human-readable analysis of spending patterns

---

## 🧱 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 8, Recharts |
| Backend | Python, FastAPI, Uvicorn |
| Database | SQLite (WAL mode) |
| AI/ML | scikit-learn, pandas, numpy |
| Cloud | AWS Boto3 (optional) |
| Auth | JWT (python-jose + bcrypt) |
| Icons | Lucide React |

---

## ⚙️ Architecture

```
┌─────────────────────────────────────────────────┐
│                React Frontend                    │
│  (Dashboard, Charts, Components)                  │
└──────────────────┬──────────────────────────────┘
                   │ REST API (JSON)
┌──────────────────▼──────────────────────────────┐
│              FastAPI Backend                      │
│                                                   │
│  routes/     → API endpoints                     │
│  services/   → Business logic                    │
│  ai/         → ML models (prediction, anomaly)   │
│  data_provider.py → AWS or Simulated data        │
│  database.py → SQLite ORM                        │
└──────────────────┬──────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼────┐         ┌─────▼─────┐
   │ AWS API │         │  SQLite   │
   │ (boto3) │         │  Database │
   └─────────┘         └───────────┘
```

---

## 🔧 Setup Instructions

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm 9+

### 1. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the server (auto-seeds database with simulated data)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

The backend auto-detects AWS credentials:
- **With AWS credentials**: Fetches real data from AWS Cost Explorer + EC2
- **Without AWS credentials**: Uses realistic simulated data (6 months of history)

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 3. Open Dashboard

Navigate to **http://localhost:5173** in your browser.

---

## 📊 Features

### 1. Smart Cost Dashboard
- Four key metric stat cards (Total Spend, Predicted Monthly, Anomalies, Potential Savings)
- Daily cost area chart (last 60 days)
- Service-wise donut chart breakdown (EC2, S3, RDS, Lambda, etc.)

### 2. AI Cost Prediction
- **Model**: Linear Regression with feature engineering
- **Features**: Day-of-week, weekend flag, month, trend index
- **Output**: 7-30 day forecast with 90% confidence intervals
- **Metrics**: R² accuracy score displayed on chart

### 3. Anomaly Detection
- **Method 1**: Moving Average (14-day window) + Z-score
- **Method 2**: Isolation Forest (scikit-learn)
- Each anomaly includes a natural language explanation
- Severity levels: Critical, High, Medium, Low

### 4. Idle Resource Detection
- Identifies EC2 instances with CPU < 5%
- Shows monthly waste per instance
- Context-aware action suggestions (stop, terminate, resize)
- Environment tagging (production, staging, development, testing)

### 5. AI Recommendation Engine
- **Rule-based + ML-driven** recommendations
- Categories: Idle Resources, Reserved Instances, Right-Sizing, Storage Optimization, Compute Optimization
- Each recommendation includes: estimated savings, confidence level, priority, and actionable steps

### 6. Savings Tracker
- Total potential savings (hero metric)
- Savings available vs. implemented
- Category breakdown with animated bars

### 7. Budget & Alert System
- Set monthly budget limits
- Real-time progress tracking (% used)
- Multi-level alerts (50%, 80%, 95%, over-budget)
- Visual progress bar with color coding

### 8. AI Insights Panel
- Template-based natural language generation
- Top cost driver analysis
- Month-over-month trend detection
- Idle resource warnings
- Savings opportunity summaries

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/cost/daily` | Daily costs (with date range filtering) |
| GET | `/cost/breakdown` | Service-wise cost breakdown |
| GET | `/cost/monthly` | Monthly cost summaries |
| GET | `/forecast?days=14` | AI cost prediction (7-30 days) |
| GET | `/anomalies` | Detected anomalies with explanations |
| GET | `/resources/idle` | Idle EC2 instances |
| GET | `/resources/all` | All EC2 instances |
| GET | `/recommendations` | AI optimization suggestions |
| GET | `/budget` | Budget status and alerts |
| POST | `/budget` | Set/update budget |
| GET | `/insights` | AI-generated text insights |
| GET | `/savings` | Savings tracker data |
| GET | `/export/csv` | Download cost data as CSV |
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login (returns JWT) |
| GET | `/auth/me` | Current user info |

---

## 📁 Project Structure

```
FinOps-Ai/
├── backend/
│   ├── main.py                 # FastAPI application
│   ├── config.py               # Configuration
│   ├── database.py             # SQLite schema & connection
│   ├── data_provider.py        # Hybrid AWS/simulated data
│   ├── requirements.txt        # Python dependencies
│   ├── routes/
│   │   ├── cost.py             # /cost endpoints
│   │   ├── forecast.py         # /forecast endpoint
│   │   ├── anomalies.py        # /anomalies endpoint
│   │   ├── resources.py        # /resources endpoints
│   │   ├── recommendations.py  # /recommendations endpoint
│   │   ├── budget.py           # /budget endpoints
│   │   ├── insights.py         # /insights endpoint
│   │   ├── export.py           # /export/csv endpoint
│   │   └── auth.py             # Authentication
│   ├── services/
│   │   ├── cost_service.py     # Cost data aggregation
│   │   ├── resource_service.py # Resource analysis
│   │   ├── recommendation_service.py
│   │   ├── budget_service.py   # Budget management
│   │   └── insight_service.py  # AI text generation
│   ├── ai/
│   │   ├── prediction.py       # Linear Regression forecasting
│   │   └── anomaly.py          # Isolation Forest + Z-score
│   ├── models/
│   │   └── schemas.py          # Pydantic models
│   └── utils/
│       └── helpers.py          # Utility functions
│
└── frontend/
    ├── index.html              # HTML entry point
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx            # React entry
        ├── App.jsx             # Root component
        ├── index.css           # Design system
        ├── api/
        │   └── client.js       # Axios API client
        ├── pages/
        │   └── Dashboard.jsx   # Main dashboard
        └── components/
            ├── Sidebar.jsx     # Navigation
            ├── Header.jsx      # Top bar
            ├── CostOverview.jsx    # Stat cards
            ├── CostChart.jsx       # Daily cost chart
            ├── CostBreakdown.jsx   # Service donut chart
            ├── ForecastChart.jsx   # AI prediction chart
            ├── AnomalyPanel.jsx    # Anomaly alerts
            ├── IdleResources.jsx   # Idle EC2 table
            ├── Recommendations.jsx # Cost-saving suggestions
            ├── BudgetWidget.jsx    # Budget tracker
            ├── SavingsTracker.jsx  # Savings display
            ├── InsightsPanel.jsx   # AI insights
            └── TopActions.jsx      # Top 3 actions
```

---

## 🧠 AI & FinOps Logic

### Cost Prediction (prediction.py)
The model uses **Linear Regression** with engineered features:
- `day_index`: Captures long-term trend
- `day_of_week`: Captures weekly seasonality (weekday vs weekend)
- `is_weekend`: Binary flag for reduced weekend spending
- `month`: Captures monthly patterns

Confidence intervals are derived from residual analysis (1.645σ for 90% CI).

### Anomaly Detection (anomaly.py)
Dual-strategy approach for robust detection:
1. **Z-Score**: Compares each day's cost against a 14-day moving average. Flags values > 2.5σ from the mean.
2. **Isolation Forest**: Unsupervised ML model trained on cost data. Detects structural outliers that statistical methods might miss.

Results are combined — a data point flagged by either method is reported as an anomaly.

### Simulated Data (data_provider.py)
When AWS credentials aren't available, the system generates realistic data with:
- **Upward trend**: ~0.1% daily growth (mimicking real cloud scaling)
- **Weekly seasonality**: Weekdays 15-25% higher than weekends
- **Anomaly spikes**: 4 randomly placed spikes (35-80% above normal)
- **Service breakdown**: EC2 (42%), RDS (19%), S3 (14%), Lambda (11%), CloudWatch (5%), Others (9%)
- **Idle resources**: 5 EC2 instances with < 5% CPU utilization

---

## 🔒 Authentication

Basic JWT authentication:
- **Signup**: `POST /auth/signup` with email + password
- **Login**: `POST /auth/login` returns JWT token
- **Protected routes**: Attach `Authorization: Bearer <token>` header

Passwords are hashed with bcrypt. Tokens expire after 24 hours.

---

## 📤 Export

- **CSV Export**: `GET /export/csv` downloads a CSV file with daily costs broken down by service
- Click the "Export CSV" button in the header to download

---

## 🚀 AWS Integration

To use real AWS data, set these environment variables:

```bash
export AWS_ACCESS_KEY_ID=your_key
export AWS_SECRET_ACCESS_KEY=your_secret
export AWS_DEFAULT_REGION=us-east-1
```

The system will automatically switch from simulated to real data. Required IAM permissions:
- `ce:GetCostAndUsage` (Cost Explorer)
- `ec2:DescribeInstances` (EC2)
- `cloudwatch:GetMetricStatistics` (CloudWatch)

---

## 📝 License

MIT License
