from datetime import datetime
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from typing import Dict, Any, Tuple

from ..models.model_store import model_store
from ..config import settings

def train_hostel_occupancy_model(X: np.ndarray, y: np.ndarray) -> Tuple[RandomForestRegressor, Dict[str, Any]]:
    """
    Trains a RandomForestRegressor model on historical hostel occupancy features.
    """
    records_count = len(X)
    if records_count < settings.MIN_TRAINING_RECORDS:
        raise ValueError(f"Insufficient records for training ({records_count} < {settings.MIN_TRAINING_RECORDS})")

    model = RandomForestRegressor(n_estimators=100, max_depth=6, random_state=42)
    model.fit(X, y)

    preds = model.predict(X)
    mae = float(round(mean_absolute_error(y, preds), 4))
    rmse = float(round(np.sqrt(mean_squared_error(y, preds)), 4))
    r2 = float(round(r2_score(y, preds), 4)) if len(np.unique(y)) > 1 else 1.0

    metadata = {
        "modelName": "hostel-occupancy-v1",
        "algorithm": "RandomForestRegressor",
        "trainedAt": datetime.utcnow().isoformat() + "Z",
        "featureCount": X.shape[1] if hasattr(X, "shape") else 4,
        "trainingRecords": records_count,
        "metrics": {
            "mae": mae,
            "rmse": rmse,
            "r2": r2,
            "records_count": records_count
        }
    }

    model_store.save_model("hostel_occupancy_model", model, metadata)
    return model, metadata
