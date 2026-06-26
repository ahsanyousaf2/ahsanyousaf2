import os
import uuid
import aiofiles
import logging
from typing import Optional
from .config import settings

logger = logging.getLogger(__name__)


class TemporaryStorage:
    def __init__(self):
        self.upload_dir = os.path.abspath(settings.UPLOAD_DIR)
        self.output_dir = os.path.abspath(settings.OUTPUT_DIR)
        self.temp_dir = os.path.abspath(settings.TEMP_DIR)
        self._ensure_dirs()

    def _ensure_dirs(self):
        os.makedirs(self.upload_dir, exist_ok=True)
        os.makedirs(self.output_dir, exist_ok=True)
        os.makedirs(self.temp_dir, exist_ok=True)

    async def save_upload(self, file_bytes: bytes, filename: Optional[str] = None) -> str:
        file_id = str(uuid.uuid4())
        ext = filename.split('.')[-1] if filename else "png"
        filepath = os.path.join(self.upload_dir, f"{file_id}.{ext}")
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(file_bytes)
        logger.debug(f"Saved upload: {filepath}")
        return filepath

    async def save_output(self, file_bytes: bytes, job_id: str, suffix: str = "result") -> str:
        filepath = os.path.join(self.output_dir, f"{job_id}_{suffix}.png")
        async with aiofiles.open(filepath, 'wb') as f:
            await f.write(file_bytes)
        logger.debug(f"Saved output: {filepath}")
        return filepath

    def get_output_path(self, job_id: str, suffix: str = "result") -> str:
        return os.path.join(self.output_dir, f"{job_id}_{suffix}.png")

    def cleanup_job(self, job_id: str):
        for f in os.listdir(self.upload_dir):
            if job_id in f:
                os.remove(os.path.join(self.upload_dir, f))
        for f in os.listdir(self.output_dir):
            if job_id in f:
                os.remove(os.path.join(self.output_dir, f))
        logger.debug(f"Cleaned up job: {job_id}")

    async def cleanup_old_files(self, max_age_hours: int = 24):
        import time
        now = time.time()
        for directory in [self.upload_dir, self.output_dir, self.temp_dir]:
            for f in os.listdir(directory):
                filepath = os.path.join(directory, f)
                if os.path.isfile(filepath):
                    age_hours = (now - os.path.getmtime(filepath)) / 3600
                    if age_hours > max_age_hours:
                        os.remove(filepath)
                        logger.debug(f"Removed old file: {filepath}")
