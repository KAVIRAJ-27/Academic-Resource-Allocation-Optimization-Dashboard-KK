# Phase 33: Utilization Analytics, Charts & Reports

## 1. Executive Summary

Phase 33 delivers a production-grade, read-only analytics, interactive charting, and reporting engine for the Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO). All metrics, percentages, time series, and distributions are calculated directly from real database records using database-level SQL/JPA aggregation (`COUNT`, `SUM`, `AVG`, `GROUP BY`) rather than in-memory record loading. Strictly NO mock, random, or placeholder data is used, and NO AI/ML is included (reserved for Phase 34).

```text
Frontend (Analytics Dashboard / Reports Hub)
     ↓
Analytics API Client (`analyticsApi.ts`)
     ↓
Analytics Controller (`/api/analytics/*`)
     ↓
Analytics Service & Scope Enforcement (`AnalyticsServiceImpl`)
     ↓
Analytics Query Aggregation (`AnalyticsQueryRepositoryImpl`)
     ↓
MySQL 8.0 Database (Aggregated via SQL)
```

---

## 2. Core Architectural Principles

1. **Read-Only Telemetry**:
   - Analytics queries never mutate entities or create state changes.
   - Strictly isolated from allocation state machines.

2. **Database-Level Aggregation**:
   - Zero `findAll()` streaming over large datasets.
   - All groupings, count summaries, and averages are executed in SQL.

3. **Strict Scope & RBAC Enforcement**:
   - **ADMIN & PRINCIPAL**: Unrestricted campus-wide academic, hostel, and governance analytics.
   - **HOD**: Strictly constrained to the caller's assigned department (`HodDepartmentResolver`). Cannot access other departments.
   - **WARDEN**: Strictly constrained to the caller's assigned hostels (`WardenScopeService`). Cannot view unassigned residential buildings.
   - **FACULTY & STUDENT**: Restricted to self-relevant workloads, allocations, and requests.

4. **Guaranteed Safe Division**:
   - Every percentage formula prevents division by zero by returning `0.0` whenever the denominator is zero or empty.

---

## 3. Mathematical Formulas

### Academic Resource Utilization

$$\text{Utilization \%} = \frac{\text{Allocated Resources}}{\text{Active Resources}} \times 100$$
*(Active Resources = Total Resources $-$ Under Maintenance $-$ Inactive)*

### Classroom Capacity Utilization

$$\text{Capacity Load \%} = \text{AVG}\left(\frac{\text{Allocated Students Quantity}}{\text{Classroom Capacity}}\right) \times 100$$

### Laboratory Utilization

$$\text{Lab Utilization \%} = \frac{\text{Allocated Labs}}{\text{Total Available Labs}} \times 100$$

### Equipment Utilization

$$\text{Equipment Utilization \%} = \frac{\text{Total Quantity} - \text{Available Quantity}}{\text{Total Quantity}} \times 100$$

### Hostel Bed Occupancy & Availability

$$\text{Occupancy \%} = \frac{\text{Occupied Beds}}{\text{Active Beds}} \times 100$$
$$\text{Availability \%} = \frac{\text{Available Beds}}{\text{Active Beds}} \times 100$$
*(Active Beds = Occupied Beds $+$ Available Beds; inactive and maintenance beds are excluded from capacity)*

### Request Approval Rate

$$\text{Approval Rate \%} = \frac{\text{Approved Requests}}{\text{Total Processed Requests}} \times 100$$

### Grievance Resolution Velocity

$$\text{Resolution Rate \%} = \frac{\text{Resolved Complaints} + \text{Closed Complaints}}{\text{Total Complaints}} \times 100$$

---

## 4. REST API Reference

| Endpoint | Method | Permitted Roles | Scope Filter Applied |
| :--- | :--- | :--- | :--- |
| `/api/analytics/overview` | GET | All Authenticated | High-level campus KPI overview |
| `/api/analytics/academic/overview` | GET | All Authenticated | Academic utilization summary |
| `/api/analytics/academic/resources` | GET | All Authenticated | Resource category & status counts |
| `/api/analytics/academic/classrooms` | GET | All Authenticated | Classroom inventory & seat utilization |
| `/api/analytics/academic/labs` | GET | All Authenticated | Laboratory utilization & trends |
| `/api/analytics/academic/equipment` | GET | All Authenticated | Equipment inventory & quantity usage |
| `/api/analytics/academic/allocations` | GET | All Authenticated | Allocation status & time series |
| `/api/analytics/academic/requests` | GET | All Authenticated | Request pipeline & approval rates |
| `/api/analytics/academic/conflicts` | GET | All Authenticated | Conflict severity & code breakdown |
| `/api/analytics/academic/workload` | GET | All Authenticated | Faculty teaching hours & balance |
| `/api/analytics/academic/departments` | GET | All Authenticated | Departmental comparative benchmarks |
| `/api/analytics/hostel/overview` | GET | All Authenticated | Hostel living & bed distribution |
| `/api/analytics/hostel/occupancy` | GET | All Authenticated | Hostel & block occupancy tables |
| `/api/analytics/hostel/rooms` | GET | All Authenticated | Detailed room-level occupancy list |
| `/api/analytics/hostel/requests` | GET | All Authenticated | Room change & hostel requests |
| `/api/analytics/hostel/complaints` | GET | All Authenticated | Grievance resolution metrics |
| `/api/analytics/hostel/maintenance` | GET | All Authenticated | Facility maintenance tickets |
| `/api/analytics/reports/export` | GET | All Authenticated | Download RFC-4180 UTF-8 CSV |

---

## 5. Report Generation & CSV Export

The system provides 1-click audit-ready CSV report generation for 7 core domains:

1. `ACADEMIC_RESOURCES`: Resource name, code, category, type, department, capacity, active allocations, utilization %.
2. `ACADEMIC_ALLOCATIONS`: Allocation categories and volume.
3. `DEPARTMENT_SUMMARY`: Students, faculty, courses, resources, allocations, and average workload per department.
4. `FACULTY_WORKLOAD`: Instructional hours, lab hours, total hours, and balance status per faculty member.
5. `HOSTEL_OCCUPANCY`: Hostel, block, room count, bed capacity, occupied beds, and occupancy percentage.
6. `HOSTEL_COMPLAINTS`: Grievance counts by status.
7. `MAINTENANCE_REQUESTS`: Maintenance work orders by status.

### Audit Trail

Every report download invokes `AuditLogRepository.save()`:

- `action`: `REPORT_EXPORT`
- `entityType`: `ANALYTICS_REPORT`
- `newValue`: JSON string detailing `reportType`, `rowCount`, and `exportedAt` timestamp.

---

## 6. Frontend Analytics Experience

The frontend at `/analytics` provides a dark SaaS workspace with 7 navigation tabs:

- **System Overview**: Top KPI cards, cross-domain telemetry, live status pulses.
- **Academic Resources**: Classroom capacity metrics, laboratory utilization, top & bottom utilized resources table.
- **Allocations & Requests**: Request pipeline donut chart, allocation status distributions, conflict severity bar chart, and monthly trends.
- **Hostel Living & Occupancy**: Stacked bar chart of occupied vs available beds, hostel cards, room inventory table.
- **Faculty & Workload**: Weekly teaching hours distribution, department comparison chart.
- **Grievances & Maintenance**: Complaint resolution velocity and maintenance ticket pipeline.
- **Reports & Export**: Report selector toolbar with 1-click CSV download and audit confirmation.

---

## 7. Verification & Test Suite

- `AnalyticsServiceTest`: 5 unit tests validating calculations, zero denominators, and category rankings.
- `AnalyticsSecurityTest`: 3 unit tests verifying class-level `@PreAuthorize`, controller delegation, and HTTP headers.
- `ReportExportServiceTest`: 2 unit tests verifying CSV formatting, RFC-4180 escaping, and audit logging.
- Frontend build: TypeScript strict compilation (`tsc -b`) and Vite production bundle.
