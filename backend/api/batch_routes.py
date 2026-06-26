import logging
from fastapi import APIRouter, UploadFile, File, Form, HTTPException
from fastapi.responses import Response
from typing import List
import zipfile
import io

from ..services.model_manager import ModelManager
from ..services.image_processor import ImageProcessor
from ..utils.validators import validate_file_size, validate_file_format
from ..utils.config import settings

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/batch-remove")
async def batch_remove_background(
    files: List[UploadFile] = File(...),
    preserve_shadows: bool = Form(False),
    edge_refinement: bool = Form(True),
    output_format: str = Form("png"),
    request=None,
):
    if len(files) > settings.MAX_BATCH_SIZE:
        raise HTTPException(status_code=400, detail=f"Maximum {settings.MAX_BATCH_SIZE} images per batch")

    model_manager: ModelManager = request.app.state.model_manager
    processor = ImageProcessor()

    results = []
    errors = []

    for file in files:
        try:
            file_bytes = await file.read()

            size_valid, _ = validate_file_size(file_bytes)
            if not size_valid:
                errors.append({"filename": file.filename, "error": "File too large"})
                continue

            format_valid, _ = validate_file_format(file_bytes)
            if not format_valid:
                errors.append({"filename": file.filename, "error": "Invalid format"})
                continue

            image = processor.load_image(file_bytes)

            result = await model_manager.remove_background(
                image, preserve_shadows=preserve_shadows, edge_refine=edge_refinement
            )

            output_bytes, mime_type = processor.process_result(
                result["image"], result["alpha"],
                output_format=output_format,
                edge_refine=edge_refinement
            )

            results.append({
                "filename": file.filename,
                "data": output_bytes,
                "mime_type": mime_type,
                "inference_time": result["inference_time"],
            })

        except Exception as e:
            logger.error(f"Batch processing failed for {file.filename}: {e}")
            errors.append({"filename": file.filename, "error": str(e)})

    if len(results) == 1 and not errors:
        r = results[0]
        return Response(content=r["data"], media_type=r["mime_type"])

    zip_buffer = io.BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zf:
        for r in results:
            ext = "png" if r["mime_type"] == "image/png" else "webp"
            filename = r["filename"].rsplit('.', 1)[0] if '.' in r["filename"] else "image"
            zf.writestr(f"{filename}_nobg.{ext}", r["data"])

    zip_buffer.seek(0)

    return Response(
        content=zip_buffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=batch_results.zip"}
    )
