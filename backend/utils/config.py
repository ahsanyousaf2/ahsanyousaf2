from pydantic_settings import BaseSettings
from typing import List, Optional
import os


class Settings(BaseSettings):
    APP_NAME: str = "RemoveAnything AI"
    DEBUG: bool = False
    API_V1_PREFIX: str = "/api/v1"
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "https://app.removeanything.ai"]

    MODEL_NAME: str = "birefnet_rmbg"
    MODEL_CACHE_DIR: str = "models/cache"
    DEVICE: str = "cuda" if os.environ.get("CUDA_VISIBLE_DEVICES") else "cpu"
    USE_ONNX: bool = True
    ONNX_PROVIDERS: List[str] = ["CUDAExecutionProvider", "CPUExecutionProvider"]

    MAX_IMAGE_SIZE: int = 4096
    MAX_FILE_SIZE: int = 20 * 1024 * 1024
    ALLOWED_EXTENSIONS: set = {"jpg", "jpeg", "png", "webp"}
    UPLOAD_DIR: str = "uploads"
    OUTPUT_DIR: str = "outputs"
    TEMP_DIR: str = "tmp"

    QUEUE_REDIS_URL: str = "redis://localhost:6379/0"
    QUEUE_MAX_JOBS: int = 100
    JOB_TIMEOUT: int = 300

    RATE_LIMIT_PER_MINUTE: int = 60
    MAX_BATCH_SIZE: int = 20

    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "{time:YYYY-MM-DD HH:mm:ss} | {level:<7} | {name}:{function}:{line} | {message}"

    SENTRY_DSN: Optional[str] = None

    class Config:
        env_file = ".env"


settings = Settings()
