import pandas as pd
import numpy as np
from typing import Tuple

def extract_demand_features(df_alloc: pd.DataFrame, df_req: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Extracts features for academic demand regression per allocation record:
    Features: [allocated_students, capacity, duration_hours, department_id]
    Target: demand_intensity
    """
    if df_alloc.empty:
        return pd.DataFrame(), pd.Series(dtype=float)
    
    df = df_alloc.copy()
    if "department_id" not in df.columns:
        df["department_id"] = 0
    df["department_id"] = pd.to_numeric(df["department_id"], errors="coerce").fillna(0)
    
    X = df[["allocated_students", "capacity", "duration_hours", "department_id"]].copy()
    pending_factor = len(df_req[df_req["status"] == "PENDING"]) / max(len(df_alloc), 1) if not df_req.empty else 0.0
    y = (df["allocated_students"] / np.maximum(df["capacity"], 1)) * 10.0 + (df["duration_hours"] * 1.5) + (pending_factor * 2.0)
    return X, y

def extract_utilization_features(df_alloc: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Extracts features for resource utilization:
    Features: [allocation_count, total_allocated_students, avg_capacity, total_hours]
    Target: utilization_percentage
    """
    if df_alloc.empty or "resource_id" not in df_alloc.columns:
        return pd.DataFrame(), pd.Series(dtype=float)
    
    grouped = df_alloc.groupby("resource_id").agg(
        allocation_count=("id", "count"),
        total_students=("allocated_students", "sum"),
        capacity=("capacity", "first"),
        total_hours=("duration_hours", "sum")
    ).reset_index()

    # Utilization formula baseline
    grouped["utilization_pct"] = (grouped["total_students"] / (grouped["capacity"] * np.maximum(grouped["allocation_count"], 1))) * 100.0
    grouped["utilization_pct"] = grouped["utilization_pct"].clip(0.0, 100.0)

    X = grouped[["allocation_count", "total_students", "capacity", "total_hours"]].copy()
    y = grouped["utilization_pct"]
    return X, y

def extract_hostel_features(df_hostel: pd.DataFrame) -> Tuple[pd.DataFrame, pd.Series]:
    """
    Extracts features for hostel occupancy regression:
    Features: [total_beds, occupied_beds, available_beds, pending_requests]
    Target: predicted_occupied_beds
    """
    if df_hostel.empty:
        return pd.DataFrame(), pd.Series(dtype=float)
    
    X = df_hostel[["total_beds", "occupied_beds", "available_beds", "pending_requests"]].copy()
    # Target: occupied + expected conversion of pending requests
    y = (df_hostel["occupied_beds"] + (df_hostel["pending_requests"] * 0.75)).clip(upper=df_hostel["total_beds"])
    return X, y
