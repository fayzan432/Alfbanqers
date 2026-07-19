"""Autonomous browser agent built on Playwright: search, read, summarize,
fill forms, log in (with user-supplied credentials, gated), download files.
"""
from __future__ import annotations

from pathlib import Path
from urllib.parse import quote_plus

from playwright.async_api import async_playwright

from app.core.config import settings

DOWNLOAD_DIR = Path("./data/downloads")


class BrowserSession:
    """Thin async context manager around a headless Chromium instance."""

    def __init__(self, headless: bool = True) -> None:
        self.headless = headless
        self._playwright = None
        self._browser = None

    async def __aenter__(self) -> "BrowserSession":
        self._playwright = await async_playwright().start()
        self._browser = await self._playwright.chromium.launch(headless=self.headless)
        return self

    async def __aexit__(self, *exc) -> None:
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()

    async def new_page(self):
        return await self._browser.new_page()


async def search_web(query: str, max_results: int = 5) -> list[dict]:
    async with BrowserSession() as session:
        page = await session.new_page()
        await page.goto(f"https://duckduckgo.com/html/?q={quote_plus(query)}", wait_until="domcontentloaded")
        results = await page.eval_on_selector_all(
            "a.result__a",
            "els => els.map(e => ({title: e.innerText, url: e.href}))",
        )
        return results[:max_results]


async def read_page(url: str, max_chars: int = 8000) -> dict:
    async with BrowserSession() as session:
        page = await session.new_page()
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        title = await page.title()
        text = await page.evaluate("document.body ? document.body.innerText : ''")
        return {"url": url, "title": title, "text": text[:max_chars]}


async def summarize_page(url: str) -> dict:
    page_data = await read_page(url, max_chars=12000)

    from app.ai.base import AIMessage
    from app.ai.factory import get_ai_provider

    provider = get_ai_provider()
    prompt = f"Summarize this webpage in 3-5 sentences.\n\nTitle: {page_data['title']}\n\nContent:\n{page_data['text']}"
    completion = await provider.complete([AIMessage(role="user", content=prompt)])
    return {"url": url, "title": page_data["title"], "summary": completion.content.strip()}


async def fill_form(url: str, fields: dict[str, str], submit_selector: str | None = None) -> dict:
    async with BrowserSession() as session:
        page = await session.new_page()
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        for selector, value in fields.items():
            await page.fill(selector, value)
        if submit_selector:
            await page.click(submit_selector)
            await page.wait_for_load_state("domcontentloaded")
        return {"url": page.url, "filled_fields": list(fields.keys()), "submitted": bool(submit_selector)}


async def login_to_site(
    url: str, username_selector: str, password_selector: str, username: str, password: str, submit_selector: str
) -> dict:
    """Logs into a site using credentials the user explicitly supplied for
    this call. Always gated behind confirmation (browser_login is in
    ALWAYS_GATED_ACTIONS) — never call without going through that flow.
    """
    async with BrowserSession() as session:
        page = await session.new_page()
        await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        await page.fill(username_selector, username)
        await page.fill(password_selector, password)
        await page.click(submit_selector)
        await page.wait_for_load_state("domcontentloaded")
        return {"url": page.url, "logged_in": True}


async def download_file(url: str, filename: str | None = None) -> str:
    DOWNLOAD_DIR.mkdir(parents=True, exist_ok=True)
    async with BrowserSession() as session:
        page = await session.new_page()
        async with page.expect_download() as download_info:
            await page.goto(url, wait_until="domcontentloaded", timeout=30000)
        download = await download_info.value
        target = DOWNLOAD_DIR / (filename or download.suggested_filename)
        await download.save_as(str(target))
        return str(target)
