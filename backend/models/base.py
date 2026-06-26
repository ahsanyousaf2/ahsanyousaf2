from abc import ABC, abstractmethod
import numpy as np
from typing import Tuple


class BaseBackgroundRemover(ABC):
    @abstractmethod
    def load_model(self):
        pass

    @abstractmethod
    def remove_background(self, image: np.ndarray, preserve_shadows: bool = False) -> Tuple[np.ndarray, np.ndarray]:
        pass

    @abstractmethod
    def get_name(self) -> str:
        pass

    def cleanup(self):
        pass
