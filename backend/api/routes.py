import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import Response, JSONResponse
from typing import Optional, List
import numpy as np
import cv2
import os

from ..services.model_manager import ModelManager
from ..services.image_processor import ImageProcessor
from ..utils.validators import validate_file_size, validate_file_format, sanitize_filename
from ..utils.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


def get_model_manager(request) -> ModelManager:
    return request.app.state.model_manager


@router.post("/remove-background")
async def remove_background(
    file: UploadFile = File(...),
    preserve_shadows: bool = Form(False),
    edge_refinement: bool = Form(True),
    alpha_matting: bool = Form(True),
    output_format: str = Form("png"),
    high_resolution: bool = Form(True),
    request=None,
):
    try:
        file_bytes = await file.read()

        size_valid, size_error = validate_file_size(file_bytes)
        if not size_valid:
            raise HTTPException(status_code=400, detail=size_error)

        format_valid, format_error = validate_file_format(file_bytes)
        if not format_valid:
            raise HTTPException(status_code=400, detail=format_error)

        model_manager = get_model_manager(request)
        processor = ImageProcessor()

        image = processor.load_image(file_bytes)

        original_h, original_w = image.shape[:2]
        if not high_resolution:
            max_dim = 1024
            if max(original_w, original_h) > max_dim:
                scale = max_dim / max(original_w, original_h)
                new_w, new_h = int(original_w * scale), int(original_h * scale)
                image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)

        result = await model_manager.remove_background(
            image,
            preserve_shadows=preserve_shadows,
            edge_refine=edge_refinement
        )

        result_image = result["image"]
        alpha = result["alpha"]

        if not high_resolution and (original_w != image.shape[1] or original_h != image.shape[0]):
            result_image = cv2.resize(result_image, (original_w, original_h), interpolation=cv2.INTER_LANCZOS4)
            alpha = cv2.resize(alpha, (original_w, original_h), interpolation=cv2.INTER_LINEAR)

        output_bytes, mime_type = processor.process_result(
            result_image, alpha,
            output_format=output_format,
            preserve_shadows=preserve_shadows,
            edge_refine=edge_refinement
        )

        filename = sanitize_filename(file.filename or "image")
        base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename

        return Response(
            content=output_bytes,
            media_type=mime_type,
            headers={
                "Content-Disposition": f'attachment; filename="{base_name}_nobg.{output_format}"',
                "X-Inference-Time": f"{result['inference_time']:.3f}",
                "X-Model": result["model"],
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Background removal failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/replace-background")
async def replace_background(
    file: UploadFile = File(...),
    background_type: str = Form("color"),
    color_r: int = Form(0),
    color_g: int = Form(0),
    color_b: int = Form(0),
    blur_strength: int = Form(30),
    preserve_shadows: bool = Form(False),
    request=None,
):
    try:
        file_bytes = await file.read()

        size_valid, _ = validate_file_size(file_bytes)
        if not size_valid:
            raise HTTPException(status_code=400, detail="File too large")

        format_valid, _ = validate_file_format(file_bytes)
        if not format_valid:
            raise HTTPException(status_code=400, detail="Invalid format")

        model_manager = get_model_manager(request)
        processor = ImageProcessor()

        image = processor.load_image(file_bytes)

        result = await model_manager.remove_background(
            image, preserve_shadows=preserve_shadows
        )

        result_image = result["image"]
        alpha = result["alpha"]

        output_bytes, mime_type = processor.process_result(
            result_image, alpha,
            output_format="png",
            background_type=background_type,
            background_color=(color_r, color_g, color_b) if background_type == "color" else None,
            blur_strength=blur_strength if background_type == "blur" else 30,
        )

        filename = sanitize_filename(file.filename or "image")
        base_name = filename.rsplit('.', 1)[0] if '.' in filename else filename
        ext = "jpg" if background_type in ["color", "gradient", "image", "blur"] else "png"

        return Response(
            content=output_bytes,
            media_type=mime_type,
            headers={
                "Content-Disposition": f'attachment; filename="{base_name}_replaced.{ext}"'
            }
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Background replacement failed: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/job-status/{job_id}")
async def get_job_status(job_id: str):
    from ..queue.manager import JobQueueManager
    qm = JobQueueManager()
    job = qm.get_job(job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    return JSONResponse(content=job)
