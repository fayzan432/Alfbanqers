"""Registers computer-control, file-management, and browser-agent actions
as tools the reasoning agent can call. Destructive/sensitive ones are
flagged so the permission layer forces a confirmation round-trip.
"""
from __future__ import annotations

from app.ai.base import ToolDefinition
from app.ai.tools import ToolContext, tool_registry
from app.automation import browser, computer, files as file_ops


# --- Computer control -------------------------------------------------------

async def _open_application(args: dict, ctx: ToolContext) -> dict:
    return {"result": computer.open_application(args["name"])}


async def _close_application(args: dict, ctx: ToolContext) -> dict:
    return {"result": computer.close_application(args["name"])}


async def _move_mouse(args: dict, ctx: ToolContext) -> dict:
    return {"result": computer.move_mouse(int(args["x"]), int(args["y"]))}


async def _click(args: dict, ctx: ToolContext) -> dict:
    return {"result": computer.click(args.get("x"), args.get("y"), args.get("button", "left"))}


async def _type_text(args: dict, ctx: ToolContext) -> dict:
    return {"result": computer.type_text(args["text"])}


async def _take_screenshot(args: dict, ctx: ToolContext) -> dict:
    return {"path": computer.take_screenshot()}


async def _execute_terminal_command(args: dict, ctx: ToolContext) -> dict:
    return computer.execute_terminal_command(args["command"])


# --- File management ---------------------------------------------------------

async def _list_files(args: dict, ctx: ToolContext) -> dict:
    return {"entries": file_ops.list_directory(args["path"])}


async def _read_file(args: dict, ctx: ToolContext) -> dict:
    return {"content": file_ops.read_text_file(args["path"])}


async def _write_file(args: dict, ctx: ToolContext) -> dict:
    return {"path": file_ops.write_text_file(args["path"], args["content"])}


async def _move_file(args: dict, ctx: ToolContext) -> dict:
    return {"path": file_ops.move_path(args["source"], args["destination"])}


async def _copy_file(args: dict, ctx: ToolContext) -> dict:
    return {"path": file_ops.copy_path(args["source"], args["destination"])}


async def _rename_file(args: dict, ctx: ToolContext) -> dict:
    return {"path": file_ops.rename_path(args["source"], args["new_name"])}


async def _delete_file(args: dict, ctx: ToolContext) -> dict:
    file_ops.delete_path(args["path"])
    return {"deleted": args["path"]}


async def _search_files(args: dict, ctx: ToolContext) -> dict:
    return {"entries": file_ops.search_files(args["root"], args["query"], int(args.get("max_results", 50)))}


async def _create_folder(args: dict, ctx: ToolContext) -> dict:
    return {"path": file_ops.create_folder(args["path"])}


async def _compress_files(args: dict, ctx: ToolContext) -> dict:
    return {"archive": file_ops.compress_paths(args["paths"], args["archive_path"])}


async def _extract_archive(args: dict, ctx: ToolContext) -> dict:
    return {"destination": file_ops.extract_archive(args["archive_path"], args["destination"])}


# --- Browser agent -------------------------------------------------------

async def _search_web(args: dict, ctx: ToolContext) -> dict:
    return {"results": await browser.search_web(args["query"], int(args.get("max_results", 5)))}


async def _read_webpage(args: dict, ctx: ToolContext) -> dict:
    return await browser.read_page(args["url"])


async def _summarize_webpage(args: dict, ctx: ToolContext) -> dict:
    return await browser.summarize_page(args["url"])


async def _fill_web_form(args: dict, ctx: ToolContext) -> dict:
    return await browser.fill_form(args["url"], args["fields"], args.get("submit_selector"))


async def _browser_login(args: dict, ctx: ToolContext) -> dict:
    return await browser.login_to_site(
        args["url"], args["username_selector"], args["password_selector"], args["username"], args["password"], args["submit_selector"]
    )


async def _download_file(args: dict, ctx: ToolContext) -> dict:
    return {"path": await browser.download_file(args["url"], args.get("filename"))}


_TOOL_SPECS = [
    (
        ToolDefinition("open_application", "Open a desktop application by name.", {
            "type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]
        }),
        _open_application, False,
    ),
    (
        ToolDefinition("close_application", "Close/quit a running desktop application by name.", {
            "type": "object", "properties": {"name": {"type": "string"}}, "required": ["name"]
        }),
        _close_application, True,
    ),
    (
        ToolDefinition("move_mouse", "Move the mouse cursor to screen coordinates.", {
            "type": "object", "properties": {"x": {"type": "integer"}, "y": {"type": "integer"}}, "required": ["x", "y"]
        }),
        _move_mouse, False,
    ),
    (
        ToolDefinition("click_mouse", "Click the mouse, optionally at given coordinates.", {
            "type": "object",
            "properties": {"x": {"type": "integer"}, "y": {"type": "integer"}, "button": {"type": "string", "default": "left"}},
        }),
        _click, False,
    ),
    (
        ToolDefinition("type_text", "Type text at the current cursor/focus position.", {
            "type": "object", "properties": {"text": {"type": "string"}}, "required": ["text"]
        }),
        _type_text, False,
    ),
    (
        ToolDefinition("take_screenshot", "Capture a screenshot of the screen and save it.", {"type": "object", "properties": {}}),
        _take_screenshot, False,
    ),
    (
        ToolDefinition("execute_terminal_command", "Run a shell command on the host machine and return its output.", {
            "type": "object", "properties": {"command": {"type": "string"}}, "required": ["command"]
        }),
        _execute_terminal_command, True,
    ),
    (
        ToolDefinition("list_files", "List the contents of a directory.", {
            "type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]
        }),
        _list_files, False,
    ),
    (
        ToolDefinition("read_file", "Read the text contents of a file.", {
            "type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]
        }),
        _read_file, False,
    ),
    (
        ToolDefinition("write_file", "Write text content to a file, creating it if needed.", {
            "type": "object", "properties": {"path": {"type": "string"}, "content": {"type": "string"}}, "required": ["path", "content"]
        }),
        _write_file, False,
    ),
    (
        ToolDefinition("move_file", "Move a file or folder to a new path.", {
            "type": "object", "properties": {"source": {"type": "string"}, "destination": {"type": "string"}}, "required": ["source", "destination"]
        }),
        _move_file, False,
    ),
    (
        ToolDefinition("copy_file", "Copy a file or folder to a new path.", {
            "type": "object", "properties": {"source": {"type": "string"}, "destination": {"type": "string"}}, "required": ["source", "destination"]
        }),
        _copy_file, False,
    ),
    (
        ToolDefinition("rename_file", "Rename a file or folder.", {
            "type": "object", "properties": {"source": {"type": "string"}, "new_name": {"type": "string"}}, "required": ["source", "new_name"]
        }),
        _rename_file, False,
    ),
    (
        ToolDefinition("delete_file", "Permanently delete a file or folder. Destructive.", {
            "type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]
        }),
        _delete_file, True,
    ),
    (
        ToolDefinition("search_files", "Search a directory tree for files/folders matching a name substring.", {
            "type": "object", "properties": {"root": {"type": "string"}, "query": {"type": "string"}, "max_results": {"type": "integer", "default": 50}}, "required": ["root", "query"]
        }),
        _search_files, False,
    ),
    (
        ToolDefinition("create_folder", "Create a new folder (and parents if needed).", {
            "type": "object", "properties": {"path": {"type": "string"}}, "required": ["path"]
        }),
        _create_folder, False,
    ),
    (
        ToolDefinition("compress_files", "Compress one or more files/folders into a zip archive.", {
            "type": "object", "properties": {"paths": {"type": "array", "items": {"type": "string"}}, "archive_path": {"type": "string"}}, "required": ["paths", "archive_path"]
        }),
        _compress_files, False,
    ),
    (
        ToolDefinition("extract_archive", "Extract a zip archive to a destination folder.", {
            "type": "object", "properties": {"archive_path": {"type": "string"}, "destination": {"type": "string"}}, "required": ["archive_path", "destination"]
        }),
        _extract_archive, False,
    ),
    (
        ToolDefinition("search_web", "Search the internet for a query and return result titles/URLs.", {
            "type": "object", "properties": {"query": {"type": "string"}, "max_results": {"type": "integer", "default": 5}}, "required": ["query"]
        }),
        _search_web, False,
    ),
    (
        ToolDefinition("read_webpage", "Load a URL and return its visible text content.", {
            "type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]
        }),
        _read_webpage, False,
    ),
    (
        ToolDefinition("summarize_webpage", "Load a URL and return an AI-generated summary of it.", {
            "type": "object", "properties": {"url": {"type": "string"}}, "required": ["url"]
        }),
        _summarize_webpage, False,
    ),
    (
        ToolDefinition("fill_web_form", "Fill fields on a web page form, identified by CSS selectors, and optionally submit.", {
            "type": "object",
            "properties": {
                "url": {"type": "string"},
                "fields": {"type": "object", "description": "map of CSS selector -> value"},
                "submit_selector": {"type": "string"},
            },
            "required": ["url", "fields"],
        }),
        _fill_web_form, False,
    ),
    (
        ToolDefinition("browser_login", "Log into a website using user-supplied credentials. Destructive/sensitive.", {
            "type": "object",
            "properties": {
                "url": {"type": "string"},
                "username_selector": {"type": "string"},
                "password_selector": {"type": "string"},
                "username": {"type": "string"},
                "password": {"type": "string"},
                "submit_selector": {"type": "string"},
            },
            "required": ["url", "username_selector", "password_selector", "username", "password", "submit_selector"],
        }),
        _browser_login, True,
    ),
    (
        ToolDefinition("download_file", "Download a file from a URL to the local downloads folder.", {
            "type": "object", "properties": {"url": {"type": "string"}, "filename": {"type": "string"}}, "required": ["url"]
        }),
        _download_file, False,
    ),
]

for definition, handler, destructive in _TOOL_SPECS:
    tool_registry.register(definition, handler, destructive=destructive)
