from typing import List
from ..schemas.responses import (
    AcademicDemandDto,
    ResourceShortageDto,
    HostelOccupancyDto,
    HostelShortageDto,
)
from ..schemas.requests import AllocationHistoryRecord, HostelHistoryRecord
from ..preprocessing.data_cleaner import clean_allocations_df

class ShortageDetector:
    def detect_academic_shortages(
        self,
        demand_predictions: List[AcademicDemandDto],
        allocations: List[AllocationHistoryRecord],
    ) -> List[ResourceShortageDto]:
        """
        Calculates resource shortage risk by comparing available inventory against predicted demand.
        """
        raw_allocs = [a.model_dump() for a in allocations]
        df_alloc = clean_allocations_df(raw_allocs)

        results: List[ResourceShortageDto] = []

        for item in demand_predictions:
            cat = item.resource_category
            # Count distinct active resources in this category
            if not df_alloc.empty and "category" in df_alloc.columns:
                cat_df = df_alloc[df_alloc["category"] == cat]
                distinct_resources = cat_df["resource_id"].nunique()
            else:
                distinct_resources = 1

            avail = max(distinct_resources, 1)
            pred_demand = item.predicted_demand
            shortage = max(0, pred_demand - avail)

            ratio = pred_demand / avail if avail > 0 else 2.0
            if shortage > 0 and ratio >= 1.5:
                risk = "HIGH_RISK"
                explanation = (
                    f"Critical shortage anticipated for {cat.lower()}: expected demand of {pred_demand} "
                    f"substantially exceeds the active inventory of {avail} units (deficit of {shortage})."
                )
            elif shortage > 0:
                risk = "MEDIUM_RISK"
                explanation = (
                    f"Moderate capacity strain anticipated for {cat.lower()}: expected demand of {pred_demand} "
                    f"exceeds current capacity of {avail} by {shortage} units."
                )
            else:
                risk = "LOW_RISK"
                explanation = (
                    f"{cat} capacity is currently sufficient to satisfy the projected demand of {pred_demand} units."
                )

            results.append(ResourceShortageDto(
                resource_category=cat,
                available_units=avail,
                predicted_demand=pred_demand,
                potential_shortage=shortage,
                risk_level=risk,
                explanation=explanation,
            ))

        return results

    def detect_hostel_shortages(
        self,
        hostel_predictions: List[HostelOccupancyDto],
        hostel_records: List[HostelHistoryRecord],
    ) -> List[HostelShortageDto]:
        """
        Identifies hostels at risk of bed shortages based on predicted occupancy vs capacity.
        """
        hostel_map = {h.hostel_id: h for h in hostel_records}
        results: List[HostelShortageDto] = []

        for pred in hostel_predictions:
            record = hostel_map.get(pred.hostel_id)
            pending_reqs = record.pending_requests if record else 0
            avail_beds = pred.expected_available_beds

            deficit = max(0, pending_reqs - avail_beds)
            occ_pct = pred.predicted_occupancy_pct

            if occ_pct >= 95.0 or (deficit > 5):
                risk = "HIGH_RISK"
                explanation = (
                    f"Severe bed deficit anticipated at {pred.hostel_name}: predicted occupancy is at {occ_pct:.1f}% "
                    f"with {pending_reqs} pending applications against only {avail_beds} vacant beds."
                )
            elif occ_pct >= 85.0 or deficit > 0:
                risk = "MEDIUM_RISK"
                explanation = (
                    f"Tight residential margin at {pred.hostel_name}: predicted occupancy reaches {occ_pct:.1f}%. "
                    f"Expected available beds ({avail_beds}) barely cover incoming requisitions ({pending_reqs})."
                )
            else:
                risk = "LOW_RISK"
                explanation = (
                    f"{pred.hostel_name} maintains healthy bed availability with {avail_beds} projected vacancies."
                )

            results.append(HostelShortageDto(
                hostel_id=pred.hostel_id,
                hostel_name=pred.hostel_name,
                total_active_beds=pred.total_beds,
                available_beds=avail_beds,
                predicted_demand=pending_reqs,
                expected_shortage=deficit,
                risk_level=risk,
                explanation=explanation,
            ))

        return results

shortage_detector = ShortageDetector()
