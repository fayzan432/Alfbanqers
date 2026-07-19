"""Resolves the configured AI provider. Defaults to the free local backend."""
from functools import lru_cache

from app.ai.base import AIProvider
from app.core.config import settings


@lru_cache
def get_ai_provider() -> AIProvider:
    if settings.AI_PROVIDER == "openai" and settings.OPENAI_API_KEY:
        from app.ai.providers.openai_provider import OpenAIProvider

        return OpenAIProvider()
    if settings.AI_PROVIDER == "anthropic" and settings.ANTHROPIC_API_KEY:
        from app.ai.providers.anthropic_provider import AnthropicProvider

        return AnthropicProvider()

    from app.ai.providers.local_provider import LocalProvider

    return LocalProvider()
