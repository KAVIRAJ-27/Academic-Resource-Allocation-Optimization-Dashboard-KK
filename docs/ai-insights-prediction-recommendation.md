# Phase 34: AI Insights, Prediction & Recommendation

## 1. Executive Summary

Phase 34 introduces an AI/ML intelligence layer to the Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO). The system analyzes real historical database records to provide forward-looking resource demand prediction, utilization forecasting, hostel bed shortage warnings, institutional bottleneck detection, operational anomaly detection, faculty workload insights, and explainable decision-support recommendations.

```text
React Frontend (Vite/TypeScript)
      ↓
Spring Boot Backend (API Gateway & Scope Guard)
      ↓ HTTP (aiRestTemplate with timeouts)
Python FastAPI Service (ai-service:8000)
      ↓
Scikit-learn ML Models & Statistical Detectors
      ↓ (Real Historical MySQL Data via Backend)
Predictions, Shortage Risks, Bottlenecks, Anomalies, & Recommendations
      ↓
Spring Boot (Response Validation & Domain Constraint Enforcement)
      ↓
Frontend (/ai-insights Dashboard)
```

> [!IMPORTANT]
> **Core AI Principles & Guarantees:**
> 1. **Strictly Advisory**: AI provides decision support only. AI **NEVER** automatically creates, mutates, approves, or executes resource allocations.
> 2. **Real Data Only**: Strictly **NO** random, fake, or fabricated forecasts. If historical records are below the threshold (`MIN_TRAINING_RECORDS = 5`), the system returns an explicit status `INSUFFICIENT_DATA`.
> 3. **Mathematical Domain Constraints**: Enforced by `RangeValidator` (utilization $\in [0, 100]\%$, occupancy $\in [0, 100]\%$, non-negative demand, physical bed limits).
> 4. **Resilience & Graceful Degradation**: Spring Boot will never crash if the Python service is unavailable; it returns a controlled `AI_SERVICE_UNAVAILABLE` status.

---

## 2. Machine Learning Architecture & Models

### Model Selection & Rationale

| Prediction Target | Algorithm | Justification & Features | Evaluation Metrics |
| :--- | :--- | :--- | :--- |
| **Academic Demand Prediction** | `RandomForestRegressor` (100 estimators) | Non-linear ensemble model capturing categorical and temporal features without severe overfitting on moderate datasets. Features: historical allocation count, request frequency, subject requisites, department ID, semester index. | MAE, RMSE, $R^2$ |
| **Resource Utilization Prediction** | `RandomForestRegressor` (100 estimators) | Models historical hourly occupancy vs. capacity to predict 30-day forward utilization percentage. Features: capacity, past utilization %, allocation density, hour of day. Clamped strictly to $[0, 100]\%$. | MAE, RMSE, $R^2$ |
| **Hostel Occupancy & Shortage** | `RandomForestRegressor` (100 estimators) | Forecasts prospective occupied beds based on current active beds, past occupancy trends, and pending residential applications. Available beds calculated strictly as $\max(0, \text{Capacity} - \text{Predicted Occupancy})$. | MAE, RMSE, $R^2$ |
| **Operational Anomaly Detection** | `IsolationForest` (contamination=0.08) + $z$-score | Unsupervised tree ensemble isolating multi-dimensional outlier events (allocation surges, abnormal cancellations, sudden complaint spikes). Clearly labeled as unsupervised detection. | Outlier score, $z$-score deviation |
| **Institutional Bottlenecks** | Deterministic Multi-Factor Analyzer | Synthesizes Phase 30 conflict hotspot data, Phase 33 sustained high utilization (>85%), and pending request queues to flag constrained classrooms, labs, and hostels. | Severity score, conflict frequency |
| **Faculty Workload Insights** | Statistical Variance & Inequality Analysis | Evaluates weekly teaching hours, standard deviation across departmental peers, and flags overloaded faculty (>20 hrs/week) without altering Phase 21 calculations. | Variance, peer delta |
| **Decision-Support Recommendations** | Explainable Recommendation Engine | Generates contextual, prioritized actions (`HIGH`, `MEDIUM`, `LOW`) with concrete quantitative rationale and supporting metrics (e.g. capacity vs. predicted demand). | Structured DTO with supporting metrics |

---

## 3. Python FastAPI Microservice (`ai-service/`)

### Project Structure

```text
ai-service/
├── app/
│   ├── main.py                     # FastAPI app with lifespan handler and CORS
│   ├── config.py                   # Environment settings & thresholds
│   ├── schemas/
│   │   ├── requests.py             # Inbound payload schemas
│   │   └── responses.py            # Outbound prediction & recommendation schemas
│   ├── models/
│   │   └── model_store.py          # Joblib persistence and in-memory model registry
│   ├── preprocessing/
│   │   ├── data_cleaner.py         # Imputation, timestamp conversion, sanitization
│   │   └── feature_engineering.py  # Matrix vectorization & feature synthesis
│   ├── utils/
│   │   ├── range_validator.py      # Range clamping & physical capacity guards
│   │   └── explainability.py       # Natural language quantitative explanation generator
│   ├── training/
│   │   ├── train_demand_model.py
│   │   ├── train_utilization_model.py
│   │   ├── train_occupancy_model.py
│   │   └── train_anomaly_model.py
│   ├── services/
│   │   ├── academic_predictor.py
│   │   ├── hostel_predictor.py
│   │   ├── shortage_detector.py
│   │   ├── bottleneck_detector.py
│   │   ├── workload_analyzer.py
│   │   ├── anomaly_detector.py
│   │   └── recommendation_engine.py
│   └── routes/
│       ├── health.py               # GET /health
│       ├── prediction.py           # Core inference routes
│       ├── recommendation.py       # Explainable recommendations
│       └── models_admin.py         # POST /api/ai/models/train
├── tests/
│   ├── test_health.py
│   ├── test_predictions.py
│   ├── test_services.py
│   └── test_training.py
├── requirements.txt
└── README.md
```

### Health Check Endpoint

`GET /health`

```json
{
  "status": "UP",
  "service": "AHRAO AI Intelligence Service",
  "version": "1.0.0",
  "modelsLoaded": ["academic-demand-v1", "resource-utilization-v1", "hostel-occupancy-v1", "operational-anomaly-v1"]
}
```

---

## 4. Spring Boot Integration & Security Gateway

### Resilience Architecture

- `AiClientService`: Communicates with FastAPI via a configured `RestTemplate` bean (`connect-timeout-ms: 3000`, `read-timeout-ms: 8000`).
- **Circuit-safe Fallback**: Any `ResourceAccessException`, `HttpServerErrorException`, or timeout triggers a graceful return of `AI_SERVICE_UNAVAILABLE` rather than throwing uncaught 500 errors.
- **Scope Enforcement**:
  - `HOD`: Forced departmental filtering via `HodDepartmentResolver`.
  - `WARDEN`: Forced hostel building filtering via `WardenScopeService`.
  - `FACULTY`: Constrained to personal workload and relevant academic rooms.
  - `STUDENT`: Restricted from institutional strategic insights.
  - `ADMIN` & `PRINCIPAL`: Institution-wide visibility.
- **Model Training Security**: `POST /api/ai/models/train` is guarded with `@PreAuthorize("hasRole('ADMIN')")`.

### Spring Boot REST Endpoints

| Endpoint | Method | Permitted Roles | Description |
| :--- | :--- | :--- | :--- |
| `/api/ai/overview` | GET | All Authenticated | High-level summary of predictions, shortages, bottlenecks, and recommendations |
| `/api/ai/academic/demand` | GET | ADMIN, PRINCIPAL, HOD, FACULTY | Predicted resource demand volume by category and room |
| `/api/ai/academic/utilization` | GET | ADMIN, PRINCIPAL, HOD | Forward 30-day predicted utilization percentage |
| `/api/ai/academic/shortage` | GET | ADMIN, PRINCIPAL, HOD | Risk-banded resource shortage warnings |
| `/api/ai/academic/bottlenecks` | GET | ADMIN, PRINCIPAL, HOD | Resource bottlenecks combining conflict and utilization data |
| `/api/ai/academic/workload` | GET | ADMIN, PRINCIPAL, HOD, FACULTY | Faculty workload imbalance and overload insights |
| `/api/ai/hostel/occupancy` | GET | ADMIN, PRINCIPAL, WARDEN | Predicted hostel block occupancy and bed counts |
| `/api/ai/hostel/demand` | GET | ADMIN, PRINCIPAL, WARDEN | Prospective hostel residential demand |
| `/api/ai/hostel/shortage` | GET | ADMIN, PRINCIPAL, WARDEN | Risk-banded hostel bed deficit forecasts |
| `/api/ai/anomalies` | GET | ADMIN, PRINCIPAL, HOD, WARDEN | Detected operational outliers and reservation spikes |
| `/api/ai/recommendations` | GET | ADMIN, PRINCIPAL, HOD, WARDEN | Prioritized, explainable decision-support recommendations |
| `/api/ai/models/train` | POST | ADMIN Only | Triggers re-training of ML models using live database data |

---

## 5. Frontend User Interface (`/ai-insights`)

The AI Insights Hub integrates cleanly into AHRAO's dark SaaS interface:

- **Telemetry Tabs**:
  1. *Overview*: Executive metrics (Predicted Demand, Projected Occupancy, High Risk Shortages, Active Bottlenecks, Unsupervised Anomalies).
  2. *Academic Predictions*: Demand volume vs. capacity, predicted utilization bar charts, and 30-day forecast trends.
  3. *Hostel Forecasts*: Block-by-block occupancy gauges, predicted bed requirements, and vacancy projections.
  4. *Bottlenecks & Shortages*: Risk cards (`HIGH_RISK`, `MEDIUM_RISK`, `LOW_RISK`) with historical conflict correlation.
  5. *Faculty Workload*: Peer workload distribution charts and teaching overload indicators.
  6. *Recommendations & Anomalies*: Prioritized action cards with "View Details" modal and explainability data.
- **Labels & Badges**:
  - Clear visual distinction between `ACTUAL` historical data (blue/gray) and `PREDICTED` ML outputs (emerald/amber).
  - Explicit model version indicators (`v1.0.0`).
- **UI States**:
  - `Loading`: Pulsing skeleton indicators.
  - `AI_SERVICE_UNAVAILABLE`: Graceful warning banner with retry action.
  - `INSUFFICIENT_DATA`: Amber badge notifying the user that more historical data is required before a reliable prediction can be generated.
  - `Prediction Available`: Interactive charts and explainability tooltips.
- **Zero Auto-Apply**: Recommendations provide actionable advice but deliberately omit automatic apply buttons to protect administrative workflows.

---

## 6. End-to-End Decision Flow

```text
REAL DATABASE RECORDS (Allocations, Requests, Occupancy, Workloads, Conflicts)
        ↓
PHASE 33 ANALYTICS DATA PREPARATION
        ↓
AI SERVICE (Scikit-Learn ML Models)
        ↓
DEMAND & UTILIZATION PREDICTION
        ↓
SHORTAGE & BOTTLENECK SYNTHESIS
        ↓
EXPLAINABLE RECOMMENDATION GENERATED
        ↓
ADMIN / DECISION-MAKER REVIEWS RECOMMENDATION
        ↓
PHASE 31 OPTIMIZATION (Simulation & Candidate Ranking)
        ↓
PHASE 30 CONFLICT RE-CHECK (Pessimistic Hard Constraint Check)
        ↓
PHASE 32 APPROVAL WORKFLOW (Multi-Tier Review & Audit Log)
        ↓
PHASE 28/29 ALLOCATION ENGINES (Final Database State Mutation)
```
