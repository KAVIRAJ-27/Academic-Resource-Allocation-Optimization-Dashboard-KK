# Admin Academic Resource Management (Phase 10)

## 1. Overview

The **Admin Academic Resource Management** module (Phase 10 of the Academic & Hostel Resource Allocation Optimization Dashboard - AHRAO) establishes the comprehensive physical inventory, master space catalog, laboratory equipment, and weekly time periods baseline.

This module provides the administrative master-data and availability management that future operational phases consume:

- Student & Faculty Resource Request Workflows (Phase 11+)
- Automated Master Timetable Generation
- Real-time Conflict Detection Engine
- Optimization Algorithm & AI Forecasting
- Utilization Telemetry & Spatial Analytics

---

## 2. Resource Master Hierarchy

```text
+------------------------------------------------------------------------------------+
|                                INSTITUTION PROFILE                                 |
+------------------------------------------+-----------------------------------------+
                                           |
                    +----------------------+----------------------+
                    |                                             |
                    v                                             v
         +--------------------+                        +--------------------+
         | RESOURCE CATEGORY  |                        |     TIME SLOTS     |
         | (Classroom, Lab,   |                        | (Master Timetable  |
         |  Equipment, etc.)  |                        |  Period Schedules) |
         +---------+----------+                        +--------------------+
                   |
                   v
         +--------------------+
         | ACADEMIC RESOURCE  |
         | (Master Inventory  |
         |  Asset Record)     |
         +----+----+----+-----+
              |    |    |
     +--------+    |    +--------+
     |             |             |
     v             v             v
+-----------+ +-----------+ +------------+
| CLASSROOM | |LABORATORY | | EQUIPMENT  |
| (Lecture  | |(Workgroup | |(Individual |
|  Halls,   | | & Specs,  | | Serialized |
|  Smart Bds| | Dept Ref) | | Apparatus) |
+-----------+ +-----------+ +------------+
```

### Hierarchy Constraints & Structural Integrity

1. **Resource Category**:
   - Classifies physical assets: `CLASSROOM`, `LABORATORY`, `EQUIPMENT`, `AUDITORIUM`, `SEMINAR_HALL`.
   - Unique code, unique naming rules.
   - Deletion blocked if active resources exist under the category.
2. **Academic Resource**:
   - Master asset registry containing `code` (unique), `name`, `category`, `capacity`, `location`, `quantity`, `availableQuantity`, `status` (`AVAILABLE`, `ALLOCATED`, `MAINTENANCE`, `INACTIVE`).
   - May optionally link to an academic `Department` from Phase 9.
   - Setting a resource to `MAINTENANCE` automatically propagates status updates to attached classrooms, laboratories, and equipment.
3. **Classroom**:
   - 1-to-1 relational mapping with parent `Resource` record.
   - Contains room number, building, floor level, seating capacity (> 0), room type (`LECTURE_HALL`, `SEMINAR_ROOM`, `TUTORIAL_ROOM`, `AUDITORIUM`), and amenities (`hasProjector`, `hasAc`, `hasSmartBoard`).
4. **Laboratory**:
   - 1-to-1 relational mapping with parent `Resource` record.
   - Contains building, floor, room number, student capacity (> 0), laboratory domain type (`COMPUTER_SCIENCE`, `ELECTRONICS`, `PHYSICS`, etc.), workstation/computer count, and department relationship.
5. **Equipment**:
   - Foreign-key linked to parent `Resource`.
   - Relational record per unit/serial number: `serialNumber` (unique), `manufacturer`, `model`, `purchaseDate`, `warrantyExpiry`, `conditionStatus`, `quantity`, `status` (`FUNCTIONAL`, `UNDER_MAINTENANCE`, `DEFECTIVE`, `DECOMMISSIONED`).
6. **Time Slots**:
   - Foundational timetable scheduling slots: `name`, `dayOfWeek` (`MONDAY` to `SUNDAY`), `startTime` (HH:mm), `endTime` (HH:mm), `status`.
   - Validated: `startTime < endTime`. Overlapping slot definitions prevented.

---

## 3. Validation & Business Rules

| Entity | Validation Rules | Error Code |
| :--- | :--- | :--- |
| **ResourceCategory** | `code` & `name` required; `code` must be unique; deletion prevented if child resources exist | 400 Bad Request / 409 Conflict |
| **Resource** | `code`, `name`, `category` required; `code` unique; `capacity >= 1`; deletion prevented if referenced in allocations or timetable entries | 400 Bad Request / 409 Conflict |
| **Classroom** | `building`, `roomNumber`, `capacity` required; `capacity > 0`; room identifier unique within building; parent resource unique | 400 Bad Request / 409 Conflict |
| **Laboratory** | `building`, `roomNumber`, `capacity` required; `capacity > 0`; valid department reference if provided; lab code unique | 400 Bad Request / 404 Not Found / 409 Conflict |
| **Equipment** | Parent resource exists; `serialNumber` required and globally unique; `quantity >= 1` | 400 Bad Request / 409 Conflict |
| **TimeSlot** | `name`, `dayOfWeek`, `startTime`, `endTime` required; `startTime < endTime`; duplicate slot on same day prevented | 400 Bad Request / 409 Conflict |

---

## 4. Status Management & Maintenance Confirmation

- **Resource Statuses**: `AVAILABLE`, `ALLOCATED`, `MAINTENANCE`, `INACTIVE`.
- **Administrative Control**: Admins can toggle between `AVAILABLE`, `MAINTENANCE`, and `INACTIVE`.
  - Setting a resource to `MAINTENANCE` prompts a confirmation dialog explaining that the space or apparatus will be marked unavailable for timetable scheduling and upcoming resource allocations.
  - Toggling parent resource status automatically cascades status to the underlying physical room or apparatus.
- **Equipment Operational Statuses**: `FUNCTIONAL`, `UNDER_MAINTENANCE`, `DEFECTIVE`, `DECOMMISSIONED`.

---

## 5. Dependency Protection (HTTP 409 Conflict)

To protect institutional integrity before future allocation and scheduling modules go live:

- Deleting a **Category** is blocked if `resourceRepository.countByCategoryId(id) > 0`.
- Deleting a **Resource** is blocked if `resourceAllocationRepository.existsByResourceId(id)` or `timetableEntryRepository.existsByResourceId(id)`.
- Deleting a **Classroom** or **Laboratory** is blocked if their backing resource is referenced by timetable entries or allocations.
- Deleting a **TimeSlot** is blocked if `timetableEntryRepository.existsByTimeSlotId(id)` or `resourceAllocationRepository.existsByTimeSlotId(id)`.

---

## 6. Audit Logging Events

All write operations record non-sensitive administrative audit trails using `AuditLog`:

- `RESOURCE_CATEGORY_CREATED` / `RESOURCE_CATEGORY_UPDATED` / `RESOURCE_CATEGORY_STATUS_CHANGED`
- `RESOURCE_CREATED` / `RESOURCE_UPDATED` / `RESOURCE_STATUS_CHANGED`
- `CLASSROOM_CREATED` / `CLASSROOM_UPDATED` / `CLASSROOM_STATUS_CHANGED`
- `LABORATORY_CREATED` / `LABORATORY_UPDATED` / `LABORATORY_STATUS_CHANGED`
- `EQUIPMENT_CREATED` / `EQUIPMENT_UPDATED` / `EQUIPMENT_STATUS_CHANGED`
- `TIME_SLOT_CREATED` / `TIME_SLOT_UPDATED` / `TIME_SLOT_STATUS_CHANGED`

---

## 7. Backend REST API Endpoints

All endpoints are strictly secured with `@PreAuthorize("hasRole('ADMIN')")`:

### Resource Categories

- `GET /api/admin/resource-categories` (Search, status filter, pagination)
- `GET /api/admin/resource-categories/{id}`
- `POST /api/admin/resource-categories`
- `PUT /api/admin/resource-categories/{id}`
- `PATCH /api/admin/resource-categories/{id}/status?status=...`
- `DELETE /api/admin/resource-categories/{id}`

### Academic Resources

- `GET /api/admin/resources` (Search, category, department, status, location, capacity filters, pagination)
- `GET /api/admin/resources/{id}`
- `POST /api/admin/resources`
- `PUT /api/admin/resources/{id}`
- `PATCH /api/admin/resources/{id}/status?status=...`
- `DELETE /api/admin/resources/{id}`

### Classrooms

- `GET /api/admin/classrooms` (Search, building, roomType, status filters, pagination)
- `GET /api/admin/classrooms/{id}`
- `POST /api/admin/classrooms`
- `PUT /api/admin/classrooms/{id}`
- `PATCH /api/admin/classrooms/{id}/status?status=...`
- `DELETE /api/admin/classrooms/{id}`

### Laboratories

- `GET /api/admin/laboratories` (Search, department, building, status filters, pagination)
- `GET /api/admin/laboratories/{id}`
- `POST /api/admin/laboratories`
- `PUT /api/admin/laboratories/{id}`
- `PATCH /api/admin/laboratories/{id}/status?status=...`
- `DELETE /api/admin/laboratories/{id}`

### Equipment

- `GET /api/admin/equipment` (Search, resourceId, status filters, pagination)
- `GET /api/admin/equipment/{id}`
- `POST /api/admin/equipment`
- `PUT /api/admin/equipment/{id}`
- `PATCH /api/admin/equipment/{id}/status?status=...`
- `DELETE /api/admin/equipment/{id}`

### Time Slots

- `GET /api/admin/time-slots` (Search, dayOfWeek, status filters, pagination)
- `GET /api/admin/time-slots/{id}`
- `POST /api/admin/time-slots`
- `PUT /api/admin/time-slots/{id}`
- `PATCH /api/admin/time-slots/{id}/status?status=...`
- `DELETE /api/admin/time-slots/{id}`

### Overview & Reference Data

- `GET /api/admin/resources/overview` (Real database counts: total, available, allocated, maintenance, inactive, classrooms, labs, equipment, time slots, categories)
- `GET /api/admin/resources/reference-data` (Categories, departments, equipment parent resources, statuses, days of week)

---

## 8. Frontend Implementation

- **Location**: Mounted at `/admin/resources` with tab routing and dedicated subpaths:
  - `/admin/resources` (Overview)
  - `/admin/resources/categories`
  - `/admin/resources/list`
  - `/admin/resources/classrooms`
  - `/admin/resources/laboratories`
  - `/admin/resources/equipment`
  - `/admin/resources/time-slots`
- **Zero Fake Data**: All KPI cards, charts, and tables display verified database counts. When empty, distinct contextual empty states invite creation.
- **Design System**: Built on Phase 4 glassmorphic theme with Tailwind CSS, Lucide React icons, and robust responsive layout.
