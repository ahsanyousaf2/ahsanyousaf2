from pydantic import BaseModel, Field
from typing import Optional, List, Tuple
from enum import Enum


class BackgroundType(str, Enum):
    COLOR = "color"
    GRADIENT = "gradient"
    IMAGE = "image"
    BLUR = "blur"
    NONE = "none"


class RemoveBackgroundRequest(BaseModel):
    preserve_shadows: bool = Field(default=False, description="Whether to preserve shadows in the output")
    edge_refinement: bool = Field(default=True, description="Apply multi-stage edge refinement")
    alpha_matting: bool = Field(default=True, description="Apply alpha matting for fine details")
    output_format: str = Field(default="png", pattern="^(png|webp)$")
    high_resolution: bool = Field(default=True, description="Export at original resolution")


class ReplaceBackgroundRequest(BaseModel):
    background_type: BackgroundType = Field(default=BackgroundType.COLOR)
    color: Optional[Tuple[int, int, int]] = Field(default=None, description="RGB color tuple")
    gradient_colors: Optional[List[Tuple[int, int, int]]] = Field(default=None)
    blur_strength: int = Field(default=30, ge=0, le=100)
    preserve_shadows: bool = False
    edge_refinement: bool = True


class BatchRemoveRequest(BaseModel):
    preserve_shadows: bool = False
    edge_refinement: bool = True
    output_format: str = "png"
    max_images: int = Field(default=10, le=20)


class JobStatusResponse(BaseModel):
    job_id: str
    status: str
    progress: float = 0.0
    result_url: Optional[str] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    status: str
    version: str
    device: str
    model_loaded: bool
    queue_size: int
    uptime: float
