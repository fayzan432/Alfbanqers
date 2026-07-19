"""Discovers and loads plugins from PLUGINS_DIR without touching core code.

Each plugin lives in its own directory under PLUGINS_DIR:

    plugins_dir/
      my_plugin/
        manifest.json   # PluginManifest fields
        plugin.py        # defines `Plugin`, a BasePlugin subclass

Dropping a new directory there — and enabling it via the plugins API — is
the entire extension surface; nothing in app/ needs to change.
"""
from __future__ import annotations

import importlib.util
import json
from pathlib import Path

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.ai.tools import tool_registry
from app.core.logging import logger
from app.models.plugin import PluginRecord
from app.plugins.base import BasePlugin
from app.schemas.plugin import PluginManifest

PLUGINS_DIR = Path(__file__).resolve().parent.parent.parent / "plugins_dir"

_loaded_plugins: dict[str, BasePlugin] = {}
_plugin_tool_names: dict[str, list[str]] = {}


def discover_manifests() -> list[PluginManifest]:
    manifests = []
    if not PLUGINS_DIR.exists():
        return manifests
    for plugin_dir in sorted(p for p in PLUGINS_DIR.iterdir() if p.is_dir()):
        manifest_path = plugin_dir / "manifest.json"
        if not manifest_path.exists():
            continue
        try:
            manifests.append(PluginManifest.model_validate(json.loads(manifest_path.read_text())))
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Invalid plugin manifest in {plugin_dir}: {exc}")
    return manifests


def _import_plugin_module(plugin_dir: Path, slug: str):
    module_path = plugin_dir / "plugin.py"
    spec = importlib.util.spec_from_file_location(f"jarvis_plugin_{slug}", module_path)
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


async def load_all_plugins(db: AsyncSession) -> list[PluginManifest]:
    manifests = discover_manifests()

    for manifest in manifests:
        result = await db.execute(select(PluginRecord).where(PluginRecord.slug == manifest.slug))
        record = result.scalar_one_or_none()
        if record is None:
            record = PluginRecord(
                slug=manifest.slug,
                name=manifest.name,
                description=manifest.description,
                version=manifest.version,
                permissions=manifest.permissions,
                entry_point=manifest.entry_point,
                enabled=True,
            )
            db.add(record)
            await db.flush()

        if not record.enabled:
            continue

        try:
            load_plugin(manifest.slug)
        except Exception as exc:  # noqa: BLE001
            logger.error(f"Failed to load plugin '{manifest.slug}': {exc}")

    await db.commit()
    return manifests


def load_plugin(slug: str) -> None:
    if slug in _loaded_plugins:
        return

    plugin_dir = PLUGINS_DIR / slug
    manifest_path = plugin_dir / "manifest.json"
    if not manifest_path.exists():
        raise FileNotFoundError(f"No manifest.json for plugin '{slug}'")

    before = set(tool_registry._tools.keys())  # noqa: SLF001  (loader is the one legitimate internal caller)
    module = _import_plugin_module(plugin_dir, slug)
    plugin_instance: BasePlugin = module.Plugin()
    plugin_instance.register_tools(tool_registry)
    after = set(tool_registry._tools.keys())  # noqa: SLF001

    _loaded_plugins[slug] = plugin_instance
    _plugin_tool_names[slug] = list(after - before)
    logger.info(f"Loaded plugin '{slug}' (tools: {_plugin_tool_names[slug]})")


def unload_plugin(slug: str) -> None:
    tool_registry.unregister_prefix_owned_by(_plugin_tool_names.get(slug, []))
    _plugin_tool_names.pop(slug, None)
    _loaded_plugins.pop(slug, None)
    logger.info(f"Unloaded plugin '{slug}'")
