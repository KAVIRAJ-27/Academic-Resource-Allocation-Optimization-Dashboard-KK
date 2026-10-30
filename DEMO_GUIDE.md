# AHRAO — Judge-Ready Demonstration & Operator Guide

> **Project Title:** Academic & Hostel Resource Allocation Optimization Dashboard (AHRAO)  
> **Repository:** `C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK`  
> **Status:** Production Ready (Phases 1–35 Complete)  
> **Target Alignment:** UN Sustainable Development Goal 4 (Quality Education)  
> **Operating System:** Windows 10/11 (PowerShell)  

---

## 1. Project Purpose & Problem Statement

### 1.1 Problem Statement
Higher education institutions routinely experience severe operational friction:
1. **Facility Misallocation & Idle Capacity:** State-of-the-art computer labs and lecture halls sit vacant during off-peak hours while departments compete for identical rooms during peak midday intervals.
2. **Faculty Teaching Disparities & Burnout:** Uncoordinated departmental scheduling causes unequal credit-hour workloads among faculty members.
3. **Hostel Residential Bottlenecks:** Disconnected ledgers lead to overbooking, untracked bed vacancies, delayed grievance handling, and uncoordinated maintenance.
4. **Siloed Administrative Governance:** Principals, HODs, Faculty, Students, and Wardens operate on isolated spreadsheets without real-time conflict prevention or unified audit telemetry.

### 1.2 The AHRAO Solution
AHRAO replaces fragmented departmental tools with a single source of operational truth backed by mathematical constraint enforcement and predictive AI across two core pillars:
- **Academic Resource Operations:** Classrooms, computing laboratories, specialized equipment, faculty teaching workload balance, timetable clash resolution, and multi-tier requisition workflows.
- **Hostel Residential Operations:** Residential blocks, room inventories, bed vacancies, student check-ins/allocations, grievance routing, and facility maintenance lifecycles.

---

## 2. System Architecture & Technology Stack

```
+-----------------------------------------------------------------------------------+
|                           FRONTEND LAYER (PORT 5173)                              |
|   React 18 + TypeScript + Vite 6 + Tailwind CSS (Dark SaaS Theme) + Recharts      |
+-----------------------------------------------------------------------------------+
                                         |
                                         | HTTP / Bearer JWT (Vite Proxy /api)
                                         v
+-----------------------------------------------------------------------------------+
|                        BACKEND API GATEWAY (PORT 8080)                            |
|    Spring Boot 3.3.3 + Java 17 + Spring Security 6 (Stateless JWT) + HikariCP     |
|    - Phase 28/29: Academic & Hostel Allocation Engines (Pessimistic Locking)      |
|    - Phase 30: Multi-Factor Conflict Detection Engine                             |
|    - Phase 31: Deterministic 5-Factor Mathematical Optimization Engine            |
|    - Phase 32: Centralized Approval Workflow & Tracking Engine                    |
|    - Phase 33: SQL Aggregated Analytics & RFC-4180 CSV Export Engine              |
|    - Phase 34: Python AI Gateway Client (HTTP RestTemplate)                       |
|    - Phase 35: Multi-Component Health Telemetry (/health)                         |
+-----------------------------------------------------------------------------------+
                   |                                             |
                   v                                             v
+------------------------------------+       +--------------------------------------+
|       DATABASE (PORT 3306)         |       |      AI MICROSERVICE (PORT 8000)     |
|   MySQL 8.0 + Flyway (V1 - V8)     |       |      Python 3.10 / FastAPI / Uvicorn |
|   100% Parameterized JPA / JPQL    |       |      Scikit-Learn RandomForest +     |
|   InnoDB Pessimistic Write Locks   |       |      IsolationForest Outlier Engine  |
+------------------------------------+       +--------------------------------------+
```

---

## 3. How to Start the Services

All services can be launched directly in PowerShell from the project root: `C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK`.

### Step 1: Ensure MySQL 8.0 is Running
Verify port 3306 is listening:
```powershell
Get-NetTCPConnection -State Listen -LocalPort 3306
```

### Step 2: Start the Python AI Microservice (Port 8000)
Open a PowerShell terminal:
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\ai-service"
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
*Health Check:* Open `http://127.0.0.1:8000/health` &rarr; Returns `{"status":"UP","app_name":"AHRAO-AI-Service"}`.

### Step 3: Start the Spring Boot Backend (Port 8080)
Open a second PowerShell terminal:
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\backend"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "C:\maven\apache-maven-3.9.16\bin\mvn.cmd" spring-boot:run
```
*Health Check:* Open `http://localhost:8080/health` &rarr; Returns `{"status":"UP","components":{"application":"UP","database":"UP","aiService":"UP"}}`.

### Step 4: Start the Frontend SPA (Port 5173)
Open a third PowerShell terminal:
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\frontend"
npm run dev
```
*Access Application:* Open your web browser and navigate to: `http://localhost:5173`.

---

## 4. Demo Login Accounts & Credentials

The login page at `http://localhost:5173/login` features **one-click role buttons** that instantly pre-fill credentials:

| Role | Username / Identifier | Password | Associated Domain Scope | Landing Dashboard Route |
| :--- | :--- | :--- | :--- | :--- |
| **System Administrator** | `admin` *(or `demo_admin`)* | `Admin@123` | Campus-Wide Master Control | `/admin/dashboard` |
| **College Principal** | `principal` *(or `demo_principal`)* | `Principal@123` | Institutional Oversight & Final Approvals | `/principal/dashboard` |
| **Head of Department (HOD)** | `hod_cs` *(or `demo_hod`)* | `Hod@123` | Computer Science & Engineering | `/hod/dashboard` |
| **Faculty Member** | `faculty_john` *(or `demo_faculty`)* | `Faculty@123` | Assigned Classes & Personal Workload | `/faculty/dashboard` |
| **Student** | `student_alex` *(or `demo_student`)* | `Student@123` | Enrolled Courses & Hostel Bed | `/student/dashboard` |
| **Hostel Warden** | `warden_smith` *(or `demo_warden`)* | `Warden@123` | VSB Residence 1 & 2 Residential Blocks | `/warden/dashboard` |

---

## 5. Judge Demonstration Script (Step-by-Step)

Follow this 7-step sequence to demonstrate the complete end-to-end functionality to evaluators:

### Demonstration 1: Executive Governance & Telemetry (Administrator & Principal)
1. Navigate to `http://localhost:5173/login`.
2. Click **ADMIN** and sign in.
3. Observe **System Master KPIs**: 138 total resources, 6 hostels, 364 beds, system status badges.
4. Navigate to **Analytics** (`/analytics`): Show interactive charts for Resource Category Distribution, Classroom vs. Lab Utilization, and Departmental Allocation Ratios.
5. Click **Reports & Export** tab &rarr; Click **Export CSV** on Academic Resources to download an RFC-4180 compliant CSV file computed directly via database aggregations.
6. Click **AI Insights** (`/ai-insights`): Highlight Scikit-Learn forward demand forecasts (+38.5% classroom demand growth), shortage warnings, and explainable recommendations.
7. Click the user menu &rarr; **Log Out**.

### Demonstration 2: Academic Optimization & Scoring Engine (HOD & Admin)
1. Sign in as **ADMIN** (`admin` / `Admin@123`) or **HOD** (`hod_cs` / `Hod@123`).
2. Navigate to **Academic Allocations** (`/academic/allocations`).
3. Click the **Allocate Resource** button.
4. In the modal, enter Requisition ID: `182` (*AI & Machine Learning Weekend Workshop*, 40 students).
5. Click **Optimize & Recommend**.
6. The backend evaluates candidates against Phase 30 hard constraints and ranks eligible rooms using the **5-Factor Mathematical Optimization Engine**:
   - **Resource Suitability (30% weight):** 100% (+30.0 pts) — Exact classroom category match.
   - **Capacity Efficiency (25% weight):** 100% (+25.0 pts) — 40 students in 40-seat room (0 wasted capacity).
   - **Utilization Benefit (20% weight):** 70% (+14.0 pts) — Balanced utilization.
   - **Preference Match (15% weight):** 80% (+12.0 pts) — Campus shared facility match.
   - **Workload Balance (10% weight):** 95% (+9.5 pts) — Faculty workload balanced at 12.0 hrs.
7. Click **View Explainable Scoring Breakdown** to reveal the detailed weights and justifications.
8. Show the top recommendation: `Room 02-201` with Total Score `90.5 / 100`.

### Demonstration 3: Real-Time Conflict Validation (Phase 30 Conflict Engine)
1. Sign in as **HOD** (`hod_cs` / `Hod@123`).
2. Navigate to **Department Timetable** (`/hod/timetable`).
3. Point out the interactive conflict matrix:
   - Double-booking prevention: Two courses cannot be scheduled in the same room during overlapping hours.
   - Faculty conflict prevention: A professor cannot be assigned to teach two classes simultaneously.
   - Capacity constraint: Course enrollment cannot exceed room seating capacity.

### Demonstration 4: Multi-Tier Request & Approval Lifecycle (Phase 32)
1. Sign in as **FACULTY** (`faculty_john` / `Faculty@123`).
2. Navigate to **Resource Requisition** (`/faculty/resource-requests/new`).
3. Fill out a requisition: Category: *Classroom*, Capacity: *45*, Date: *Upcoming Monday*, Time: *10:00 - 11:30*, Purpose: *Advanced Algorithm Seminar*.
4. Submit the request. Notice the request transitions to `PENDING` with a unique traceable ID.
5. Log out and sign in as **PRINCIPAL** (`principal` / `Principal@123`).
6. Navigate to **Approvals** (`/approvals`).
7. Observe the pending requisition in the queue.
8. Open the approval details: Note the **Live Phase 30 Conflict Check Preview** and **Anti-Self-Approval Enforcement** (approver cannot be requester).
9. Click **Approve Request** &rarr; The system validates constraints, commits the allocation, and updates the lifecycle timeline.

### Demonstration 5: Student Residential Services (Student Portal)
1. Sign in as **STUDENT** (`student_alex` / `Student@123`).
2. Navigate to **Hostel Services** (`/student/hostel/requests`).
3. Submit a residential room change request: Select preferred Hostel (*VSB Residence 1*), Priority (*High*), Reason (*Close to Computing Center*).
4. View the request status: Appears immediately in the student's personal request history.

### Demonstration 6: Warden Residential Operations & Bed Allocation (Warden Console)
1. Sign in as **WARDEN** (`warden_smith` / `Warden@123`).
2. Observe **Warden Dashboard** (`/warden/dashboard`):
   - Scope security: Warden is strictly restricted to assigned hostels (*VSB Residence 1*).
   - Telemetry: Total beds: 64, Occupied: 18, Available: 46, Occupancy: 28.1%.
3. Navigate to **Bed Allocations** (`/warden/allocations`).
4. Click **New Allocation**:
   - Preview Candidate Beds: Evaluates candidate beds filtered strictly by `Hostel ID` &rarr; `Block` &rarr; `Floor` &rarr; `Room` &rarr; `Bed`.
   - Single-Allocation Enforcement: Checks that student does not already hold an active bed.
   - Capacity Overflow Prevention: Re-checks under pessimistic lock (`PESSIMISTIC_WRITE`).
5. Allocate a bed &rarr; Observe bed status immediately flips from `AVAILABLE` to `OCCUPIED`.
6. Navigate to **Resident Roster** (`/warden/students`): Show the resident directory linking students to their assigned rooms and beds.

### Demonstration 7: Auditing & System Telemetry (Admin)
1. Sign in as **ADMIN** (`admin` / `Admin@123`).
2. Navigate to **System Settings & Audit** (`/admin/settings`).
3. Review the immutable audit log: Displays user actor, action type (`MANUAL_HOSTEL_ALLOCATION`, `ACADEMIC_OPTIMIZATION_REQUESTED`, `APPROVAL_PROCESSED`), target entity, and timestamp.

---

## 6. Optimization Scoring Formula Reference

The Academic Allocation Optimization Engine uses a normalized multi-factor weighted scoring model (0–100):

$$\text{Total Score} = (S \times 0.30) + (C \times 0.25) + (U \times 0.20) + (P \times 0.15) + (W \times 0.10)$$

Where:
- **Suitability Score ($S$, 30%):** Measures category alignment (100% for exact match, 50% for compatible alternative).
- **Capacity Efficiency ($C$, 25%):** $\min\left(100, \frac{\text{Requested Capacity}}{\text{Physical Room Capacity}} \times 100\right)$. Penalizes allocating large lecture halls to small seminar cohorts.
- **Utilization Benefit ($U$, 20%):** Rewards facilities with proven timetable operational readiness while avoiding over-saturation.
- **Department Preference Match ($P$, 15%):** 100% for home department rooms, 80% for campus-shared facilities, 40% for cross-department facilities.
- **Faculty Workload Balance ($W$, 10%):** Derived from faculty current contact hours (95% for balanced workload, 45% for overloaded faculty).

---

## 7. Automated Test Suite Execution Commands

### 1. Python AI Service Tests (9 Tests)
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\ai-service"
python -m pytest tests -v
```
*Expected Result:* `9 passed in ~13.62s`.

### 2. Frontend TypeScript & Production Build
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\frontend"
npm run build
```
*Expected Result:* `tsc -b` 0 errors, Vite production bundle generated in `dist/`.

### 3. Backend Verification
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK\backend"
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
& "C:\maven\apache-maven-3.9.16\bin\mvn.cmd" test -Dtest=*Allocation*
```
*Expected Result:* `BUILD SUCCESS` (65/65 allocation engine tests passed).

### 4. Capture All 30 Authentic Screenshots
```powershell
cd "C:\Users\KAVIRAJ\Desktop\PROJECT\Mini project-KK"
python capture_perfect_27.py
python capture_report_figures.py
```
*Expected Result:* 30 high-resolution PNGs saved in `docs\project-report\screenshots\`.

---

## 8. Troubleshooting & Common Operational Solutions

| Issue | Root Cause | Solution |
| :--- | :--- | :--- |
| **Unsupported class file major version 69** | Maven defaulted to Java 25 instead of Java 17 | Ensure `$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.19.10-hotspot"` is set prior to running Maven. |
| **Port 8080 or 8000 already in use** | A previous instance is still running | Find PID using `Get-NetTCPConnection -LocalPort 8080` and terminate using `Stop-Process -Id <PID> -Force`. |
| **AI Service Unavailable (`AI_SERVICE_UNAVAILABLE`)** | FastAPI service on port 8000 is not running | Start the microservice with `python -m uvicorn app.main:app --port 8000`. Spring Boot handles this gracefully with zero downtime. |
| **MySQL connection refused** | MySQL service stopped | Start MySQL via Windows Services (`net start MySQL80`) or verify root credentials. |

---

## 9. Safe Shutdown Instructions

To gracefully stop all running services:
1. In the **Frontend** terminal: Press `Ctrl + C`, then type `y` and press Enter.
2. In the **Backend** terminal: Press `Ctrl + C`. Spring Boot will close connection pools and gracefully shutdown Tomcat.
3. In the **AI Service** terminal: Press `Ctrl + C`. Uvicorn will terminate active workers.
