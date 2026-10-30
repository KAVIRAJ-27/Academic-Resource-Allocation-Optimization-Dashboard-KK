# AHRAO Project — Screenshot Capture & Verification Report

**Project:** Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)  
**Execution Environment:** Windows 11 / OpenJDK 17 / MySQL 8.0 / Python 3.10 / Node v24.18  
**Automation Tool:** Playwright Python (`channel="msedge"`, Headless Chromium Mode)  
**Viewport:** 1440 × 1000 Desktop Resolution  
**Capture Scripts:** `capture_perfect_27.py`, `capture_report_figures.py`  
**Capture Date:** October 26, 2026  
**Result:** 30 / 30 Executed Successfully with Zero Visual Defect or Fallback  

---

## 1. Capture Environment Telemetry

- **Frontend Endpoint:** `http://localhost:5173` (Vite 6 + React 18 SPA)
- **Backend Gateway:** `http://localhost:8080` (Spring Boot 3.3.3 + JPA + Flyway Migrations V1-V8)
- **AI Microservice:** `http://127.0.0.1:8000` (FastAPI + Scikit-Learn RandomForest + IsolationForest)
- **Database Engine:** MySQL 8.0 on `localhost:3306` (`academic_hostel_resource_allocation`)
- **Seeded Dataset:** 10 Departments, 138 Resources, 6 Hostels, 364 Beds, 182 Academic Requests, 500 Hostel Requests, 682 Approvals

---

## 2. Capture Pipeline Execution Trace

### Phase 1: Authentication & Public Views
- `01_Login_Page.png`: Form rendered with 6 one-click demo role switcher pills, email/password fields, and secure JWT sign-in button. Verified at `http://localhost:5173/login`.

### Phase 2: Administrator Workflows (`ROLE_ADMIN`)
- `02_Admin_Dashboard.png`: Campus master KPIs (138 resources, 6 hostels, 364 beds, system status badges).
- `08_Academic_Resource_Catalogue.png`: Full searchable catalog of classrooms, laboratories, and specialized facilities.
- `09_Classroom_Laboratory_Management.png`: Seating capacities, building names, and room numbers.
- `13_Academic_Allocation_Preview.png`: Academic allocations table with filter pills, status tracking, and release actions.
- `15_Hostel_Management.png`: Hostels table showing boys/girls type, total capacity, room counts, and address details.
- `23_Allocation_Result.png`: Committed allocations view with assigned time slots, faculty, and departments.
- `24_Analytics_Dashboard.png`: Recharts interactive bar, pie, and line charts showing real SQL aggregated distributions.
- `26_AI_Demand_Forecast.png`: Machine learning demand forecasts, forward 30-day utilization, and shortage risk indicators.
- `27_Audit_History.png`: Immutable system audit log with actor username, action type, entity, timestamp, and details.

### Phase 3: Principal Workflows (`ROLE_PRINCIPAL`)
- `03_Principal_Dashboard.png`: Executive campus KPIs, student/faculty counts, and cross-department utilization.
- `21_Pending_Requests.png`: Filterable queue of pending academic resource requisitions awaiting institutional approval.
- `22_Request_Approval.png`: Centralized Approval Center showing request details, requester role, purpose, and live conflict check preview.

### Phase 4: HOD Workflows (`ROLE_HOD`)
- `04_HOD_Dashboard.png`: Computer Science & Engineering department KPIs, faculty count, and lab bookings.
- `10_HOD_Timetable.png`: Interactive weekly timetable grid displaying section schedules and room assignments.
- `14_Conflict_Validation.png`: Real-time conflict validation matrix highlighting hard-constraint double bookings.
- `25_Academic_Workload_Analytics.png`: Faculty contact hours breakdown, teaching vs. lab hours, and workload status badges.

### Phase 5: Faculty Workflows (`ROLE_FACULTY`)
- `05_Faculty_Dashboard.png`: Assigned course schedule, personal teaching load, and quick requisition shortcuts.
- `11_Faculty_Resource_Booking.png`: Resource availability explorer for booking smart classrooms and computer labs.
- `12_Academic_Request_Submission.png`: Requisition submission modal with date pickers, time intervals, purpose, and cohort size.

### Phase 6: Student Workflows (`ROLE_STUDENT`)
- `06_Student_Dashboard.png`: Student profile, enrolled courses, registered timetable, and residential bed allocation status.
- `17_Student_Hostel_Request.png`: Residential room/bed change request submission with hostel selection and priority tagging.

### Phase 7: Warden Workflows (`ROLE_WARDEN`)
- `07_Warden_Dashboard.png`: Assigned hostel occupancy metrics, total beds, occupied beds, and active maintenance orders.
- `16_Hostel_Blocks_and_Rooms.png`: Hierarchical block, floor, and room breakdown with capacity indicators.
- `18_Hostel_Bed_Allocation.png`: Bed allocation dashboard with candidate preview, auto-allocation, and manual bed assignment.
- `19_Hostel_Occupancy.png`: Multi-hostel occupancy comparison chart and vacancy percentages.
- `20_Warden_Resident_Roster.png`: Searchable resident directory linking students to their assigned rooms and beds.

### Phase 8: Required College Report Figures
- `Optimization_Recommendation_Score_Breakdown.png`: Interactive 5-Factor mathematical score breakdown (Suitability 30%, Capacity Efficiency 25%, Utilization 20%, Preference Match 15%, Workload Balance 10%) expanded on Requisition #182.
- `Figure_B7_Utilization_Analytics_Charts.png`: Multi-metric utilization charts across departments and facilities.
- `Figure_B8_AI_Insights_Recommendations.png`: Scikit-Learn predictive model insights, demand growth percentages, and explainable recommendations.

---

## 3. Conformance & Integrity Certification

All 30 screenshots have been inspected and verified:
1. Every file exists on disk in `docs\project-report\screenshots\`.
2. Every file is a valid non-empty PNG.
3. No dummy data, error overlays, or blank loading states appear in the screenshots.
4. All captured data matches the underlying database tables and live API responses.
