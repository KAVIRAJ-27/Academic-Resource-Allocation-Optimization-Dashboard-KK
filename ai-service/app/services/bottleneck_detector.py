from typing import List, Dict, Any
from collections import Counter

from ..schemas.requests import (
    AllocationHistoryRecord,
    ConflictHistoryRecord,
    HostelHistoryRecord,
    FacultyWorkloadRecord,
)
from ..schemas.responses import BottleneckDto

class BottleneckDetector:
    def detect_bottlenecks(
        self,
        allocations: List[AllocationHistoryRecord],
        conflicts: List[ConflictHistoryRecord],
        hostels: List[HostelHistoryRecord],
        workloads: List[FacultyWorkloadRecord],
    ) -> List[BottleneckDto]:
        """
        Detects structural bottlenecks across academic scheduling, physical assets, and hostels.
        """
        bottlenecks: List[BottleneckDto] = []

        # 1. Conflict Bottlenecks (from Phase 30)
        conflict_res_counts = Counter(
            c.resource_id for c in conflicts if c.resource_id is not None
        )
        res_name_map = {a.resource_id: a.resource_name for a in allocations if a.resource_name}
        for c in conflicts:
            if c.resource_id and c.resource_name:
                res_name_map[c.resource_id] = c.resource_name

        for res_id, count in conflict_res_counts.items():
            if count >= 2:
                name = res_name_map.get(res_id, f"Resource #{res_id}")
                severity = "CRITICAL" if count >= 4 else "HIGH"
                bottlenecks.append(BottleneckDto(
                    id=f"bn-conflict-{res_id}",
                    entity_id=res_id,
                    entity_name=name,
                    category="CONFLICT",
                    severity=severity,
                    conflict_count=count,
                    utilization_pct=90.0,
                    explanation=(
                        f"{name} is a high-contention resource with {count} detected scheduling conflicts. "
                        f"Repeated overlapping requests cause timetable friction."
                    ),
                    recommended_action=(
                        f"Redistribute sections to secondary facilities or enforce time-slot staggering in Phase 31."
                    ),
                ))

        # 2. Overutilized Academic Resources
        res_alloc_counts = Counter(a.resource_id for a in allocations)
        for res_id, alloc_cnt in res_alloc_counts.items():
            if alloc_cnt >= 5 and res_id not in conflict_res_counts:
                name = res_name_map.get(res_id, f"Resource #{res_id}")
                bottlenecks.append(BottleneckDto(
                    id=f"bn-util-{res_id}",
                    entity_id=res_id,
                    entity_name=name,
                    category="ACADEMIC",
                    severity="MEDIUM",
                    conflict_count=0,
                    utilization_pct=88.5,
                    explanation=(
                        f"{name} has sustained heavy booking across {alloc_cnt} active allocation blocks, "
                        f"leaving minimal turnaround time for maintenance."
                    ),
                    recommended_action=(
                        f"Consider shifting elective course sessions to alternative available classrooms."
                    ),
                ))

        # 3. Hostel Residential Saturation
        for h in hostels:
            if h.total_beds > 0:
                occ_pct = (h.occupied_beds / h.total_beds) * 100.0
                if occ_pct >= 90.0:
                    severity = "CRITICAL" if occ_pct >= 98.0 else "HIGH"
                    bottlenecks.append(BottleneckDto(
                        id=f"bn-hostel-{h.hostel_id}",
                        entity_id=h.hostel_id,
                        entity_name=h.hostel_name,
                        category="HOSTEL",
                        severity=severity,
                        conflict_count=0,
                        utilization_pct=round(occ_pct, 1),
                        explanation=(
                            f"{h.hostel_name} is operating near absolute physical capacity ({h.occupied_beds}/{h.total_beds} beds, "
                            f"{occ_pct:.1f}% occupied) with {h.pending_requests} student requisitions waiting."
                        ),
                        recommended_action=(
                            f"Prioritize student allocation into secondary residential blocks with higher availability."
                        ),
                    ))

        # 4. Overloaded Faculty Bottleneck
        for w in workloads:
            if w.workload_status == "OVERLOADED" or w.assigned_hours > w.max_hours:
                bottlenecks.append(BottleneckDto(
                    id=f"bn-workload-{w.faculty_id}",
                    entity_id=w.faculty_id,
                    entity_name=w.faculty_name,
                    category="WORKLOAD",
                    severity="HIGH",
                    conflict_count=0,
                    utilization_pct=round((w.assigned_hours / max(w.max_hours, 1)) * 100.0, 1),
                    explanation=(
                        f"{w.faculty_name} ({w.department_name or 'Faculty'}) is assigned {w.assigned_hours:.1f} teaching hours "
                        f"exceeding the institutional threshold of {w.max_hours:.1f} hours across {w.subject_count} subjects."
                    ),
                    recommended_action=(
                        f"Rebalance course laboratory or tutorial sections to co-instructors in the department."
                    ),
                ))

        return bottlenecks

bottleneck_detector = BottleneckDetector()
