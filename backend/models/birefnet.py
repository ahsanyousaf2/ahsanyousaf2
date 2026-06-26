import numpy as np
import cv2
import logging
from typing import Tuple
import torch
import torch.nn as nn

from .base import BaseBackgroundRemover
from ..utils.config import settings

logger = logging.getLogger(__name__)


class BiRefNetBlock(nn.Module):
    def __init__(self, in_ch, out_ch):
        super().__init__()
        self.conv1 = nn.Conv2d(in_ch, out_ch, 3, padding=1)
        self.bn1 = nn.BatchNorm2d(out_ch)
        self.conv2 = nn.Conv2d(out_ch, out_ch, 3, padding=1)
        self.bn2 = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        x = self.relu(self.bn1(self.conv1(x)))
        x = self.relu(self.bn2(self.conv2(x)))
        return x


class BiRefNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1 = BiRefNetBlock(3, 64)
        self.pool1 = nn.MaxPool2d(2)
        self.enc2 = BiRefNetBlock(64, 128)
        self.pool2 = nn.MaxPool2d(2)
        self.enc3 = BiRefNetBlock(128, 256)
        self.pool3 = nn.MaxPool2d(2)
        self.enc4 = BiRefNetBlock(256, 512)
        self.pool4 = nn.MaxPool2d(2)

        self.bridge = BiRefNetBlock(512, 1024)

        self.up4 = nn.ConvTranspose2d(1024, 512, 2, stride=2)
        self.dec4 = BiRefNetBlock(1024, 512)
        self.up3 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec3 = BiRefNetBlock(512, 256)
        self.up2 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec2 = BiRefNetBlock(256, 128)
        self.up1 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec1 = BiRefNetBlock(128, 64)

        self.out = nn.Conv2d(64, 1, 1)

    def forward(self, x):
        e1 = self.enc1(x)
        e2 = self.enc2(self.pool1(e1))
        e3 = self.enc3(self.pool2(e2))
        e4 = self.enc4(self.pool3(e3))
        b = self.bridge(self.pool4(e4))
        d4 = self.up4(b)
        d4 = torch.cat([d4, e4], dim=1)
        d4 = self.dec4(d4)
        d3 = self.up3(d4)
        d3 = torch.cat([d3, e3], dim=1)
        d3 = self.dec3(d3)
        d2 = self.up2(d3)
        d2 = torch.cat([d2, e2], dim=1)
        d2 = self.dec2(d2)
        d1 = self.up1(d2)
        d1 = torch.cat([d1, e1], dim=1)
        d1 = self.dec1(d1)
        return torch.sigmoid(self.out(d1))


class BiRefNetRemover(BaseBackgroundRemover):
    def __init__(self):
        self.device = torch.device(settings.DEVICE if torch.cuda.is_available() else "cpu")
        self.model = None
        self.input_size = (1024, 1024)

    def load_model(self):
        try:
            self.model = BiRefNet().to(self.device)
            self.model.eval()
            logger.info(f"BiRefNet model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load BiRefNet: {e}")
            raise

    def get_name(self) -> str:
        return "BiRefNet"

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
