import logging
import time
from typing import Optional, Dict, Any
import numpy as np
from PIL import Image
from io import BytesIO

from rembg import remove, new_session

logger = logging.getLogger(__name__)


class ModelManager:
    def __init__(self):
        self.session = None
        self.model_name: str = "u2net"
        self.load_time: Optional[float] = None
        self.total_inferences: int = 0

    async def initialize(self):
        logger.info(f"Initializing rembg with model: {self.model_name}")
        start = time.time()
        try:
            self.session = new_session(self.model_name)
            self.load_time = time.time() - start
            logger.info(f"Model loaded in {self.load_time:.2f}s")
        except Exception as e:
            logger.error(f"Failed to load model: {e}")
            raise

    async def remove_background(self, image: np.ndarray, preserve_shadows: bool = False,
                                edge_refine: bool = True) -> Dict[str, Any]:
        if self.session is None:
            raise RuntimeError("Model not initialized")
        start = time.time()

        img = Image.fromarray(image)
        result = remove(img, session=self.session)

        result_np = np.array(result.convert("RGB"))
        alpha = np.array(result.split()[-1], dtype=np.float32) / 255.0

        inference_time = time.time() - start
        self.total_inferences += 1

        return {
            "image": result_np,
            "alpha": alpha,
            "inference_time": inference_time,
            "model": self.model_name,
        }

    async def cleanup(self):
        self.session = None
        logger.info("Model resources cleaned up")

    def get_status(self) -> Dict:
        return {
            "model": self.model_name,
            "loaded": self.session is not None,
            "load_time": self.load_time,
            "total_inferences": self.total_inferences,
        }
