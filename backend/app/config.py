from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

BASE_DIR = Path(__file__).resolve().parent.parent
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

class Settings(BaseSettings):
    # App Mode
    MOCK_MODE: bool = True

    # Server settings
    BACKEND_HOST: str = "127.0.0.1"
    BACKEND_PORT: int = 8080
    DATABASE_URL: str = f"sqlite:///{BASE_DIR / 'automation.db'}"

    # Twitter / X API v2 Credentials
    X_API_KEY: Optional[str] = None
    X_API_SECRET: Optional[str] = None
    X_ACCESS_TOKEN: Optional[str] = None
    X_ACCESS_TOKEN_SECRET: Optional[str] = None
    X_BEARER_TOKEN: Optional[str] = None

    # LinkedIn API Credentials
    LINKEDIN_CLIENT_ID: Optional[str] = None
    LINKEDIN_CLIENT_SECRET: Optional[str] = None
    LINKEDIN_ACCESS_TOKEN: Optional[str] = None
    LINKEDIN_AUTHOR_URN: Optional[str] = None  # e.g., urn:li:person:XXXXXX or urn:li:organization:XXXXXX

    # Google Gemini API
    GEMINI_API_KEY: Optional[str] = None

    model_config = SettingsConfigDict(
        env_file=(BASE_DIR / ".env", BASE_DIR.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
