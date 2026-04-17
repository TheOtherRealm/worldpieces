"""World Pieces — Application configuration loaded from environment variables."""
from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache
from dotenv import load_dotenv
import os

# Load .env if it exists, out side of public directory
load_dotenv('../.env')
class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env", env_file_encoding="utf-8", extra="ignore"
    )
    # App
    app_name: str = "World Pieces"
    app_env: str = "development"
    secret_key: str = os.getenv("SECRET_KEY", "change_me_in_production")
    frontend_url: str = os.getenv("FRONTEND_URL", "http://localhost:8100")
    # GitHub OAuth
    github_client_id: str = os.getenv("GITHUB_CLIENT_ID", "")
    github_client_secret: str = os.getenv("GITHUB_CLIENT_SECRET", "")
    github_redirect_uri: str = os.getenv(
        "GITHUB_REDIRECT_URI", "http://localhost:8081/auth/github/callback"
    )
    # GitHub Sponsors GraphQL
    github_sponsors_token: str = os.getenv("GITHUB_SPONSORS_TOKEN", "")
    # Redis — existing server at 10.0.0.90
    redis_host: str = os.getenv("REDIS_HOST", "10.0.0.90")
    redis_port: int = int(os.getenv("REDIS_PORT", "6379"))
    redis_username: str = os.getenv("REDIS_USERNAME", "admin")
    redis_password: str = os.getenv("redis_password", "")
    # JWT
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 1440  # 24 hours
@lru_cache
def get_settings() -> Settings:
    return Settings()