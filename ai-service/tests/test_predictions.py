from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_empty_payload_insufficient_data():
    payload = {"allocations": [], "requests": [], "hostels": []}
    res = client.post("/predict/academic/demand", json=payload)
    assert res.status_code == 200
    assert res.json() == []  # Insufficient data returns empty list

def test_academic_demand_prediction_with_valid_data():
    # 6 allocations to satisfy MIN_TRAINING_RECORDS = 5
    allocations = [
        {"id": i, "resource_id": 101, "resource_name": "Computer Lab 1", "category": "LABORATORY", "allocated_students": 45, "capacity": 60, "duration_hours": 2.0}
        for i in range(1, 8)
    ]
    requests = [
        {"id": 1, "resource_category": "LABORATORY", "status": "PENDING", "requested_capacity": 50},
        {"id": 2, "resource_category": "LABORATORY", "status": "APPROVED", "requested_capacity": 45}
    ]
    payload = {"allocations": allocations, "requests": requests}
    
    res = client.post("/predict/academic/demand", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data) > 0
    item = data[0]
    assert item["resource_category"] == "LABORATORY"
    assert item["predicted_demand"] > 0
    assert "LABORATORY" in item["explanation"] or "laboratory" in item["explanation"].lower()
    assert item["model_version"] is not None

def test_hostel_occupancy_prediction_with_valid_data():
    hostels = [
        {"hostel_id": 1, "hostel_name": "Ganga Hostel", "total_beds": 200, "occupied_beds": 160, "available_beds": 40, "pending_requests": 20},
        {"hostel_id": 2, "hostel_name": "Yamuna Hostel", "total_beds": 150, "occupied_beds": 140, "available_beds": 10, "pending_requests": 25},
        {"hostel_id": 3, "hostel_name": "Kaveri Hostel", "total_beds": 180, "occupied_beds": 90, "available_beds": 90, "pending_requests": 5},
        {"hostel_id": 4, "hostel_name": "Godavari Hostel", "total_beds": 100, "occupied_beds": 80, "available_beds": 20, "pending_requests": 8},
        {"hostel_id": 5, "hostel_name": "Narmada Hostel", "total_beds": 120, "occupied_beds": 110, "available_beds": 10, "pending_requests": 15},
    ]
    payload = {"hostels": hostels}
    res = client.post("/predict/hostel/occupancy", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert len(data) == 5
    for h in data:
        assert 0.0 <= h["predicted_occupancy_pct"] <= 100.0
        assert h["predicted_occupancy"] <= h["total_beds"]
        assert h["expected_available_beds"] >= 0

def test_ai_overview_endpoint():
    allocations = [
        {"id": i, "resource_id": 101, "resource_name": "Lab A", "category": "LABORATORY", "allocated_students": 50, "capacity": 60, "duration_hours": 2.0}
        for i in range(1, 8)
    ]
    hostels = [
        {"hostel_id": i, "hostel_name": f"Hostel {i}", "total_beds": 100, "occupied_beds": 80 + i * 2, "available_beds": 20 - i * 2, "pending_requests": 10}
        for i in range(1, 6)
    ]
    conflicts = [
        {"id": 1, "conflict_code": "DOUBLE_BOOKING", "severity": "CRITICAL", "resource_id": 101, "resource_name": "Lab A"},
        {"id": 2, "conflict_code": "DOUBLE_BOOKING", "severity": "CRITICAL", "resource_id": 101, "resource_name": "Lab A"},
        {"id": 3, "conflict_code": "DOUBLE_BOOKING", "severity": "HIGH", "resource_id": 101, "resource_name": "Lab A"},
    ]
    payload = {"allocations": allocations, "hostels": hostels, "conflicts": conflicts}
    res = client.post("/predict/overview", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["status"] == "SUCCESS"
    assert data["detected_bottlenecks_count"] >= 1
    assert len(data["top_recommendations"]) > 0
