from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_model_training_and_listing():
    # Synthetic training fixtures for testing purposes only
    X = [[40.0, 60.0, 2.0, 1.0] for _ in range(10)]
    y = [55.0 for _ in range(10)]

    payload = {
        "model_type": "academic-demand",
        "training_data": {"X": X, "y": y}
    }

    res = client.post("/models/train", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert "metadata" in data
    assert data["metadata"]["algorithm"] == "RandomForestRegressor"

    # List models
    list_res = client.get("/models/list")
    assert list_res.status_code == 200
    models = list_res.json()
    assert len(models) >= 1
