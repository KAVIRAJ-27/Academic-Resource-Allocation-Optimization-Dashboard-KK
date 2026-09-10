from datetime import datetime
import numpy as np
from sklearn.ensemble import IsolationForest
from typing import Dict, Any, Tuple

from ..models.model_store import model_store
from ..config import settings

def train_anomaly_detection_model(X: np.ndarray) -> Tuple[IsolationForest, Dict[str, Any]]:
    """
    Trains an IsolationForest model for unsupervised anomaly detection.
    """
    records_count = len(X)
    if records_count < settings.MIN_TRAINING_RECORDS:
        raise ValueError(f"Insufficient records for training ({records_count} < {settings.MIN_TRAINING_RECORDS})")

    model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
    model.fit(X)

    metadata = {
        "modelName": "anomaly-detection-v1",
        "algorithm": "IsolationForest",
        "trainedAt": datetime.utcnow().isoformat() + "Z",
        "featureCount": X.shape[1] if hasattr(X, "shape") else 3,
        "trainingRecords": records_count,
        "metrics": {
            "records_count": records_count,
            "contamination": 0.1,
            "type": "Unsupervised"
        }
    }

    model_store.save_model("anomaly_model", model, metadata)
    return model, metadata
