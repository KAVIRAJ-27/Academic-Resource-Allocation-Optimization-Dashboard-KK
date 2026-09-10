# Phase 31: Optimization Algorithm & Recommended Allocation

## 1. Executive Summary
Phase 31 implements an explainable, deterministic optimization and recommendation framework for AHRAO (Academic & Hostel Resource Allocation Optimization Dashboard). It bridges the gap between raw candidate evaluation and final allocation by providing transparent recommendations ranked by multi-factor mathematical scores.

```
Request
   ↓
Generate Candidates (Scope & Category Filtered)
   ↓
Phase 30 Hard Constraints Gatekeeper (Double Booking, Scope, Capacity, Eligibility)
   ↓
Explainable Scoring (Normalized 0–100 Soft Scores with Configurable Weights)
   ↓
Deterministic Ranking (Score DESC, Resource/Bed ID ASC)
   ↓
Top & Alternative Recommendations with Explainable Reasons & Score Breakdown
   ↓
User Review & Selection in Dashboard
   ↓
Existing Allocation Engine (Phase 28 / Phase 29)
   ↓
Phase 30 Conflict Revalidation Under Transactional Lock
   ↓
Final Allocation Commit
```

---

## 2. Core Design Principles
1. **Explainable & Deterministic**: Pure mathematical formulas with normalized factor scores (0–100), transparent weights, and human-readable rationales. Strictly NO black-box AI, Machine Learning, Neural Networks, or Genetic Algorithms.
2. **Hard Constraints Priority**: The optimizer **never** recommends an invalid candidate. Hard constraints strictly gate candidates before scoring. Any candidate failing Phase 30 validation with `canAllocate = false` or `severity = ERROR` is disqualified.
3. **Read-Only Simulation**: Optimization preview endpoints do not alter database entities, create bookings, or lock resources.
4. **Race-Safe Execution Flow**: Recommendations are committed through existing Phase 28 and Phase 29 transactional endpoints, which re-run Phase 30 conflict detection under lock before committing.

---

## 3. Hard vs Soft Constraints

### Hard Constraints (Strict Exclusion Filter)
| Domain | Constraint | Disqualification Rule |
| :--- | :--- | :--- |
| **Academic** | Status & Maintenance | Resource status must not be `INACTIVE` or `MAINTENANCE` |
| **Academic** | Capacity Sufficiency | Resource capacity must be $\ge$ requested quantity |
| **Academic** | Double Booking | No active allocation during requested date & time slot |
| **Academic** | Faculty Conflict | Requesting faculty must not have overlapping timetable/allocation |
| **Academic** | Section Conflict | Requesting section must not have overlapping classes |
| **Academic** | Hierarchy & Scope | Requester must be authorized for the department/institution |
| **Hostel** | Student Eligibility | Student must exist, be active, and have no active bed allocation |
| **Hostel** | Bed Status | Bed must be active and marked `AVAILABLE` with 0 active allocations |
| **Hostel** | Room & Hostel Status | Room must not be `MAINTENANCE`/`INACTIVE`; Hostel must be `ACTIVE` |
| **Hostel** | Room/Hostel Capacity | Room and hostel active allocations must not exceed capacity |
| **Hostel** | Warden Scope | Warden can only allocate beds within their assigned hostels |

### Soft Constraints (Optimization Scoring Factors)

#### Academic Resource Allocation Scoring (Default Weights = 100)
1. **Resource Suitability (Weight: 30)**:
   - Evaluates match between requested category and candidate resource category.
   - Exact category match: $100\%$.
   - Compatible shared resource: $75\%$.
   - Alternative: $30\%$.
2. **Capacity Efficiency (Weight: 25)**:
   - Minimizes unused capacity: $\text{Raw Score} = \min(100, \frac{\text{requestedSeats}}{\text{resourceCapacity}} \times 100)$.
   - Prevents booking 100-seat auditoriums for a 20-student group when a 25-seat classroom is free.
3. **Utilization Benefit (Weight: 20)**:
   - Balances campus facility utilization using live database allocation and timetable records.
   - Proven active resources get positive utilization scores while avoiding dormant room lockouts.
4. **Preference Match (Weight: 15)**:
   - Department alignment: $100\%$ for resource belonging to requested department; $80\%$ for shared campus facility; $40\%$ for cross-department.
5. **Workload Balance (Weight: 10)**:
   - Checks faculty teaching load from `FacultyWorkload`: $95\%$ for `BALANCED`, $85\%$ for `UNDERLOADED`, $45\%$ for `OVERLOADED`. Defaults to $75\%$ (neutral) if unassigned. Never fabricates workload data.

#### Hostel Bed Allocation Scoring (Default Weights = 100)
1. **Hostel Preference (Weight: 30)**:
   - Matches student's preferred hostel requested in `HostelRequest`: $100\%$ on match; $35\%$ on alternative; $80\%$ if no preference stated.
2. **Occupancy Balancing (Weight: 25)**:
   - Balances campus residential density: $\text{Raw Score} = \max(0, (1.0 - \frac{\text{activeBeds}}{\text{totalBeds}}) \times 100)$.
   - Prevents saturating one hostel while others remain under-utilized.
3. **Room Suitability (Weight: 20)**:
   - Verifies room layout, floor, and operational availability. Active rooms with full facilities score $100\%$.
4. **Bed Availability (Weight: 15)**:
   - Confirms verified immediate readiness with zero contention: $100\%$.
5. **Capacity Efficiency (Weight: 10)**:
   - Measures room consolidation density: $\min(100, \frac{\text{occupiedInRoom} + 1}{\text{roomCapacity}} \times 100)$.
   - Consolidates roommates into partially filled rooms before opening empty rooms.

---

## 4. Deterministic Ranking & Tie Breaking
1. Candidates are sorted by aggregated weighted score descending:
   $$\text{Total Score} = \sum (\text{Raw Score}_i \times \frac{\text{Weight}_i}{100})$$
2. Ties are broken deterministically by primary database key ascending (`resource.id ASC` or `bed.id ASC`).
3. Ranks are assigned as integers: $1, 2, \dots, N$.

---

## 5. REST API Specifications

### Academic Optimization Preview
`POST /api/academic/resource-allocations/optimize`
- **Security**: `@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'FACULTY')")`
- **Request Body**:
  ```json
  {
    "requestId": 101,
    "timeSlotId": 4,
    "requestedCapacity": 40
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "3 optimal academic allocation candidates found.",
    "data": {
      "success": true,
      "requestId": 101,
      "totalCandidatesEvaluated": 8,
      "validCandidates": 3,
      "recommendations": [
        {
          "rank": 1,
          "candidateId": 12,
          "candidateName": "CSE-201",
          "candidateCode": "CSE-201",
          "score": 91.5,
          "valid": true,
          "scoreBreakdown": {
            "resourceSuitability": 30.0,
            "capacityEfficiency": 22.2,
            "utilizationBenefit": 16.0,
            "preferenceMatch": 15.0,
            "workloadBalance": 8.3
          },
          "factors": [
            {
              "factor": "CAPACITY_EFFICIENCY",
              "weight": 25.0,
              "rawScore": 88.9,
              "weightedScore": 22.2,
              "description": "Minimizes unused space (requested 40 / 45 seats)"
            }
          ],
          "reasons": [
            "Resource matches requested category: Classroom (100% suitability)",
            "Capacity efficiency: 89% (Allocating 40 seats into 45 room capacity)",
            "Zero scheduling or double-booking conflicts detected.",
            "Resource belongs to requested department (Computer Science)"
          ],
          "details": {
            "capacity": 45,
            "wastedCapacity": 5,
            "building": "Engineering Block B",
            "roomNumber": "201"
          }
        }
      ]
    }
  }
  ```

### Hostel Optimization Preview
`POST /api/hostel/resource-allocations/optimize`
- **Security**: `@PreAuthorize("hasAnyRole('ADMIN', 'PRINCIPAL', 'HOD', 'WARDEN')")`
- **Request Body**:
  ```json
  {
    "hostelRequestId": 201,
    "hostelId": 10
  }
  ```
- **Response**:
  ```json
  {
    "success": true,
    "message": "2 optimal hostel bed candidates found.",
    "data": {
      "success": true,
      "requestId": 201,
      "totalCandidatesEvaluated": 15,
      "validCandidates": 2,
      "recommendations": [
        {
          "rank": 1,
          "candidateId": 501,
          "candidateName": "Bed #1 (Room 101)",
          "score": 93.0,
          "valid": true,
          "scoreBreakdown": {
            "hostelPreference": 30.0,
            "occupancyBalance": 20.0,
            "roomSuitability": 20.0,
            "bedAvailability": 15.0,
            "capacityEfficiency": 8.0
          },
          "reasons": [
            "Matches student's preferred hostel (Hostel Alpha)",
            "Balanced campus occupancy: Hostel is 20% occupied",
            "Bed #1 is ready for immediate allocation",
            "Room has 1 remaining open bed out of 2"
          ]
        }
      ]
    }
  }
  ```

---

## 6. Frontend UI Components
- **`OptimizationRecommendationCard`**: Luxury SaaS card with rank medal badge (#1 Highlight), total score bar, human-readable checkmark reasons, expandable 5-factor breakdown, and "Use Recommendation" CTA.
- **`OptimizationComparisonTable`**: Responsive comparison table allowing side-by-side assessment of candidates across capacity, location, scores, and selection status.
- **Integrated Modals**: `AcademicAllocationModal` and `HostelAllocationModal` include dedicated "Optimize & Recommend" workflows with "Finding best allocation..." loaders and graceful stale allocation recovery.
