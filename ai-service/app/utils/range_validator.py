import logging
from typing import Tuple

logger = logging.getLogger(__name__)

def clamp_percentage(value: float, metric_name: str = "Metric") -> Tuple[float, bool]:
    """
    Clamps a percentage value between 0.0 and 100.0.
    Returns (clamped_value, was_clamped).
    """
    if value < 0.0:
        logger.warning(f"Model generated negative percentage for {metric_name}: {value}. Clamping to 0.0.")
        return 0.0, True
    elif value > 100.0:
        logger.warning(f"Model generated percentage > 100 for {metric_name}: {value}. Clamping to 100.0.")
        return 100.0, True
    return round(value, 2), False

def clamp_non_negative(value: float, metric_name: str = "Quantity") -> int:
    """
    Ensures non-negative integer quantities.
    """
    if value < 0:
        logger.warning(f"Model generated negative value for {metric_name}: {value}. Clamping to 0.")
        return 0
    return int(round(value))

def validate_hostel_capacity(occupied: int, total_beds: int) -> Tuple[int, int]:
    """
    Ensures predicted occupied beds does not exceed physical capacity.
    Returns (adjusted_occupied, available_beds).
    """
    if total_beds <= 0:
        return 0, 0
    safe_occupied = min(max(0, occupied), total_beds)
    safe_available = max(0, total_beds - safe_occupied)
    return safe_occupied, safe_available
