import numpy as np
import cv2
import logging
from typing import Tuple
import torch
import torch.nn as nn

from .base import BaseBackgroundRemover
from ..utils.config import settings

logger = logging.getLogger(__name__)


class ConvBlock(nn.Module):
    def __init__(self, in_ch, out_ch, kernel=3, stride=1, padding=1):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, kernel, stride, padding, bias=False)
        self.bn = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class ISNet(nn.Module):
    def __init__(self):
        super().__init__()
        self.enc1 = nn.Sequential(ConvBlock(3, 32), ConvBlock(32, 32))
        self.pool1 = nn.MaxPool2d(2)
        self.enc2 = nn.Sequential(ConvBlock(32, 64), ConvBlock(64, 64))
        self.pool2 = nn.MaxPool2d(2)
        self.enc3 = nn.Sequential(ConvBlock(64, 128), ConvBlock(128, 128))
        self.pool3 = nn.MaxPool2d(2)
        self.enc4 = nn.Sequential(ConvBlock(128, 256), ConvBlock(256, 256))
        self.pool4 = nn.MaxPool2d(2)
        self.bridge = nn.Sequential(ConvBlock(256, 512), ConvBlock(512, 512))
        self.up4 = nn.ConvTranspose2d(512, 256, 2, stride=2)
        self.dec4 = nn.Sequential(ConvBlock(512, 256), ConvBlock(256, 256))
        self.up3 = nn.ConvTranspose2d(256, 128, 2, stride=2)
        self.dec3 = nn.Sequential(ConvBlock(256, 128), ConvBlock(128, 128))
        self.up2 = nn.ConvTranspose2d(128, 64, 2, stride=2)
        self.dec2 = nn.Sequential(ConvBlock(128, 64), ConvBlock(64, 64))
        self.up1 = nn.ConvTranspose2d(64, 32, 2, stride=2)
        self.dec1 = nn.Sequential(ConvBlock(64, 32), ConvBlock(32, 32))
        self.out = nn.Conv2d(32, 1, 1)

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


class ISNetRemover(BaseBackgroundRemover):
    def __init__(self):
        self.device = torch.device(settings.DEVICE if torch.cuda.is_available() else "cpu")
        self.model = None
        self.input_size = (1024, 1024)

    def load_model(self):
        try:
            self.model = ISNet().to(self.device)
            self.model.eval()
            logger.info(f"ISNet model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load ISNet: {e}")
            raise

    def get_name(self) -> str:
        return "ISNet"

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
        return image, alpha
