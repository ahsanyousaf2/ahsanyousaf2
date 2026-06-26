import logging
import time
from typing import Optional, Dict, Any
import numpy as np
import torch

from ..models import get_model, BaseBackgroundRemover
from ..utils.config import settings

logger = logging.getLogger(__name__)


class ModelManager:
    def __init__(self):
        self.model: Optional[BaseBackgroundRemover] = None
        self.model_name: str = settings.MODEL_NAME
        self.device: str = settings.DEVICE
        self.load_time: Optional[float] = None
        self.total_inferences: int = 0

    async def initialize(self):
        logger.info(f"Initializing model: {self.model_name} on {self.device}")
        start = time.time()
        try:
            self.model = get_model(self.model_name)
            self.model.load_model()
            self.load_time = time.time() - start
            logger.info(f"Model loaded in {self.load_time:.2f}s")
        except Exception as e:
            logger.error(f"Failed to load model on {self.device}: {e}")
            logger.info("Falling back to CPU...")
            self.device = "cpu"
            self.model = get_model(self.model_name)
            self.model.load_model()

    async def remove_background(self, image: np.ndarray, preserve_shadows: bool = False,
                                edge_refine: bool = True) -> Dict[str, Any]:
        if self.model is None:
            raise RuntimeError("Model not initialized")
        start = time.time()
        result_image, alpha = self.model.remove_background(image, preserve_shadows)
        inference_time = time.time() - start
        self.total_inferences += 1
        return {
            "image": result_image,
            "alpha": alpha,
            "inference_time": inference_time,
            "model": self.model.get_name(),
        }

    async def cleanup(self):
        if self.model:
            self.model.cleanup()
        if torch.cuda.is_available():
            torch.cuda.empty_cache()
        logger.info("Model resources cleaned up")

    def get_status(self) -> Dict:
        return {
            "model": self.model.get_name() if self.model else None,
            "device": self.device,
            "loaded": self.model is not None,
            "load_time": self.load_time,
            "total_inferences": self.total_inferences,
            "cuda_available": torch.cuda.is_available(),
            "cuda_device": torch.cuda.get_device_name(0) if torch.cuda.is_available() else None,
        }
