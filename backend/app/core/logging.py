"""Application-wide logger configuration using loguru."""
import sys

from loguru import logger

from app.core.config import settings

logger.remove()
logger.add(
    sys.stdout,
    level="DEBUG" if settings.ENVIRONMENT == "development" else "INFO",
    format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> - <level>{message}</level>",
)

__all__ = ["logger"]
