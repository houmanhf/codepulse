from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/codepulse"
    REDIS_URL: str = "redis://localhost:6379/0"
    SECRET_KEY: str = "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()