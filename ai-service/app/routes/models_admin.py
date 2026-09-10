from fastapi import APIRouter, HTTPException
from typing import Dict, Any, List

from ..schemas.requests import ModelTrainRequest
from ..schemas.responses import ModelEvaluationMetrics, ModelMetadataDto
from ..training.train_demand_model import train_academic_demand_model
from ..training.train_utilization_model import train_resource_utilization_model
from ..training.train_occupancy_model import train_hostel_occupancy_model
from ..training.train_anomaly_model import train_anomaly_detection_model
from ..models.model_store import model_store
import numpy as np

router = APIRouter(prefix="/models", tags=["Model Governance"])

@router.post("/train", response_model=Dict[str, Any])
def train_models(request: ModelTrainRequest) -> Dict[str, Any]:
    """
    Explicit model training endpoint restricted to institutional administrators.
    """
    model_type = request.model_type
    data = request.training_data

    try:
        if model_type == "academic-demand":
            X = np.array(data.get("X", []))
            y = np.array(data.get("y", []))
            _, meta = train_academic_demand_model(X, y)
            return {"status": "SUCCESS", "message": "Academic demand model trained successfully", "metadata": meta}

        elif model_type == "resource-utilization":
            X = np.array(data.get("X", []))
            y = np.array(data.get("y", []))
            _, meta = train_resource_utilization_model(X, y)
            return {"status": "SUCCESS", "message": "Utilization model trained successfully", "metadata": meta}

        elif model_type == "hostel-occupancy":
            X = np.array(data.get("X", []))
            y = np.array(data.get("y", []))
            _, meta = train_hostel_occupancy_model(X, y)
            return {"status": "SUCCESS", "message": "Hostel occupancy model trained successfully", "metadata": meta}

        elif model_type == "anomaly":
            X = np.array(data.get("X", []))
            _, meta = train_anomaly_detection_model(X)
            return {"status": "SUCCESS", "message": "Anomaly model trained successfully", "metadata": meta}

        else:
            raise HTTPException(status_code=400, detail=f"Unsupported model type: {model_type}")

    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")

@router.get("/metadata/{model_name}")
def get_model_metadata(model_name: str) -> Dict[str, Any]:
    meta = model_store.get_metadata(model_name)
    if not meta:
        raise HTTPException(status_code=404, detail=f"Metadata for model '{model_name}' not found")
    return meta

@router.get("/list")
def list_models() -> List[Dict[str, Any]]:
    models = ["academic_demand_model", "utilization_model", "hostel_occupancy_model", "anomaly_model"]
    results = []
    for m in models:
        meta = model_store.get_metadata(m)
        if meta:
            results.append(meta)
    return results
