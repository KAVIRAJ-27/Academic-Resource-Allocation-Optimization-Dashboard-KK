# AHRAO AI & Predictive Optimization Service

The **AHRAO AI Service** is a dedicated Python FastAPI intelligence layer designed to analyze real historical data from the Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO) to provide:

1. **Resource Demand Prediction**: Multi-feature regression (`RandomForestRegressor`) predicting upcoming demand volume by resource category.
2. **Resource Utilization Forecast**: Machine learning regression forecasting utilization percentages across classrooms, laboratories, and specialized equipment.
3. **Hostel Occupancy & Bed Shortage Forecast**: Regression models projecting bed occupancy, vacancy trends, and potential deficits.
4. **Institutional Bottleneck Detection**: Multi-source correlation combining Phase 30 conflict logs, Phase 33 utilization rates, and pending requisitions.
5. **Operational Anomaly Detection**: `IsolationForest` combined with statistical $z$-score analysis to identify allocation bursts, capacity outliers, and grievance spikes.
6. **Faculty Workload Analysis**: Distribution variance and overload identification across academic departments.
7. **Explainable AI Recommendations**: Advisory decision-support recommendations with priorities, affected entities, and quantitative rationale.

> [!IMPORTANT]
> **Advisory-Only Guarantee**: The AI service produces decision-support recommendations. It **NEVER** executes automatic allocations, modifications, or approvals.

---

## 1. Tech Stack
- **Framework**: FastAPI
- **Server**: Uvicorn
- **Machine Learning**: Scikit-learn (`RandomForestRegressor`, `IsolationForest`)
- **Data Engineering**: Pandas, NumPy
- **Validation**: Pydantic v2
- **Persistence**: Joblib & JSON metadata

---

## 2. Running Locally

```bash
cd ai-service
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Healthcheck:
```bash
curl http://localhost:8000/health
```
Response:
```json
{
  "status": "UP",
  "app_name": "AHRAO-AI-Service",
  "version": "1.0.0"
}
```

---

## 3. Testing

```bash
cd ai-service
python -m pytest tests -v
```
