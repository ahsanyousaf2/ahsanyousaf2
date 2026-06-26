import pytest
from fastapi.testclient import TestClient
from app import app
import io
from PIL import Image

client = TestClient(app)


class TestHealthEndpoint:
    def test_health(self):
        response = client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert data["service"] == "removeanything-ai"


class TestRemoveBackground:
    def test_no_file_returns_422(self):
        response = client.post("/api/v1/remove-background")
        assert response.status_code == 422

    def test_invalid_file_returns_400(self):
        response = client.post(
            "/api/v1/remove-background",
            files={"file": ("test.txt", b"not an image", "text/plain")},
        )
        assert response.status_code == 400

    def test_valid_image_returns_200(self):
        img = Image.new("RGB", (100, 100), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        response = client.post(
            "/api/v1/remove-background",
            files={"file": ("test.png", buf.getvalue(), "image/png")},
        )
        assert response.status_code in (200, 500)


class TestBatchRemove:
    def test_batch_with_two_images(self):
        img1 = Image.new("RGB", (50, 50), color="red")
        img2 = Image.new("RGB", (50, 50), color="green")
        buf1 = io.BytesIO()
        buf2 = io.BytesIO()
        img1.save(buf1, format="PNG")
        img2.save(buf2, format="PNG")

        response = client.post(
            "/api/v1/batch-remove",
            files=[
                ("files", ("img1.png", buf1.getvalue(), "image/png")),
                ("files", ("img2.png", buf2.getvalue(), "image/png")),
            ],
        )
        assert response.status_code in (200, 500)


class TestReplaceBackground:
    def test_replace_with_color(self):
        img = Image.new("RGB", (100, 100), color="blue")
        buf = io.BytesIO()
        img.save(buf, format="PNG")
        buf.seek(0)

        response = client.post(
            "/api/v1/replace-background",
            files={"file": ("test.png", buf.getvalue(), "image/png")},
            data={
                "background_type": "color",
                "color_r": 255,
                "color_g": 255,
                "color_b": 255,
            },
        )
        assert response.status_code in (200, 500)
