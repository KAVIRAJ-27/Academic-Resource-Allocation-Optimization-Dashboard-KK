import pandas as pd
import numpy as np
from typing import List, Dict, Any

def clean_allocations_df(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw allocation records into a cleaned pandas DataFrame.
    """
    if not records:
        return pd.DataFrame()
    df = pd.DataFrame(records)
    if "category" in df.columns:
        df["category"] = df["category"].fillna("CLASSROOM").str.upper().str.strip()
    if "allocated_students" in df.columns:
        df["allocated_students"] = pd.to_numeric(df["allocated_students"], errors="coerce").fillna(0)
    if "capacity" in df.columns:
        df["capacity"] = pd.to_numeric(df["capacity"], errors="coerce").fillna(60)
        df["capacity"] = df["capacity"].replace(0, 60)
    if "duration_hours" in df.columns:
        df["duration_hours"] = pd.to_numeric(df["duration_hours"], errors="coerce").fillna(1.0)
    if "resource_id" in df.columns:
        df["resource_id"] = pd.to_numeric(df["resource_id"], errors="coerce").fillna(0).astype(int)
    return df

def clean_requests_df(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw request records into a cleaned pandas DataFrame.
    """
    if not records:
        return pd.DataFrame()
    df = pd.DataFrame(records)
    if "resource_category" in df.columns:
        df["resource_category"] = df["resource_category"].fillna("CLASSROOM").str.upper().str.strip()
    if "status" in df.columns:
        df["status"] = df["status"].fillna("PENDING").str.upper().str.strip()
    if "requested_capacity" in df.columns:
        df["requested_capacity"] = pd.to_numeric(df["requested_capacity"], errors="coerce").fillna(40)
    return df

def clean_hostels_df(records: List[Dict[str, Any]]) -> pd.DataFrame:
    """
    Transforms raw hostel records into a cleaned pandas DataFrame.
    """
    if not records:
        return pd.DataFrame()
    df = pd.DataFrame(records)
    num_cols = ["total_beds", "occupied_beds", "available_beds", "pending_requests", "complaint_count"]
    for col in num_cols:
        if col in df.columns:
            df[col] = pd.to_numeric(df[col], errors="coerce").fillna(0).astype(int)
    return df
