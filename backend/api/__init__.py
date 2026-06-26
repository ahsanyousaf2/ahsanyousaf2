from fastapi import APIRouter
from .routes import router as routes_router
from .batch_routes import router as batch_router

router = APIRouter()
router.include_router(routes_router)
router.include_router(batch_router)
