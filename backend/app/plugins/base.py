"""Base class every plugin's `plugin.py` must expose as `Plugin`."""
from __future__ import annotations

from abc import ABC, abstractmethod

from app.ai.tools import ToolRegistry
from app.schemas.plugin import PluginManifest


class BasePlugin(ABC):
    manifest: PluginManifest

    @abstractmethod
    def register_tools(self, registry: ToolRegistry) -> None:
        """Called once at load time — register this plugin's tools on the
        shared tool_registry so the agent can call them."""
        ...
