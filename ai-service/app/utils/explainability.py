def explain_academic_demand(
    category: str,
    current_demand: int,
    predicted_demand: int,
    request_growth_pct: float,
    available_units: int,
) -> str:
    """
    Builds data-grounded rationale for academic demand forecast.
    """
    diff = predicted_demand - current_demand
    direction = "increase" if diff > 0 else "decrease" if diff < 0 else "remain stable"
    
    if diff == 0:
        return (
            f"Demand for {category.lower()} is projected to remain consistent with historical patterns "
            f"at approximately {predicted_demand} requisitions."
        )
    return (
        f"Demand for {category.lower()} is projected to {direction} by {abs(diff)} requisitions "
        f"({abs(request_growth_pct):.1f}% change) based on past requisition trends across departments, "
        f"compared against current inventory of {available_units} units."
    )

def explain_utilization(
    resource_name: str,
    current_util: float,
    predicted_util: float,
    allocation_count: int,
) -> str:
    """
    Builds data-grounded rationale for resource utilization forecast.
    """
    delta = predicted_util - current_util
    if abs(delta) < 1.0:
        return (
            f"{resource_name} is projected to maintain its current utilization level of ~{current_util:.1f}% "
            f"based on ongoing schedule allocations."
        )
    direction = "rise" if delta > 0 else "decline"
    return (
        f"{resource_name} utilization is projected to {direction} from {current_util:.1f}% to {predicted_util:.1f}% "
        f"based on {allocation_count} recorded schedule slots and departmental curriculum requirements."
    )

def explain_hostel_occupancy(
    hostel_name: str,
    total_beds: int,
    current_occupied: int,
    predicted_occupied: int,
    pending_requests: int,
) -> str:
    """
    Builds data-grounded rationale for hostel occupancy forecast.
    """
    net_change = predicted_occupied - current_occupied
    if net_change > 0:
        return (
            f"{hostel_name} occupancy is forecasted to grow by {net_change} beds "
            f"(to {predicted_occupied}/{total_beds} total beds) driven by {pending_requests} pending student requisitions "
            f"and historical residential admission cycles."
        )
    elif net_change < 0:
        return (
            f"{hostel_name} occupancy is forecasted to decrease by {abs(net_change)} beds "
            f"reflecting completion of academic terms and anticipated vacancies."
        )
    return (
        f"{hostel_name} occupancy is projected to remain steady at {current_occupied} occupied beds "
        f"out of {total_beds} total beds."
    )
