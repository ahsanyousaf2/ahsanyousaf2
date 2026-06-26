import logging
from typing import Tuple, Optional
from .config import settings

logger = logging.getLogger(__name__)

ALLOWED_MIME_TYPES = {
    "image/jpeg": [0xFF, 0xD8, 0xFF],
    "image/png": [0x89, 0x50, 0x4E, 0x47],
    "image/webp": [0x52, 0x49, 0x46, 0x46],
}


def validate_file_size(file_bytes: bytes) -> Tuple[bool, Optional[str]]:
    if len(file_bytes) > settings.MAX_FILE_SIZE:
        return False, f"File size exceeds maximum allowed ({settings.MAX_FILE_SIZE / 1024 / 1024:.0f}MB)"
    return True, None


def validate_file_format(file_bytes: bytes) -> Tuple[bool, Optional[str]]:
    import filetype
    kind = filetype.guess(file_bytes)
    if kind is None or kind.extension not in settings.ALLOWED_EXTENSIONS:
        return False, f"Invalid file format. Allowed: {', '.join(settings.ALLOWED_EXTENSIONS)}"
    return True, None


def validate_dimensions(image_bytes: bytes) -> Tuple[bool, Optional[str]]:
    from PIL import Image
    import io
    try:
        img = Image.open(io.BytesIO(image_bytes))
        w, h = img.size
        if w > settings.MAX_IMAGE_SIZE or h > settings.MAX_IMAGE_SIZE:
            return False, f"Image dimensions ({w}x{h}) exceed maximum ({settings.MAX_IMAGE_SIZE}x{settings.MAX_IMAGE_SIZE})"
        return True, None
    except Exception as e:
        return False, str(e)


def sanitize_filename(filename: str) -> str:
    import re
    filename = re.sub(r'[^\w\-_. ]', '', filename)
    filename = filename.strip()
    if not filename:
        filename = "image"
    return filename[:100]
