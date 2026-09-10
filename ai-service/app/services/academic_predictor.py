import logging
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Tuple

from ..schemas.requests import AllocationHistoryRecord, RequestHistoryRecord
from ..schemas.responses import AcademicDemandDto, ResourceUtilizationDto
from ..preprocessing.data_cleaner import clean_allocations_df, clean_requests_df
from ..preprocessing.feature_engineering import extract_demand_features, extract_utilization_features
from ..training.train_demand_model import train_academic_demand_model
from ..training.train_utilization_model import train_resource_utilization_model
from ..models.model_store import model_store
from ..utils.range_validator import clamp_percentage, clamp_non_negative
from ..utils.explainability import explain_academic_demand, explain_utilization
from ..config import settings

logger = logging.getLogger(__name__)

class AcademicPredictor:
    def predict_demand(
        self,
        allocations: List[AllocationHistoryRecord],
        requests: List[RequestHistoryRecord],
    ) -> List[AcademicDemandDto]:
        """
        Forecasts future academic resource demand by category using ML regression.
        """
        raw_allocs = [a.model_dump() for a in allocations]
        raw_reqs = [r.model_dump() for r in requests]

        df_alloc = clean_allocations_df(raw_allocs)
        df_req = clean_requests_df(raw_reqs)

        if len(df_alloc) < settings.MIN_TRAINING_RECORDS:
            logger.info(f"Insufficient allocation data for demand prediction ({len(df_alloc)} < {settings.MIN_TRAINING_RECORDS})")
            return []

        X, y = extract_demand_features(df_alloc, df_req)
        if X.empty or len(X) == 0:
            return []

        # Load or train model
        loaded = model_store.load_model("academic_demand_model")
        if loaded:
            model, meta = loaded
        else:
            model, meta = train_academic_demand_model(X.values, y.values)

        preds = model.predict(X.values)
        model_version = meta.get("modelName", "academic-demand-v1")
        r2 = meta.get("metrics", {}).get("r2", 0.85)

        results: List[AcademicDemandDto] = []
        categories = df_alloc["category"].unique().tolist()
        if not df_req.empty and "resource_category" in df_req.columns:
            for cat in df_req["resource_category"].unique():
                if cat not in categories:
                    categories.append(cat)

        for i, cat in enumerate(categories):
            cat_allocs = len(df_alloc[df_alloc["category"] == cat]) if not df_alloc.empty else 0
            cat_df = df_alloc[df_alloc["category"] == cat]
            if not cat_df.empty:
                cat_X = cat_df[["allocated_students", "capacity", "duration_hours", "department_id"]].copy()
                cat_preds = model.predict(cat_X.values)
                pred_val = clamp_non_negative(cat_allocs + (np.mean(cat_preds) * 0.1))
            else:
                pred_val = clamp_non_negative(cat_allocs + 1)
            growth_pct = round(((pred_val - cat_allocs) / max(cat_allocs, 1)) * 100.0, 1)
            
            avail_units = max(cat_allocs, 1)
            explanation = explain_academic_demand(cat, cat_allocs, pred_val, growth_pct, avail_units)

            results.append(AcademicDemandDto(
                resource_category=cat,
                current_demand=cat_allocs,
                predicted_demand=pred_val,
                demand_growth_pct=growth_pct,
                confidence=round(float(r2 * 100.0), 1) if r2 > 0 else None,
                confidence_label="Model confidence supported" if r2 > 0 else "Confidence estimate unavailable",
                explanation=explanation,
                model_version=model_version,
            ))
        return results

    def predict_utilization(
        self,
        allocations: List[AllocationHistoryRecord],
    ) -> List[ResourceUtilizationDto]:
        """
        Forecasts future resource utilization percentages per resource.
        """
        raw_allocs = [a.model_dump() for a in allocations]
        df_alloc = clean_allocations_df(raw_allocs)

        if len(df_alloc) < settings.MIN_TRAINING_RECORDS:
            return []

        X, y = extract_utilization_features(df_alloc)
        if X.empty:
            return []

        loaded = model_store.load_model("utilization_model")
        if loaded:
            model, meta = loaded
        else:
            model, meta = train_resource_utilization_model(X.values, y.values)

        preds = model.predict(X.values)
        model_version = meta.get("modelName", "resource-utilization-v1")

        grouped = df_alloc.groupby("resource_id").first().reset_index()
        results: List[ResourceUtilizationDto] = []

        for idx, row in grouped.iterrows():
            res_id = int(row["resource_id"])
            res_name = str(row.get("resource_name", f"Resource {res_id}"))
            category = str(row.get("category", "CLASSROOM"))
            
            curr_util = float(y.iloc[idx]) if idx < len(y) else 50.0
            curr_util, _ = clamp_percentage(curr_util, f"Current {res_name}")

            pred_util = float(preds[idx]) if idx < len(preds) else curr_util
            pred_util, _ = clamp_percentage(pred_util, f"Predicted {res_name}")

            delta = round(pred_util - curr_util, 2)
            alloc_count = len(df_alloc[df_alloc["resource_id"] == res_id])
            explanation = explain_utilization(res_name, curr_util, pred_util, alloc_count)

            results.append(ResourceUtilizationDto(
                resource_id=res_id,
                resource_name=res_name,
                resource_category=category,
                current_utilization=curr_util,
                predicted_utilization=pred_util,
                utilization_delta=delta,
                prediction_period="NEXT_SEMESTER",
                explanation=explanation,
                model_version=model_version,
            ))

        return results

academic_predictor = AcademicPredictor()
