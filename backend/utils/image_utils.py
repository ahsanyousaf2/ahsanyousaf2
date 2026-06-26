import cv2
import numpy as np
from PIL import Image
import io
import logging
from typing import Tuple, Optional, List

logger = logging.getLogger(__name__)


def validate_image(file_bytes: bytes) -> Tuple[bool, Optional[str]]:
    try:
        img = Image.open(io.BytesIO(file_bytes))
        img.verify()
        return True, None
    except Exception as e:
        return False, str(e)


def preprocess_image(image: np.ndarray, target_size: Tuple[int, int] = (1024, 1024)) -> np.ndarray:
    h, w = image.shape[:2]
    scale = min(target_size[0] / w, target_size[1] / h)
    if scale < 1.0:
        new_w = int(w * scale)
        new_h = int(h * scale)
        image = cv2.resize(image, (new_w, new_h), interpolation=cv2.INTER_AREA)
    return image


def normalize_image(image: np.ndarray) -> np.ndarray:
    return image.astype(np.float32) / 255.0


def denormalize_image(image: np.ndarray) -> np.ndarray:
    return (image * 255).astype(np.uint8)


def apply_alpha_matting(image: np.ndarray, alpha: np.ndarray, trimap: Optional[np.ndarray] = None) -> np.ndarray:
    if trimap is not None:
        kernel = np.ones((3, 3), np.uint8)
        dilated = cv2.dilate(alpha, kernel, iterations=2)
        eroded = cv2.erode(alpha, kernel, iterations=2)
        trimap = np.where(dilated > 0.5, 1, 0).astype(np.float32)
        trimap = np.where(eroded < 0.5, 0, trimap).astype(np.float32)
        unknown = (trimap == 0.5).astype(np.float32)

        from scipy.sparse import diags
        from scipy.sparse.linalg import spsolve

        laplacian = compute_matting_laplacian(image, unknown > 0)
        n = laplacian.shape[0]
        constraints = diags(trimap.flatten() > 0).tocsc()
        A = laplacian + 100 * constraints
        b = 100 * (trimap.flatten() > 0).astype(float)
        alpha_flat = spsolve(A, b)
        alpha = alpha_flat.reshape(alpha.shape)
    return alpha


def compute_matting_laplacian(image: np.ndarray, unknown_mask: np.ndarray) -> np.ndarray:
    h, w, c = image.shape
    img_lab = cv2.cvtColor(image, cv2.COLOR_RGB2LAB).astype(np.float32)

    from scipy.sparse import lil_matrix
    n_pixels = h * w
    A = lil_matrix((n_pixels, n_pixels), dtype=np.float32)

    win_radius = 1
    for y in range(win_radius, h - win_radius):
        for x in range(win_radius, w - win_radius):
            if not unknown_mask[y, x]:
                continue
            patch = img_lab[y - win_radius:y + win_radius + 1, x - win_radius:x + win_radius + 1]
            patch_flat = patch.reshape(-1, c)
            mean = patch_flat.mean(axis=0)
            cov = (patch_flat - mean).T @ (patch_flat - mean) / (patch_flat.shape[0] - 1) + 1e-6 * np.eye(c)

            inv_cov = np.linalg.inv(cov)
            for dy in range(-win_radius, win_radius + 1):
                for dx in range(-win_radius, win_radius + 1):
                    ny, nx = y + dy, x + dx
                    i = ny * w + nx
                    j = y * w + x
                    color_diff = img_lab[ny, nx] - mean
                    val = 1 + color_diff @ inv_cov @ color_diff
                    A[i, j] += val / win_radius ** 2

    return A.tocsc()


def anti_halo_correction(alpha: np.ndarray, image: np.ndarray, kernel_size: int = 5) -> np.ndarray:
    kernel = np.ones((kernel_size, kernel_size), np.float32) / (kernel_size * kernel_size)
    blurred_alpha = cv2.filter2D(alpha, -1, kernel)

    diff = np.abs(alpha - blurred_alpha)
    halo_mask = (diff > 0.1).astype(np.float32)

    grad_x = cv2.Sobel(alpha, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(alpha, cv2.CV_32F, 0, 1, ksize=3)
    edge_mask = np.sqrt(grad_x ** 2 + grad_y ** 2) > 0.05

    correction = halo_mask * (1 - blurred_alpha) * 0.5
    corrected = np.clip(alpha + correction * edge_mask, 0, 1)

    return corrected


def hair_detail_enhancement(alpha: np.ndarray, image: np.ndarray) -> np.ndarray:
    gray = cv2.cvtColor(image, cv2.COLOR_RGB2GRAY)

    kernel_size = 3
    kernel = np.array([
        [1, 2, 1],
        [2, 4, 2],
        [1, 2, 1]
    ], dtype=np.float32) / 16.0

    base = cv2.filter2D(gray, -1, kernel)
    detail = gray.astype(np.float32) - base.astype(np.float32)

    detail_energy = np.abs(detail)
    detail_energy = cv2.GaussianBlur(detail_energy, (0, 0), 2)
    detail_mask = (detail_energy > 0.02).astype(np.float32)

    grad_x = cv2.Sobel(alpha, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(alpha, cv2.CV_32F, 0, 1, ksize=3)
    edge_alpha = np.sqrt(grad_x ** 2 + grad_y ** 2)

    boost = detail_mask * (1 + detail_energy * 3) * edge_alpha
    enhanced = np.clip(alpha + boost * 0.3, 0, 1)

    return enhanced


def edge_refinement(alpha: np.ndarray, image: np.ndarray, trimap: Optional[np.ndarray] = None) -> np.ndarray:
    refined = anti_halo_correction(alpha, image)
    refined = hair_detail_enhancement(refined, image)

    if trimap is not None:
        refined = apply_alpha_matting(image, refined, trimap)

    grad_x = cv2.Sobel(refined, cv2.CV_32F, 1, 0, ksize=3)
    grad_y = cv2.Sobel(refined, cv2.CV_32F, 0, 1, ksize=3)
    edge_strength = np.sqrt(grad_x ** 2 + grad_y ** 2)

    smooth_kernel = np.ones((3, 3), np.float32) / 9.0
    smooth_mask = (edge_strength < 0.01).astype(np.float32)
    smooth_region = cv2.filter2D(refined, -1, smooth_kernel)
    refined = np.where(smooth_mask > 0, smooth_region, refined)

    return refined


def create_transparent_png(image: np.ndarray, alpha: np.ndarray) -> bytes:
    if len(image.shape) == 3 and image.shape[2] == 3:
        rgba = np.dstack([image, (alpha * 255).astype(np.uint8)])
    else:
        rgba = np.dstack([image[:, :, :3], (alpha * 255).astype(np.uint8)])

    pil_img = Image.fromarray(rgba, 'RGBA')
    buf = io.BytesIO()
    pil_img.save(buf, format='PNG', optimize=True)
    buf.seek(0)
    return buf.getvalue()


def create_transparent_webp(image: np.ndarray, alpha: np.ndarray, quality: int = 95) -> bytes:
    if len(image.shape) == 3 and image.shape[2] == 3:
        rgba = np.dstack([image, (alpha * 255).astype(np.uint8)])
    else:
        rgba = np.dstack([image[:, :, :3], (alpha * 255).astype(np.uint8)])

    pil_img = Image.fromarray(rgba, 'RGBA')
    buf = io.BytesIO()
    pil_img.save(buf, format='WEBP', quality=quality, lossless=False)
    buf.seek(0)
    return buf.getvalue()


def apply_background_color(image: np.ndarray, alpha: np.ndarray, color: Tuple[int, int, int]) -> np.ndarray:
    h, w = image.shape[:2]
    bg = np.ones((h, w, 3), dtype=np.uint8) * np.array(color, dtype=np.uint8)
    alpha_3 = np.stack([alpha, alpha, alpha], axis=-1)
    result = (image * alpha_3 + bg * (1 - alpha_3)).astype(np.uint8)
    return result


def apply_background_gradient(image: np.ndarray, alpha: np.ndarray, colors: List[Tuple[int, int, int]]) -> np.ndarray:
    h, w = image.shape[:2]
    gradient = np.zeros((h, w, 3), dtype=np.float32)

    for i in range(len(colors) - 1):
        start_y = int(i * h / (len(colors) - 1))
        end_y = int((i + 1) * h / (len(colors) - 1))
        for y in range(start_y, end_y):
            t = (y - start_y) / max(end_y - start_y, 1)
            c = np.array(colors[i], dtype=np.float32) * (1 - t) + np.array(colors[i + 1], dtype=np.float32) * t
            gradient[y, :] = c

    alpha_3 = np.stack([alpha, alpha, alpha], axis=-1)
    result = (image.astype(np.float32) * alpha_3 + gradient * (1 - alpha_3)).astype(np.uint8)
    return result


def apply_background_image(image: np.ndarray, alpha: np.ndarray, bg_image: np.ndarray) -> np.ndarray:
    bg_resized = cv2.resize(bg_image, (image.shape[1], image.shape[0]))
    alpha_3 = np.stack([alpha, alpha, alpha], axis=-1)
    result = (image.astype(np.float32) * alpha_3 + bg_resized.astype(np.float32) * (1 - alpha_3)).astype(np.uint8)
    return result


def apply_blur_background(image: np.ndarray, alpha: np.ndarray, blur_strength: int = 30) -> np.ndarray:
    blurred = cv2.GaussianBlur(image, (0, 0), blur_strength)
    alpha_3 = np.stack([alpha, alpha, alpha], axis=-1)
    result = (image.astype(np.float32) * alpha_3 + blurred.astype(np.float32) * (1 - alpha_3)).astype(np.uint8)
    return result
