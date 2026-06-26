import logging
import numpy as np
import cv2
from typing import Optional, Tuple, List
from io import BytesIO
from PIL import Image

from ..utils.image_utils import (
    create_transparent_png,
    create_transparent_webp,
    apply_background_color,
    apply_background_gradient,
    apply_background_image,
    apply_blur_background,
    edge_refinement,
)
from ..utils.config import settings

logger = logging.getLogger(__name__)


class ImageProcessor:
    def __init__(self):
        self.max_size = settings.MAX_IMAGE_SIZE

    def load_image(self, file_bytes: bytes) -> np.ndarray:
        nparr = np.frombuffer(file_bytes, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        if image is None:
            raise ValueError("Failed to decode image")
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        return image

    def process_result(self, image: np.ndarray, alpha: np.ndarray,
                       output_format: str = "png",
                       preserve_shadows: bool = False,
                       edge_refine: bool = True,
                       background_type: str = "none",
                       background_color: Optional[Tuple[int, int, int]] = None,
                       gradient_colors: Optional[List[Tuple[int, int, int]]] = None,
                       background_image: Optional[np.ndarray] = None,
                       blur_strength: int = 30) -> Tuple[bytes, str]:

        if edge_refine:
            alpha = edge_refinement(alpha, image)

        if background_type == "color" and background_color:
            result = apply_background_color(image, alpha, background_color)
            output_format = "jpg"
        elif background_type == "gradient" and gradient_colors:
            result = apply_background_gradient(image, alpha, gradient_colors)
            output_format = "jpg"
        elif background_type == "image" and background_image is not None:
            result = apply_background_image(image, alpha, background_image)
            output_format = "jpg"
        elif background_type == "blur":
            result = apply_blur_background(image, alpha, blur_strength)
            output_format = "jpg"
        else:
            result = image

        if output_format == "png":
            output_bytes = create_transparent_png(result, alpha)
            mime_type = "image/png"
        elif output_format == "webp":
            output_bytes = create_transparent_webp(result, alpha)
            mime_type = "image/webp"
        else:
            result_rgb = cv2.cvtColor(result, cv2.COLOR_RGB2BGR)
            _, buf = cv2.imencode(f'.{output_format}', result_rgb)
            output_bytes = buf.tobytes()
            mime_type = f"image/{output_format}"

        return output_bytes, mime_type
