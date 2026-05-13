from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    postgres_db: str = "library_db"
    postgres_user: str = "dit_user"
    postgres_password: str = "dit_password"
    db_host: str = "db"
    jwt_secret: str = "dit-dev-secret-change-me"
    jwt_expire_minutes: int = 480
    cors_origins: str = "http://localhost:5173,http://localhost:3000"
    default_password: str = "dit123"

    @property
    def database_url(self) -> str:
        return (
            f"postgresql+psycopg://{self.postgres_user}:{self.postgres_password}"
            f"@{self.db_host}:5432/{self.postgres_db}"
        )

    @property
    def cors_origin_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",") if origin.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
