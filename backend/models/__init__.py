from .base import BaseBackgroundRemover
from .birefnet import BiRefNetRemover
from .rmbg import RMBGRemover
from .u2net import U2NetRemover
from .isnet import ISNetRemover
from .hybrid import HybridRemover

MODEL_REGISTRY = {
    "birefnet": BiRefNetRemover,
    "rmbg": RMBGRemover,
    "u2net": U2NetRemover,
    "isnet": ISNetRemover,
    "hybrid": HybridRemover,
}

def get_model(model_name: str = "hybrid") -> BaseBackgroundRemover:
    if model_name not in MODEL_REGISTRY:
        raise ValueError(f"Unknown model: {model_name}. Available: {list(MODEL_REGISTRY.keys())}")
    return MODEL_REGISTRY[model_name]()
