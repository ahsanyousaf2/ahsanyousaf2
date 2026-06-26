import uuid
import time
import logging
from typing import Dict, Optional, Any
from enum import Enum

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class JobQueueManager:
    def __init__(self):
        self.jobs: Dict[str, Dict[str, Any]] = {}

    def create_job(self, background_type: str = "none") -> str:
        job_id = str(uuid.uuid4())
        self.jobs[job_id] = {
            "id": job_id,
            "status": JobStatus.PENDING,
            "progress": 0.0,
            "created_at": time.time(),
            "background_type": background_type,
            "result_url": None,
            "error": None,
        }
        return job_id

    def update_job(self, job_id: str, **kwargs):
        if job_id in self.jobs:
            self.jobs[job_id].update(kwargs)

    def get_job(self, job_id: str) -> Optional[Dict]:
        return self.jobs.get(job_id)

    def cleanup_old_jobs(self, max_age_hours: int = 1):
        now = time.time()
        to_remove = []
        for job_id, job in self.jobs.items():
            age_hours = (now - job["created_at"]) / 3600
            if age_hours > max_age_hours:
                to_remove.append(job_id)
        for job_id in to_remove:
            del self.jobs[job_id]
