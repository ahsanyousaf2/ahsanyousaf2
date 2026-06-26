import pytest
import numpy as np
from PIL import Image
import io
from utils.image_utils import (
    validate_image,
    preprocess_image,
    normalize_image,
    denormalize_image,
    anti_halo_correction,
    hair_detail_enhancement,
    edge_refinement,
)


class TestImageUtils:
    def test_validate_image_valid(self):
        img = Image.new("RGB", (100, 100), color="red")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        valid, error = validate_image(buf.getvalue())
        assert valid is True
        assert error is None

    def test_validate_image_invalid(self):
        valid, error = validate_image(b"not an image")
        assert valid is False

    def test_preprocess_image_small(self):
        img = np.ones((100, 100, 3), dtype=np.uint8) * 255
        result = preprocess_image(img, (1024, 1024))
        assert result.shape[0] == 100
        assert result.shape[1] == 100

    def test_preprocess_image_large(self):
        img = np.ones((2000, 2000, 3), dtype=np.uint8) * 255
        result = preprocess_image(img, (1024, 1024))
        assert result.shape[0] <= 1024
        assert result.shape[1] <= 1024

    def test_normalize_denormalize(self):
        img = np.random.randint(0, 256, (100, 100, 3)).astype(np.uint8)
        normalized = normalize_image(img)
        assert normalized.min() >= 0.0
        assert normalized.max() <= 1.0
        denormalized = denormalize_image(normalized)
        assert np.allclose(img, denormalized, atol=1)

    def test_anti_halo_correction(self):
        alpha = np.ones((100, 100), dtype=np.float32)
        image = np.ones((100, 100, 3), dtype=np.uint8) * 128
        result = anti_halo_correction(alpha, image)
        assert result.shape == alpha.shape
        assert result.dtype == np.float32

    def test_hair_detail_enhancement(self):
        alpha = np.ones((100, 100), dtype=np.float32)
        image = np.random.randint(0, 256, (100, 100, 3)).astype(np.uint8)
        result = hair_detail_enhancement(alpha, image)
        assert result.shape == alpha.shape

    def test_edge_refinement(self):
        alpha = np.ones((100, 100), dtype=np.float32) * 0.5
        image = np.random.randint(0, 256, (100, 100, 3)).astype(np.uint8)
        result = edge_refinement(alpha, image)
        assert result.shape == alpha.shape
        assert np.all((result >= 0) & (result <= 1))


class TestValidators:
    from utils.validators import validate_file_size, validate_file_format, sanitize_filename

    def test_validate_file_size_valid(self):
        valid, error = self.validate_file_size(b"x" * 1024)
        assert valid is True

    def test_validate_file_size_invalid(self):
        valid, error = self.validate_file_size(b"x" * 30 * 1024 * 1024)
        assert valid is False

    def test_sanitize_filename(self):
        assert self.sanitize_filename("test image.png") == "test image.png"
        assert self.sanitize_filename("../malicious/file") == "..maliciousfile"
        assert self.sanitize_filename("") == "image"
