import os
from pathlib import Path
from typing import List

class Settings:
    APP_NAME: str = "AHRAO-AI-Service"
    VERSION: str = "1.0.0"
    HOST: str = os.getenv("AI_SERVICE_HOST", "0.0.0.0")
    PORT: int = int(os.getenv("AI_SERVICE_PORT", "8000"))
    
    # Model storage path
    BASE_DIR: Path = Path(__file__).resolve().parent.parent
    MODEL_STORAGE_DIR: Path = BASE_DIR / "saved_models"
    
    # Minimum historical data required to train or infer with high confidence
    MIN_TRAINING_RECORDS: int = int(os.getenv("MIN_TRAINING_RECORDS", "5"))
    
    # CORS
    CORS_ORIGINS: List[str] = [
        "http://localhost:8080",
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:8080",
        "http://127.0.0.1:5173",
    ]

settings = Settings()
settings.MODEL_STORAGE_DIR.mkdir(parents=True, exist_ok=True)
