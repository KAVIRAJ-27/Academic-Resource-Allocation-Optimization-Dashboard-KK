from fastapi import APIRouter
from ..schemas.responses import HealthResponse

router = APIRouter(tags=["Health"])

@router.get("/health", response_model=HealthResponse)
def get_health() -> HealthResponse:
    """
    Healthcheck endpoint to verify AI microservice availability.
    """
    return HealthResponse(status="UP", app_name="AHRAO-AI-Service", version="1.0.0")
