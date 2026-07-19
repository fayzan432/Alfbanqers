"""Central application configuration, loaded from environment variables / .env."""
from functools import lru_cache
from pathlib import Path
from typing import List, Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parent.parent.parent


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(BASE_DIR / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # --- Core ---
    ENVIRONMENT: Literal["development", "production", "test"] = "development"
    SECRET_KEY: str = "insecure-dev-secret-change-me"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 1440
    CORS_ORIGINS: str = "http://localhost:3000"

    # --- Database ---
    USE_SQLITE: bool = True
    SQLITE_PATH: str = "./data/jarvis.db"
    DATABASE_URL: str = "postgresql+psycopg://jarvis:jarvis@localhost:5432/jarvis"

    # --- AI provider ---
    # Defaults to "local" (a free, self-hosted OpenAI-compatible endpoint such
    # as Ollama or LM Studio) so the assistant works with zero API cost and no
    # API key out of the box. OpenAI/Anthropic are supported as optional
    # bring-your-own-key providers, never required.
    AI_PROVIDER: Literal["openai", "anthropic", "local"] = "local"
    OPENAI_API_KEY: str = ""
    OPENAI_MODEL: str = "gpt-4o-mini"
    ANTHROPIC_API_KEY: str = ""
    ANTHROPIC_MODEL: str = "claude-sonnet-5"
    LOCAL_LLM_BASE_URL: str = "http://localhost:11434/v1"
    LOCAL_LLM_MODEL: str = "llama3.1"
    # Some local runtimes (older llama.cpp/Ollama builds) don't support
    # OpenAI-style function calling. When false, the agent falls back to a
    # text-based ReAct-style tool protocol instead of native tool_calls.
    LOCAL_LLM_SUPPORTS_TOOL_CALLS: bool = False

    # --- Embeddings ---
    EMBEDDING_PROVIDER: Literal["openai", "local"] = "local"
    OPENAI_EMBEDDING_MODEL: str = "text-embedding-3-small"
    LOCAL_EMBEDDING_MODEL: str = "sentence-transformers/all-MiniLM-L6-v2"
    CHROMA_PERSIST_DIR: str = "./data/chroma"

    # --- Voice ---
    WHISPER_MODEL_SIZE: str = "base"
    WHISPER_DEVICE: str = "cpu"
    TTS_ENGINE: Literal["edge-tts", "pyttsx3"] = "edge-tts"
    TTS_VOICE: str = "en-US-GuyNeural"
    WAKE_WORD: str = "jarvis"

    # --- Automation / security ---
    AUTOMATION_ENABLED: bool = False
    REQUIRE_CONFIRMATION_FOR: str = "delete_file,send_email,execute_terminal_command,browser_login"

    # --- Vision ---
    FACE_RECOGNITION_CONSENT: bool = False
    OCR_LANGUAGE: str = "eng"

    # --- Email defaults ---
    DEFAULT_IMAP_HOST: str = "imap.gmail.com"
    DEFAULT_IMAP_PORT: int = 993
    DEFAULT_SMTP_HOST: str = "smtp.gmail.com"
    DEFAULT_SMTP_PORT: int = 587

    # --- Frontend (informational, consumed by Next.js directly) ---
    NEXT_PUBLIC_API_URL: str = "http://localhost:8000"
    NEXT_PUBLIC_WS_URL: str = "ws://localhost:8000"

    @property
    def cors_origins_list(self) -> List[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]

    @property
    def confirmation_required_actions(self) -> List[str]:
        return [a.strip() for a in self.REQUIRE_CONFIRMATION_FOR.split(",") if a.strip()]

    @property
    def sqlalchemy_database_uri(self) -> str:
        if self.USE_SQLITE:
            db_path = Path(self.SQLITE_PATH)
            db_path.parent.mkdir(parents=True, exist_ok=True)
            return f"sqlite+aiosqlite:///{db_path.as_posix()}"
        return self.DATABASE_URL


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
