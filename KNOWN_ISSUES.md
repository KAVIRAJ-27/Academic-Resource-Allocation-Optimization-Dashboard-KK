# Known Issues & Operational Limitations

This document provides a transparent, comprehensive account of genuine operational boundaries, environmental prerequisites, and deliberate architectural constraints in the Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO).

---

## 1. AI & Machine Learning Intelligence Layer

### 1.1 Cold-Start Threshold (`MIN_TRAINING_RECORDS = 5`)

- **Limitation:** In pristine or freshly provisioned institutional databases where fewer than 5 historical allocation or requisition records exist, predictive machine learning models (`RandomForestRegressor`, `IsolationForest`) will return an explicit `INSUFFICIENT_DATA` status.
- **Rationale:** Strict enforcement of the project's **No Fake Predictions** principle. The system will never fabricate synthetic or randomized forecasts when empirical data is inadequate.
- **Resolution:** As normal campus operations progress and users submit resource requisitions and bookings, the system automatically transitions to active prediction once the record threshold is met.

### 1.2 Unsupervised Anomaly Detection Labels

- **Limitation:** Operational anomalies (reservation volume surges, unusual cancellation patterns) are detected using unsupervised `IsolationForest` combined with statistical $z$-score deviations.
- **Rationale:** Institutional environments lack standardized ground-truth anomaly datasets. Anomaly alerts are presented as potential administrative indicators rather than definitive supervised classifications.
- **Resolution:** Administrative staff can review highlighted records in the AI Recommendations tab before taking discretionary operational action.

### 1.3 Topology Evolution & Retraining

- **Limitation:** If institution administrators drastically alter semester timing boundaries, add new academic degrees, or renumber residential blocks, previously trained model weights stored in `ai-service/saved_models/` will not immediately reflect the new topology until retrained.
- **Resolution:** System administrators can trigger retraining on live database records via the Admin Console (`POST /api/ai/models/train`).

---

## 2. Reporting & Analytics

### 2.1 PDF Binary Export Format

- **Limitation:** While complete RFC-4180 compliant CSV export is implemented across all 7 institutional report domains (Academic Resources, Allocations, Requisitions, Conflicts, Workload, Residential Occupancy, and Maintenance), direct PDF binary rendering is reserved for future extensions.
- **Resolution:** CSV exports can be opened in Microsoft Excel, Google Sheets, or LibreOffice Calc and converted to PDF using standard print formatting.

### 2.2 Client-Side Browser Zoom & Ultra-Dense Tables

- **Limitation:** On viewports under 1024px width (mobile phones and smaller tablets), complex analytical comparison matrices (such as the 12-column Warden Bed Occupancy grid) require horizontal swipe scrolling to preserve data integrity and prevent text clipping.
- **Resolution:** Responsive CSS employs `overflow-x-auto` to allow smooth touch panning on mobile displays without disrupting page layout.

---

## 3. Infrastructure & Deployment

### 3.1 Python AI Microservice Dependency

- **Limitation:** If the Python FastAPI service on port 8000 is stopped or unreachable, AI predictive widgets display `"AI insights are temporarily unavailable."`
- **Resolution:** Built-in resilience in `AiClientService` ensures that core academic scheduling, hostel allocations, Phase 30 conflict detection, and Phase 32 approvals continue running with zero application downtime.

### 3.2 Database DDL Auto Policy in Production

- **Limitation:** In `application.yml`, `spring.jpa.hibernate.ddl-auto` is set to `validate`. If database schema migrations are applied out of order or Flyway migrations fail, Spring Boot will refuse to start.
- **Resolution:** All schema changes must be applied through standard Flyway migration scripts located in `src/main/resources/db/migration/`.

### 3.3 Default Development JWT Secret

- **Limitation:** The development fallback JWT secret provided in `application.yml` is an example 256-bit hexadecimal string.
- **Resolution:** In production environments, administrators must set the `JWT_SECRET` environment variable to a secure, randomly generated 256-bit string.
