"""Computer control: open/close applications, mouse, keyboard, screenshots.

Every function here actually controls the OS JARVIS is running on via
PyAutoGUI/subprocess. All of it is gated behind ``AUTOMATION_ENABLED`` — the
user must explicitly opt in via Settings before any of this can run.
"""
from __future__ import annotations

import platform
import subprocess
import time
from pathlib import Path

from app.core.config import settings


class AutomationDisabledError(PermissionError):
    pass


def _require_enabled() -> None:
    if not settings.AUTOMATION_ENABLED:
        raise AutomationDisabledError(
            "Computer control is disabled. Enable 'Automation permissions' in Settings to allow JARVIS to control this machine."
        )


def open_application(name: str) -> str:
    _require_enabled()
    system = platform.system()
    if system == "Darwin":
        subprocess.Popen(["open", "-a", name])
    elif system == "Windows":
        subprocess.Popen(["cmd", "/c", "start", "", name], shell=False)
    else:
        subprocess.Popen([name])
    return f"Opened {name}"


def close_application(name: str) -> str:
    _require_enabled()
    system = platform.system()
    if system == "Darwin":
        subprocess.run(["osascript", "-e", f'quit app "{name}"'], check=False)
    elif system == "Windows":
        subprocess.run(["taskkill", "/IM", f"{name}.exe", "/F"], check=False)
    else:
        subprocess.run(["pkill", "-f", name], check=False)
    return f"Closed {name}"


def move_mouse(x: int, y: int, duration: float = 0.2) -> str:
    _require_enabled()
    import pyautogui

    pyautogui.moveTo(x, y, duration=duration)
    return f"Moved mouse to ({x}, {y})"


def click(x: int | None = None, y: int | None = None, button: str = "left") -> str:
    _require_enabled()
    import pyautogui

    if x is not None and y is not None:
        pyautogui.click(x, y, button=button)
    else:
        pyautogui.click(button=button)
    return "Clicked"


def type_text(text: str, interval: float = 0.02) -> str:
    _require_enabled()
    import pyautogui

    pyautogui.write(text, interval=interval)
    return f"Typed {len(text)} characters"


def press_key(key: str) -> str:
    _require_enabled()
    import pyautogui

    pyautogui.press(key)
    return f"Pressed {key}"


def take_screenshot(save_dir: str = "./data/screenshots") -> str:
    _require_enabled()
    import mss

    out_dir = Path(save_dir)
    out_dir.mkdir(parents=True, exist_ok=True)
    filename = out_dir / f"screenshot_{int(time.time())}.png"
    with mss.mss() as sct:
        sct.shot(output=str(filename))
    return str(filename)


def execute_terminal_command(command: str, timeout: int = 30) -> dict:
    """Runs a shell command and returns stdout/stderr/returncode.

    Always gated behind explicit confirmation at the agent/permission layer
    (see ALWAYS_GATED_ACTIONS) — never call this directly from a tool
    handler without going through the confirmation flow.
    """
    _require_enabled()
    result = subprocess.run(command, shell=True, capture_output=True, text=True, timeout=timeout)
    return {"stdout": result.stdout[-5000:], "stderr": result.stderr[-5000:], "returncode": result.returncode}
