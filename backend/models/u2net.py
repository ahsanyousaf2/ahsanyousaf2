import numpy as np
import cv2
import logging
from typing import Tuple
import torch
import torch.nn as nn
import torch.nn.functional as F

from .base import BaseBackgroundRemover
from ..utils.config import settings

logger = logging.getLogger(__name__)


class REBNCONV(nn.Module):
    def __init__(self, in_ch, out_ch, dilate=1):
        super().__init__()
        self.conv = nn.Conv2d(in_ch, out_ch, 3, padding=dilate, dilation=dilate)
        self.bn = nn.BatchNorm2d(out_ch)
        self.relu = nn.ReLU(inplace=True)

    def forward(self, x):
        return self.relu(self.bn(self.conv(x)))


class RSU7(nn.Module):
    def __init__(self, in_ch=3, mid_ch=12, out_ch=3):
        super().__init__()
        self.rebnconvin = REBNCONV(in_ch, out_ch, dilate=1)
        self.rebnconv1 = REBNCONV(out_ch, mid_ch, dilate=1)
        self.pool1 = nn.MaxPool2d(2, stride=2, ceil_mode=True)
        self.rebnconv2 = REBNCONV(mid_ch, mid_ch, dilate=1)
        self.pool2 = nn.MaxPool2d(2, stride=2, ceil_mode=True)
        self.rebnconv3 = REBNCONV(mid_ch, mid_ch, dilate=1)
        self.pool3 = nn.MaxPool2d(2, stride=2, ceil_mode=True)
        self.rebnconv4 = REBNCONV(mid_ch, mid_ch, dilate=1)
        self.pool4 = nn.MaxPool2d(2, stride=2, ceil_mode=True)
        self.rebnconv5 = REBNCONV(mid_ch, mid_ch, dilate=1)
        self.pool5 = nn.MaxPool2d(2, stride=2, ceil_mode=True)
        self.rebnconv6 = REBNCONV(mid_ch, mid_ch, dilate=1)
        self.rebnconv7 = REBNCONV(mid_ch, mid_ch, dilate=2)
        self.rebnconv6d = REBNCONV(mid_ch * 2, mid_ch, dilate=1)
        self.rebnconv5d = REBNCONV(mid_ch * 2, mid_ch, dilate=1)
        self.rebnconv4d = REBNCONV(mid_ch * 2, mid_ch, dilate=1)
        self.rebnconv3d = REBNCONV(mid_ch * 2, mid_ch, dilate=1)
        self.rebnconv2d = REBNCONV(mid_ch * 2, mid_ch, dilate=1)
        self.rebnconv1d = REBNCONV(mid_ch * 2, out_ch, dilate=1)

    def forward(self, x):
        hx = x
        hxin = self.rebnconvin(hx)
        hx1 = self.rebnconv1(hxin)
        hx = self.pool1(hx1)
        hx2 = self.rebnconv2(hx)
        hx = self.pool2(hx2)
        hx3 = self.rebnconv3(hx)
        hx = self.pool3(hx3)
        hx4 = self.rebnconv4(hx)
        hx = self.pool4(hx4)
        hx5 = self.rebnconv5(hx)
        hx = self.pool5(hx5)
        hx6 = self.rebnconv6(hx)
        hx7 = self.rebnconv7(hx6)
        hx6d = self.rebnconv6d(torch.cat((hx7, hx6), 1))
        hx6dup = F.interpolate(hx6d, scale_factor=2, mode='bilinear', align_corners=True)
        hx5d = self.rebnconv5d(torch.cat((hx6dup, hx5), 1))
        hx5dup = F.interpolate(hx5d, scale_factor=2, mode='bilinear', align_corners=True)
        hx4d = self.rebnconv4d(torch.cat((hx5dup, hx4), 1))
        hx4dup = F.interpolate(hx4d, scale_factor=2, mode='bilinear', align_corners=True)
        hx3d = self.rebnconv3d(torch.cat((hx4dup, hx3), 1))
        hx3dup = F.interpolate(hx3d, scale_factor=2, mode='bilinear', align_corners=True)
        hx2d = self.rebnconv2d(torch.cat((hx3dup, hx2), 1))
        hx2dup = F.interpolate(hx2d, scale_factor=2, mode='bilinear', align_corners=True)
        hx1d = self.rebnconv1d(torch.cat((hx2dup, hx1), 1))
        return hx1d + hxin


class U2Net(nn.Module):
    def __init__(self, in_ch=3, out_ch=1):
        super().__init__()
        self.stage1 = RSU7(in_ch, 32, 64)
        self.stage2 = RSU7(64, 32, 128)
        self.stage3 = RSU7(128, 64, 256)
        self.stage4 = RSU7(256, 128, 512)
        self.stage5 = RSU7(512, 256, 512)
        self.stage6 = RSU7(512, 256, 512)
        self.stage5d = RSU7(1024, 128, 256)
        self.stage4d = RSU7(512, 64, 128)
        self.stage3d = RSU7(256, 32, 64)
        self.stage2d = RSU7(128, 16, 32)
        self.stage1d = RSU7(64, 16, 32)
        self.side1 = nn.Conv2d(32, out_ch, 3, padding=1)
        self.side2 = nn.Conv2d(32, out_ch, 3, padding=1)
        self.side3 = nn.Conv2d(64, out_ch, 3, padding=1)
        self.side4 = nn.Conv2d(128, out_ch, 3, padding=1)
        self.side5 = nn.Conv2d(256, out_ch, 3, padding=1)
        self.side6 = nn.Conv2d(512, out_ch, 3, padding=1)
        self.outconv = nn.Conv2d(6, out_ch, 1)

    def forward(self, x):
        hx = x
        hx1 = self.stage1(hx)
        hx = F.interpolate(hx1, scale_factor=0.5, mode='bilinear', align_corners=True)
        hx2 = self.stage2(hx)
        hx = F.interpolate(hx2, scale_factor=0.5, mode='bilinear', align_corners=True)
        hx3 = self.stage3(hx)
        hx = F.interpolate(hx3, scale_factor=0.5, mode='bilinear', align_corners=True)
        hx4 = self.stage4(hx)
        hx = F.interpolate(hx4, scale_factor=0.5, mode='bilinear', align_corners=True)
        hx5 = self.stage5(hx)
        hx = F.interpolate(hx5, scale_factor=0.5, mode='bilinear', align_corners=True)
        hx6 = self.stage6(hx)
        hx6up = F.interpolate(hx6, scale_factor=2, mode='bilinear', align_corners=True)
        hx5d = self.stage5d(torch.cat((hx6up, hx5), 1))
        hx5dup = F.interpolate(hx5d, scale_factor=2, mode='bilinear', align_corners=True)
        hx4d = self.stage4d(torch.cat((hx5dup, hx4), 1))
        hx4dup = F.interpolate(hx4d, scale_factor=2, mode='bilinear', align_corners=True)
        hx3d = self.stage3d(torch.cat((hx4dup, hx3), 1))
        hx3dup = F.interpolate(hx3d, scale_factor=2, mode='bilinear', align_corners=True)
        hx2d = self.stage2d(torch.cat((hx3dup, hx2), 1))
        hx2dup = F.interpolate(hx2d, scale_factor=2, mode='bilinear', align_corners=True)
        hx1d = self.stage1d(torch.cat((hx2dup, hx1), 1))
        d1 = self.side1(hx1d)
        d2 = self.side2(hx2d)
        d2 = F.interpolate(d2, scale_factor=2, mode='bilinear', align_corners=True)
        d3 = self.side3(hx3d)
        d3 = F.interpolate(d3, scale_factor=4, mode='bilinear', align_corners=True)
        d4 = self.side4(hx4d)
        d4 = F.interpolate(d4, scale_factor=8, mode='bilinear', align_corners=True)
        d5 = self.side5(hx5d)
        d5 = F.interpolate(d5, scale_factor=16, mode='bilinear', align_corners=True)
        d6 = self.side6(hx6)
        d6 = F.interpolate(d6, scale_factor=32, mode='bilinear', align_corners=True)
        d0 = self.outconv(torch.cat((d1, d2, d3, d4, d5, d6), 1))
        return torch.sigmoid(d0)


class U2NetRemover(BaseBackgroundRemover):
    def __init__(self):
        self.device = torch.device(settings.DEVICE if torch.cuda.is_available() else "cpu")
        self.model = None
        self.input_size = (320, 320)

    def load_model(self):
        try:
            self.model = U2Net().to(self.device)
            self.model.eval()
            logger.info(f"U2-Net model loaded on {self.device}")
        except Exception as e:
            logger.error(f"Failed to load U2-Net: {e}")
            raise

    def get_name(self) -> str:
        return "U2Net"

    def remove_background(self, image: np.ndarray, preserve_shadows: bool = False) -> Tuple[np.ndarray, np.ndarray]:
        original_size = (image.shape[1], image.shape[0])
        resized = cv2.resize(image, self.input_size, interpolation=cv2.INTER_AREA)
        input_tensor = torch.from_numpy(resized.transpose(2, 0, 1).astype(np.float32) / 255.0).unsqueeze(0).to(self.device)
        with torch.no_grad():
            alpha = self.model(input_tensor)
        alpha = alpha.squeeze().cpu().numpy()
        alpha = cv2.resize(alpha, original_size, interpolation=cv2.INTER_LINEAR)
        alpha = np.clip(alpha, 0, 1)
        return image, alpha
