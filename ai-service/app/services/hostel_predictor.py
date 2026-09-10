import logging
import pandas as pd
from typing import List

from ..schemas.requests import HostelHistoryRecord
from ..schemas.responses import HostelOccupancyDto
from ..preprocessing.data_cleaner import clean_hostels_df
from ..preprocessing.feature_engineering import extract_hostel_features
from ..training.train_occupancy_model import train_hostel_occupancy_model
from ..models.model_store import model_store
from ..utils.range_validator import clamp_percentage, validate_hostel_capacity
from ..utils.explainability import explain_hostel_occupancy
from ..config import settings

logger = logging.getLogger(__name__)

class HostelPredictor:
    def predict_occupancy(
        self,
        hostels: List[HostelHistoryRecord],
    ) -> List[HostelOccupancyDto]:
        """
        Forecasts future hostel occupancy and bed availability using ML regression.
        """
        raw_hostels = [h.model_dump() for h in hostels]
        df_hostel = clean_hostels_df(raw_hostels)

        if len(df_hostel) < settings.MIN_TRAINING_RECORDS:
            logger.info(f"Insufficient hostel data for occupancy prediction ({len(df_hostel)} < {settings.MIN_TRAINING_RECORDS})")
            return []

        X, y = extract_hostel_features(df_hostel)
        if X.empty:
            return []

        loaded = model_store.load_model("hostel_occupancy_model")
        if loaded:
            model, meta = loaded
        else:
            model, meta = train_hostel_occupancy_model(X.values, y.values)

        preds = model.predict(X.values)
        model_version = meta.get("modelName", "hostel-occupancy-v1")

        results: List[HostelOccupancyDto] = []

        for idx, row in df_hostel.iterrows():
            hostel_id = int(row["hostel_id"])
            hostel_name = str(row["hostel_name"])
            total_beds = int(row["total_beds"])
            curr_occupied = int(row["occupied_beds"])
            pending_reqs = int(row.get("pending_requests", 0))

            raw_pred_occ = int(round(preds[idx])) if idx < len(preds) else curr_occupied
            pred_occupied, expected_avail = validate_hostel_capacity(raw_pred_occ, total_beds)

            curr_pct = round((curr_occupied / total_beds) * 100.0, 2) if total_beds > 0 else 0.0
            curr_pct, _ = clamp_percentage(curr_pct, f"{hostel_name} current occupancy")

            pred_pct = round((pred_occupied / total_beds) * 100.0, 2) if total_beds > 0 else 0.0
            pred_pct, _ = clamp_percentage(pred_pct, f"{hostel_name} predicted occupancy")

            if pred_occupied > curr_occupied:
                trend = "INCREASING"
            elif pred_occupied < curr_occupied:
                trend = "DECREASING"
            else:
                trend = "STABLE"

            explanation = explain_hostel_occupancy(
                hostel_name, total_beds, curr_occupied, pred_occupied, pending_reqs
            )

            results.append(HostelOccupancyDto(
                hostel_id=hostel_id,
                hostel_name=hostel_name,
                total_beds=total_beds,
                current_occupancy=curr_occupied,
                current_occupancy_pct=curr_pct,
                predicted_occupancy=pred_occupied,
                predicted_occupancy_pct=pred_pct,
                expected_available_beds=expected_avail,
                occupancy_trend=trend,
                explanation=explanation,
                model_version=model_version,
            ))

        return results

hostel_predictor = HostelPredictor()
