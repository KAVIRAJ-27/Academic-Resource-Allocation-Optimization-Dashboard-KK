# AHRAO Project Report — Required Figures Verification Report

**Project Name:** Academic and Hostel Resource Allocation and Optimization Dashboard (AHRAO)  
**Project Path:** `C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK`  
**Screenshot Folder:** `C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\docs\project-report\screenshots`  
**Report Date:** October 25, 2026  
**Audit Scope:** Real-time application execution, database/API data verification, and visual proof capture for college project documentation.

---

## 1. Executive Summary & Verification Matrix

All three required report figures were captured directly from the live, fully running AHRAO application in a desktop browser viewport (1440 × 1000 pixels). No mockups, placeholders, or static design templates were used. Every metric, chart element, recommendation score, and AI prediction was computed by the actual production-grade stack: **MySQL 8.0**, **Spring Boot 3.3.4 (Java 17)**, **Python FastAPI AI Microservice (Scikit-Learn)**, and **React 18 / Vite / TailwindCSS**.

| Figure | Screenshot Filename | Page / Feature | Actual Data Verified | Screenshot Verified | Status |
|---|---|---|---|---|---|
| **Optimization Recommendation** | `Optimization_Recommendation_Score_Breakdown.png` | Optimization Score Breakdown (5-Factor Engine) | **Yes** (MySQL + Spring Boot Optimizer) | **Yes** (1440 × 1000 PNG, 267 KB) | **VERIFIED** |
| **Figure B.7** | `Figure_B7_Utilization_Analytics_Charts.png` | Utilization Analytics Charts (Academic Resources) | **Yes** (Live Analytics Aggregations) | **Yes** (1440 × 1000 PNG, 250 KB) | **VERIFIED** |
| **Figure B.8** | `Figure_B8_AI_Insights_Recommendations.png` | AI Insights & Recommendations (ML Scikit-Learn) | **Yes** (FastAPI ML + Spring Boot AI Proxy) | **Yes** (1440 × 1000 PNG, 232 KB) | **VERIFIED** |

---

## 2. Detailed Verification Breakdown

### 2.1 Optimization Recommendation with Score Breakdown

- **Target File:** `Optimization_Recommendation_Score_Breakdown.png`
- **Frontend Route:** `/academic/allocations` (Interactive Allocation Modal for Requisition #182)
- **Backend Endpoints:**
  - `GET /api/allocations/requests` (Retrieves active pending academic requests)
  - `POST /api/allocations/optimize/academic` (Executes deterministic 5-factor scoring engine)
- **Database Tables Utilized:** `academic_requests`, `resources`, `timetable_entries`, `academic_allocations`, `audit_logs`
- **Captured Evidence & Data Verification:**
  - **Requisition Context:** Request #182 (*AI & Machine Learning Weekend Workshop*, requested by Dr. S. Ramanujam, 40 students).
  - **Top Recommended Candidate:** `#1 Room 02-201` (`BLD02 - 02-201`), 40 Seats (+0 spare), Tag: `TOP RECOMMENDATION`.
  - **Overall Score:** `90.5 / 100` (Selected).
  - **Deterministic 5-Factor Score Breakdown:**
    - **Resource Suitability (30% weight):** Raw 100% $\rightarrow$ **+30.0 pts** (*Resource matches requested category: CLASSROOM*).
    - **Capacity Efficiency (25% weight):** Raw 100% $\rightarrow$ **+25.0 pts** (*Allocating 40 seats into 40 room capacity, 0 spare*).
    - **Utilization Benefit (20% weight):** Raw 70% $\rightarrow$ **+14.0 pts** (*Well-utilized facility with proven timetable operational readiness*).
    - **Preference Match (15% weight):** Raw 80% $\rightarrow$ **+12.0 pts** (*General campus-wide shared facility match*).
    - **Workload Balance (10% weight):** Raw 95% $\rightarrow$ **+9.5 pts** (*Faculty workload is balanced at 12.00 hrs*).
  - **Runner-Up Candidate:** `#2 Room 01-201` (`BLD01 - 01-201`), 40 seats, Score `88.5 / 100`.
- **Issues Encountered & Resolved:**
  - *Rollback-Only Transaction Issue:* `AcademicAllocationOptimizerImpl.java` was previously marked with `@Transactional(readOnly = true)`. At the end of calculation, it attempted to persist an audit log (`auditLogRepository.save(logEntry)`), triggering an `SQLError: Connection is read-only` and causing an `UnexpectedRollbackException`. Removed `readOnly = true` to allow write commits.
  - *Timetable Conflict Filtering:* The optimizer strictly eliminates candidates that clash with recurring timetable entries in `timetable_entries`. Requisition #182 on a Sunday was selected, allowing all 108 candidate rooms to be evaluated without schedule collisions.

---

### 2.2 Figure B.7: Utilization Analytics Charts

- **Target File:** `Figure_B7_Utilization_Analytics_Charts.png`
- **Frontend Route:** `/analytics` (Sub-tab: `Academic Resources`)
- **Backend Endpoints:**
  - `GET /api/analytics/system-overview` (Overall institutional KPIs)
  - `GET /api/analytics/academic-resources` (Category distributions, capacity loads, extreme utilization ranks)
  - `GET /api/analytics/allocations` (Time-series allocation volumes)
- **Database Tables Utilized:** `resources`, `academic_allocations`, `departments`, `system_metrics`
- **Captured Evidence & Data Verification:**
  - **KPI Cards:**
    - Classroom Utilization: `0%` (0 allocated out of 108 total catalog rooms for the active instantaneous slice).
    - Classroom Capacity Load: `3.05%` (Average student seat utilization rate across all academic sessions).
    - Laboratory Utilization: `0%` (0 allocated out of 30 specialized labs).
  - **Visual Charts:**
    - *Resource Counts by Category:* Discrete bar chart with y-axis (0 to 120), showing 108 Classrooms and 30 Laboratories.
    - *Resource Allocation Volume Over Time:* Continuous area trend chart spanning 2026-09 to 2026-11.
  - **Resource Utilization Extremes Table:**
    - Top Utilized resources ranked with visual progress bars:
      - `AIDS Science Lab 02` (`LAB002`): Artificial Intelligence & Data Science, 2 allocations, 40.0% utilization.
      - `ME Engineering Lab 03` (`LAB003`): Mechanical Engineering, 2 allocations, 40.0% utilization.
      - `EEE Media Lab 04` (`LAB004`): Electrical & Electronics Engineering, 2 allocations, 40.0% utilization.
- **Issues Encountered & Resolved:**
  - Switching to the dedicated `Academic Resources` analytics sub-tab ensured the specific Recharts SVG components (bar graphs, area charts, Cartesian grids, legends) rendered with full layout visibility instead of condensed summary overview widgets.

---

### 2.3 Figure B.8: AI Insights and Recommendations Page

- **Target File:** `Figure_B8_AI_Insights_Recommendations.png`
- **Frontend Route:** `/ai-insights` (Tab: `Executive Overview`)
- **Backend Endpoints:**
  - `GET /api/ai/forecasts` (Spring Boot proxy calling FastAPI ML microservice)
  - `GET /api/ai/recommendations` (AI decision-support advisory rules)
  - `POST http://127.0.0.1:8000/api/predict/demand` (Python FastAPI Scikit-Learn demand predictor)
  - `POST http://127.0.0.1:8000/api/predict/occupancy` (Python FastAPI Scikit-Learn occupancy predictor)
- **Data Verification:**
  - Verified active Scikit-Learn regression pipelines (`academic-demand-v1`, `hostel-occupancy-v1`).
  - **AI Forecast KPI Cards:**
    - *Resource Requisition Load:* Actual 13, Predicted **18** (+33.3% projected demand, Confidence: 85%, Model: `academic-demand-v1`).
    - *Hostel Bed Occupancy:* Actual 82.5%, Predicted **87%** (Upward residential trend, Model: `hostel-occupancy-v1`).
    - *Capacity Deficit Risks:* Actual 0, Predicted **1** (Actionable inventory strain, Model: `heuristic-risk-v1`).
    - *Operational Bottlenecks:* Actual 1, Predicted **2** (Scheduling contention points, Model: `conflict-matrix-v1`).
  - **Priority Decision-Support Recommendations:**
    - *Classroom Facilities (Medium Priority):* "Consider commissioning or scheduling 5 additional classroom sessions/units before the upcoming term."
      - Analytical Rationale: Moderate capacity strain anticipated (demand 18 exceeds capacity 13 by 5 units).
      - Metrics: `availableUnits: 13`, `predictedDemand: 18`, `potentialShortage: 5`, `riskLevel: MEDIUM_RISK`.
    - *Laboratory Facilities (High Priority):* "Consider commissioning or scheduling 11 additional laboratory sessions/units before the upcoming term."
      - Analytical Rationale: Critical shortage anticipated (demand 32 substantially exceeds active inventory 21 by 11 units).
      - Metrics: `availableUnits: 21`, `predictedDemand: 32`, `potentialShortage: 11`, `riskLevel: HIGH_RISK`.
- **Issues Encountered & Resolved:**
  - FastAPI microservice on port 8000 verified operational and serving predictions with sub-50ms latency.
  - Advisory labels clearly distinguish machine learning predictive forecasts from deterministic optimization models.

---

## 3. Environment & Service Run-State

| Component | Port | Technology | Process / Task State | Health Status |
|---|---|---|---|---|
| **Database** | 3306 | MySQL Community Server 8.0 | Native Windows Service | Healthy (Schemas V1–V7 applied) |
| **Backend API** | 8080 | Spring Boot 3.3.4, Java 17 | Background Daemon (PID 28072) | Healthy (`/actuator/health` = UP) |
| **AI Microservice** | 8000 | FastAPI, Uvicorn, Scikit-Learn | Background Daemon (Python 3.12) | Healthy (`/health` = UP) |
| **Frontend Web** | 5173 | React 18, Vite, TypeScript | Background Daemon (Node.js) | Healthy (Vite dev server active) |

---

## 4. Final Verification Checklist

- [x] **Optimization recommendation and score breakdown screenshot exists:** `Optimization_Recommendation_Score_Breakdown.png` (267 KB).
- [x] **Figure B.7 utilization analytics screenshot exists:** `Figure_B7_Utilization_Analytics_Charts.png` (250 KB).
- [x] **Figure B.8 AI insights and recommendations screenshot exists:** `Figure_B8_AI_Insights_Recommendations.png` (232 KB).
- [x] **All three screenshots captured from the real running application** at 1440 × 1000 viewport.
- [x] **Relevant data cross-verified against actual API responses and MySQL database.**
- [x] **Images inspected and confirmed showing complete, unclipped, and readable content.**
- [x] **Verification report saved** in `docs/project-report/screenshots/REQUIRED_FIGURES_REPORT.md`.
- [x] **Existing application functionality and database records remain intact.**
