import os
import json
from typing import List
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "MelodyForge API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = os.getenv("API_PREFIX", "/api")
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./melodyforge.db")
    
    @property
    def cors_origins(self) -> List[str]:
        raw_origins = os.getenv("CORS_ORIGINS", '["http://localhost:5173", "http://127.0.0.1:5173"]')
        try:
            return json.loads(raw_origins)
        except Exception:
            return ["http://localhost:5173", "http://127.0.0.1:5173"]

settings = Settings()
