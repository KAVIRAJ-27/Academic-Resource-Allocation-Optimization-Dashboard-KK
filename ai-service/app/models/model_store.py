import json
import logging
from pathlib import Path
from typing import Optional, Dict, Any
import joblib

from ..config import settings

logger = logging.getLogger(__name__)

class ModelStore:
    def __init__(self, storage_dir: Optional[Path] = None):
        self.storage_dir = storage_dir or settings.MODEL_STORAGE_DIR
        self.storage_dir.mkdir(parents=True, exist_ok=True)
        self._memory_cache: Dict[str, Any] = {}

    def _get_model_path(self, model_name: str) -> Path:
        return self.storage_dir / f"{model_name}.joblib"

    def _get_meta_path(self, model_name: str) -> Path:
        return self.storage_dir / f"{model_name}_metadata.json"

    def save_model(self, model_name: str, model_object: Any, metadata: Dict[str, Any]) -> None:
        model_path = self._get_model_path(model_name)
        meta_path = self._get_meta_path(model_name)

        joblib.dump(model_object, model_path)
        with open(meta_path, "w", encoding="utf-8") as f:
            json.dump(metadata, f, indent=2)

        self._memory_cache[model_name] = (model_object, metadata)
        logger.info(f"Model '{model_name}' successfully saved to {model_path}")

    def load_model(self, model_name: str) -> Optional[tuple]:
        if model_name in self._memory_cache:
            return self._memory_cache[model_name]

        model_path = self._get_model_path(model_name)
        meta_path = self._get_meta_path(model_name)

        if not model_path.exists() or not meta_path.exists():
            return None

        try:
            model = joblib.load(model_path)
            with open(meta_path, "r", encoding="utf-8") as f:
                metadata = json.load(f)
            self._memory_cache[model_name] = (model, metadata)
            return model, metadata
        except Exception as e:
            logger.error(f"Error loading model '{model_name}': {e}")
            return None

    def model_exists(self, model_name: str) -> bool:
        return self._get_model_path(model_name).exists() and self._get_meta_path(model_name).exists()

    def get_metadata(self, model_name: str) -> Optional[Dict[str, Any]]:
        meta_path = self._get_meta_path(model_name)
        if not meta_path.exists():
            return None
        with open(meta_path, "r", encoding="utf-8") as f:
            return json.load(f)

model_store = ModelStore()
