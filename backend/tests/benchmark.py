"""Performance benchmarks for background removal.

Usage: python -m tests.benchmark
"""
import time
import numpy as np
import cv2
from PIL import Image
import io
import logging
from models import get_model

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def create_test_image(width: int, height: int) -> np.ndarray:
    img = np.random.randint(0, 256, (height, width, 3), dtype=np.uint8)
    return img


def benchmark_model(model_name: str, sizes: list = [(512, 512), (1024, 1024), (2048, 2048)], runs: int = 3):
    logger.info(f"\n=== Benchmarking {model_name} ===")
    
    try:
        model = get_model(model_name)
        model.load_model()
    except Exception as e:
        logger.error(f"Failed to load {model_name}: {e}")
        return

    for w, h in sizes:
        times = []
        for _ in range(runs):
            image = create_test_image(w, h)
            start = time.time()
            result_image, alpha = model.remove_background(image)
            elapsed = time.time() - start
            times.append(elapsed)
        
        avg = np.mean(times)
        logger.info(f"  {w}x{h}: avg={avg:.3f}s, min={min(times):.3f}s, max={max(times):.3f}s")


if __name__ == "__main__":
    benchmark_model("hybrid", sizes=[(512, 512), (1024, 1024)])
    benchmark_model("birefnet", sizes=[(512, 512), (1024, 1024)])
    benchmark_model("rmbg", sizes=[(512, 512), (1024, 1024)])
