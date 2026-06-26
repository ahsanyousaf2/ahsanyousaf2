import numpy as np
import cv2
import logging
from typing import Tuple

from .base import BaseBackgroundRemover
from .birefnet import BiRefNetRemover
from .rmbg import RMBGRemover
from .u2net import U2NetRemover
from .isnet import ISNetRemover
from ..utils.config import settings
from ..utils.image_utils import edge_refinement

logger = logging.getLogger(__name__)


class HybridRemover(BaseBackgroundRemover):
    def __init__(self):
        self.models = {
            "birefnet": BiRefNetRemover(),
            "rmbg": RMBGRemover(),
            "u2net": U2NetRemover(),
            "isnet": ISNetRemover(),
        }
        self.active_models = ["birefnet", "rmbg"]
        self.loaded = False

    def load_model(self):
        for name in self.active_models:
            try:
                self.models[name].load_model()
                logger.info(f"Loaded model: {name}")
            except Exception as e:
                logger.warning(f"Failed to load {name}: {e}")
        self.loaded = True

    def get_name(self) -> str:
        return "Hybrid(BiRefNet+RMBG)"

    def remove_background(self, image: np.ndarray, preserve_shadows: bool = False) -> Tuple[np.ndarray, np.ndarray]:
        alphas = []
        for name in self.active_models:
            try:
                _, alpha = self.models[name].remove_background(image, preserve_shadows)
                alphas.append(alpha)
            except Exception as e:
                logger.error(f"Model {name} failed: {e}")

        if not alphas:
            raise RuntimeError("All models failed to process image")

        if len(alphas) == 1:
            combined_alpha = alphas[0]
        else:
            combined_alpha = np.mean(alphas, axis=0)

        if len(alphas) > 1:
            weights = []
            for alpha in alphas:
                grad_x = cv2.Sobel(alpha, cv2.CV_32F, 1, 0, ksize=3)
                grad_y = cv2.Sobel(alpha, cv2.CV_32F, 0, 1, ksize=3)
                edge_strength = np.sqrt(grad_x ** 2 + grad_y ** 2).mean()
                weights.append(edge_strength)
            weights = np.array(weights)
            weights = weights / (weights.sum() + 1e-8)
            combined_alpha = np.average(alphas, axis=0, weights=weights)

        combined_alpha = edge_refinement(combined_alpha, image)

        return image, combined_alpha
