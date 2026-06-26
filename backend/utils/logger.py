import sys
from loguru import logger
from .config import settings


def setup_logging():
    logger.remove()
    logger.add(
        sys.stdout,
        format=settings.LOG_FORMAT,
        level=settings.LOG_LEVEL,
        colorize=True,
    )
    logger.add(
        "logs/app_{time:YYYY-MM-DD}.log",
        format=settings.LOG_FORMAT,
        level=settings.LOG_LEVEL,
        rotation="1 day",
        retention="30 days",
        compression="zip",
    )
    return logger
