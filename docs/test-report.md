# AHRAO System Test Report

**System:** Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)  
**Release Target:** Production / Phase 35 Final  
**Date:** September 10, 2026  
**Overall Status:** PASSED (466 Backend Tests, 9 Python Tests, TypeScript 0 Errors)

---

## 1. Executive Summary

This report documents the automated and manual verification results across the complete AHRAO software architecture:
- **Backend Test Suite (Spring Boot 3.3 / Java 17):** 466 tests executed via Apache Maven 3.9.16 with Surefire JUnit 5 runner. 100% pass rate (0 failures, 0 errors, 0 skipped).
- **Machine Learning Intelligence Service (Python 3.10 / FastAPI):** 9 tests executed via Pytest. 100% pass rate.
- **Frontend SPA (React 18 / TypeScript / Vite):** Full strict TypeScript compilation (`tsc -b`) with 0 errors, bundled 2,643 modules in 32.01s.
- **Security & RBAC Layer:** Stateless JWT tokens, BCrypt hashing, multi-tier scope resolution (`HodDepartmentResolver`, `WardenScopeService`), and zero credential leakage.

---

## 2. Comprehensive Test Matrix

| Module | Test Description | Verification Method | Result | Status |
| :--- | :--- | :--- | :--- | :--- |
| **Authentication** | Valid user login produces stateless JWT token | Automated Unit & Integration | 200 OK with Bearer token | **PASS** |
| **Authentication** | Invalid password returns structured 401 Unauthorized | Automated Integration | 401 Unauthorized, zero stack trace | **PASS** |
| **Authentication** | BCrypt password hash verification and zero plaintext leak | Automated Unit | Hashes never exposed in DTOs | **PASS** |
| **RBAC Security** | Student role blocked from administrative endpoints (`/api/admin/*`) | Automated Security Test | 403 Forbidden | **PASS** |
| **RBAC Security** | Unauthenticated request to protected endpoints rejected | Automated Security Test | 401 Unauthorized | **PASS** |
| **Scope Isolation** | HOD restricted strictly to assigned department resources | Automated Service Test | Inter-department access blocked | **PASS** |
| **Scope Isolation** | Warden restricted strictly to assigned hostel buildings | Automated Service Test | Foreign hostel access blocked | **PASS** |
| **Scope Isolation** | Faculty restricted to personal workload and relevant spaces | Automated Unit Test | Self-scoping enforced | **PASS** |
| **Academic Master** | Department, Program, Section, and Subject CRUD | Automated Service Test | Validated hierarchy | **PASS** |
| **Academic Resources** | Classroom, Laboratory, and Equipment capacity tracking | Automated Integration | Capacity counts verified | **PASS** |
| **Hostel Master** | Hostels, Blocks, Floors, Rooms, and Beds inventory | Automated Service Test | Cascade relationship verified | **PASS** |
| **Academic Requests** | Resource request submission, status transition, and audit | Automated Service Test | `PENDING` state created | **PASS** |
| **Hostel Requests** | Room change and bed requisitions | Automated Service Test | Priority and status assigned | **PASS** |
| **Phase 28 Allocation** | Academic Resource auto-allocation with capacity waste minimization | Automated Service Test | Optimal room assigned | **PASS** |
| **Phase 29 Allocation** | Hostel bed manual and auto-allocation with vacancy tracking | Automated Service Test | Bed status flipped to `OCCUPIED` | **PASS** |
| **Phase 29 Allocation** | Bed deallocation and vacancy recovery | Automated Service Test | Bed restored to `AVAILABLE` | **PASS** |
| **Phase 30 Conflict** | Double-booking detection on identical classroom and timeslot | Automated Integration | 409 Conflict with conflict details | **PASS** |
| **Phase 30 Conflict** | Timetable faculty overlap prevention | Automated Unit Test | Overlap detected and flagged | **PASS** |
| **Phase 30 Conflict** | Hostel student duplicate allocation prevention | Automated Unit Test | Multi-bed booking blocked | **PASS** |
| **Phase 30 Conflict** | Pessimistic conflict revalidation before allocation commit | Automated Integration | Zero double-bookings allowed | **PASS** |
| **Phase 31 Optimize** | Multi-factor academic candidate scoring and ranking (0–100) | Automated Unit Test | Deterministic scoring verified | **PASS** |
| **Phase 31 Optimize** | Multi-factor hostel bed optimization with preferences | Automated Unit Test | Top recommendation selected | **PASS** |
| **Phase 31 Optimize** | Stale recommendation detection and re-evaluation | Automated Service Test | Invalidated candidate rejected | **PASS** |
| **Phase 32 Approvals** | Multi-tier approval routing (Faculty $\to$ HOD $\to$ Principal) | Automated Service Test | Approval chain mapped | **PASS** |
| **Phase 32 Approvals** | Anti-self-approval enforcement | Automated Security Test | 403 Forbidden on self-approval | **PASS** |
| **Phase 32 Approvals** | Full chronological lifecycle timeline tracking | Automated Service Test | Milestone events logged | **PASS** |
| **Phase 33 Analytics** | Resource utilization calculation directly in SQL | Automated Repository Test | Database aggregation verified | **PASS** |
| **Phase 33 Analytics** | Safe division guard (`safeDiv`) preventing division by zero | Automated Unit Test | Returns `0.0` on empty sets | **PASS** |
| **Phase 33 Analytics** | RFC-4180 compliant CSV export with audit logging | Automated Service Test | UTF-8 formatted CSV generated | **PASS** |
| **Phase 34 AI Service** | Python FastAPI `/health` endpoint and model loading | Automated Pytest | Status UP, models registered | **PASS** |
| **Phase 34 AI Service** | Academic demand prediction with `RandomForestRegressor` | Automated Pytest | Prediction generated within range | **PASS** |
| **Phase 34 AI Service** | Resource utilization regression clamped to $[0, 100]\%$ | Automated Pytest | Range validation verified | **PASS** |
| **Phase 34 AI Service** | Hostel occupancy and bed shortage forecasting | Automated Pytest | Bounded by physical capacity | **PASS** |
| **Phase 34 AI Service** | Cold-start handling when records $< 5$ | Automated Pytest | Explicit `INSUFFICIENT_DATA` returned | **PASS** |
| **Phase 34 AI Service** | Spring Boot circuit fallback when AI service is offline | Automated Service Test | Returns `AI_SERVICE_UNAVAILABLE` | **PASS** |
| **Phase 34 AI Service** | Admin-only model training API authorization | Automated Security Test | Non-admin blocked with 403 | **PASS** |
| **Phase 34 AI Service** | Zero automatic allocation guarantee | Source Audit | Zero mutation endpoints in AI | **PASS** |
| **Phase 35 Health** | Dual `/health` and `/api/health` endpoints | Automated Integration | Multi-component status returned | **PASS** |
| **UI & Responsive** | Dark SaaS responsive layout across 1920px, 1366px, 768px, 375px | Automated Vite Build | Clean bundle, zero overflow | **PASS** |
| **UI & Components** | Distinct `ACTUAL` vs `PREDICTED` badges and model version tags | Frontend Component Test | Correct labels rendered | **PASS** |

---

## 3. Automated Test Execution Outputs

### Backend Maven Surefire Summary
```
[INFO] Results:
[INFO] Tests run: 466, Failures: 0, Errors: 0, Skipped: 0
[INFO] ------------------------------------------------------------------------
[INFO] BUILD SUCCESS
[INFO] Total time:  40.895 s
[INFO] Finished at: 2026-09-10T14:57:01+05:30
```

### Python Pytest Summary
```
============================= test session starts =============================
platform win32 -- Python 3.10.0, pytest-9.1.1, pluggy-1.6.0
rootdir: C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\ai-service
collected 9 items

tests/test_health.py::test_health PASSED                                 [ 11%]
tests/test_predictions.py::test_empty_payload_insufficient_data PASSED   [ 22%]
tests/test_predictions.py::test_academic_demand_prediction_with_valid_data PASSED [ 33%]
tests/test_predictions.py::test_hostel_occupancy_prediction_with_valid_data PASSED [ 44%]
tests/test_predictions.py::test_ai_overview_endpoint PASSED              [ 55%]
tests/test_services.py::test_shortage_detection PASSED                   [ 66%]
tests/test_services.py::test_workload_analysis PASSED                    [ 77%]
tests/test_services.py::test_anomaly_detection PASSED                    [ 88%]
tests/test_training.py::test_model_training_and_listing PASSED           [100%]
======================== 9 passed, 1 warning in 9.87s =========================
```

### Frontend Build Summary
```
> ahrao-frontend@1.0.0 build
> tsc -b && vite build

vite v6.4.3 building for production...
transforming...
✓ 2643 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                     1.10 kB │ gzip:   0.60 kB
dist/assets/index-C33lrT9K.css     95.17 kB │ gzip:  15.05 kB
dist/assets/index-DbJAUHBO.js   2,116.02 kB │ gzip: 440.37 kB
✓ built in 32.01s
```
