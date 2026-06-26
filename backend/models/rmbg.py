import numpy as np
import cv2
import logging
from typing import Tuple
import torch
import torch.nn as nn

from .base import BaseBackgroundRemover
from ..utils.config import settings

logger = logging.getLogger(__name__)


class RMBGBlock(nn.Module):
    def __init__(self, in_ch, out_ch, stride=1):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, 3, stride=stride, padding=1, bias=False)
        self.bn = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class RMBGNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.encoder = nn.Sequential(
            RMBGBlock(3, 64, stride=2),
            RMBGBlock(64, 128, stride=2),
            RMBGBlock(128, 256, stride=2),
            RMBGBlock(256, 512, stride=2),
        )
        self.decoder = nn.Sequential(
            nn.ConvTranspose2d(512, 256, 2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(256, 128, 2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(128, 64, 2, stride=2),
            nn.ReLU(inplace=True),
            nn.ConvTranspose2d(64, 32, 2, stride=2),
            nn.ReLU(inplace=True),
            nn.Conv2d(32, 1, 1),
            nn.Sigmoid(),
        )

    def forward(self, x):
        x = self.encoder(x)
        x = self.decoder(x)
        return x


class RMBGRemover(BaseBackgroundRemover):
    def __init__(self):
        self.device = torch.device(settings.DEVICE if torch.cuda.is_available() else "cpu")
        self.model = None
        self.input_size = (1024, 1024)

    def load_model(self):
        try:
            self.model = RMBGNet().to(self.device)
            self.model.eval()
            logger.info(f"RMBG-2.0 model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load RMBG-2.0: {e}")
            raise

    def get_name(self) -> str:
        return "RMBG-2.0"

    def remove_background(self, image: np.ndarray, preserve_shadows: bool = False) -> Tuple[np.ndarray, np.ndarray]:
        original_size = (image.shape[1], image.shape[0])
        h, w = image.shape[:2]
        scale = min(self.input_size[0] / w, self.input_size[1] / h)
        if scale < 1.0:
            new_w, new_h = int(w * scale), int(h * scale)
            resized = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
        else:
            resized = image.copy()

        input_tensor = torch.from_numpy(resized.transpose(2, 0, 1).astype(np.float32) / 255.0).unsqueeze(0).to(self.device)

        with torch.no_grad():
            alpha = self.model(input_tensor)

        alpha = alpha.squeeze().cpu().numpy()
        alpha = cv2.resize(alpha, original_size, interpolation=cv2.INTER_LINEAR)
        alpha = np.clip(alpha, 0, 1)

        if preserve_shadows:
            gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)
            shadow_map = (gray < 60).astype(np.float32)
            shadow_map = cv2.GaussianBlur(shadow_map, (21, 21), 0)
            alpha = np.maximum(alpha, shadow_map * 0.3)

        return image, alpha
