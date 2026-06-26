import asyncio
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from prometheus_client import make_asgi_app

from api import router as api_router
from utils.config import settings
from utils.logger import setup_logging
from services.model_manager import ModelManager


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    logger = logging.getLogger(__name__)
    logger.info("Starting Background Removal API...")
    model_manager = ModelManager()
    app.state.model_manager = model_manager
    await model_manager.initialize()
    yield
    logger.info("Shutting down...")
    await model_manager.cleanup()


app = FastAPI(
    title="RemoveAnything AI - Background Removal API",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

metrics_app = make_asgi_app()
app.mount("/metrics", metrics_app)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health():
    return {"status": "healthy", "service": "removeanything-ai"}
