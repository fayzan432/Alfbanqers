# JARVIS

A production-grade, modular personal AI assistant inspired by Iron Man's
JARVIS — voice + text interaction, a reactive animated orb UI, long-term
memory, computer/browser automation, vision, and a plugin system for adding
new skills without touching core code.

**Runs entirely free by default.** The AI reasoning model, embeddings,
speech-to-text, and text-to-speech are all free/local/open-source with no
API key required (see [Free by default](#free-by-default) below). Paid
providers (OpenAI, Anthropic) are supported as opt-in, bring-your-own-key
alternatives — never a requirement.

## Architecture

```
Alfbanqers/
├── backend/            FastAPI application (Python)
│   ├── app/
│   │   ├── core/        config, security (JWT), permissions, logging
│   │   ├── db/          SQLAlchemy async engine/session, declarative base
│   │   ├── models/      ORM models (users, conversations, memory, tasks, ...)
│   │   ├── schemas/     Pydantic request/response models
│   │   ├── api/         FastAPI routers (one module per feature)
│   │   ├── ai/          provider abstraction, reasoning/tool-calling agent
│   │   ├── memory/      Chroma vector store + embeddings + memory tools
│   │   ├── voice/       Whisper STT, TTS, wake-word detection
│   │   ├── vision/      webcam, screen, OCR, detection, face recognition
│   │   ├── automation/  computer control, file manager, browser agent
│   │   ├── plugins/     plugin loader + base class
│   │   └── services/    system monitor, email, cross-cutting agent tools
│   └── plugins_dir/     drop-in plugins (see "Writing a plugin" below)
├── frontend/           Next.js 14 + TypeScript + Tailwind + R3F application
│   └── src/
│       ├── app/          routes (App Router): /, /login, /register, /dashboard/*
│       ├── components/   orb (Three.js/shaders), chat, dashboard panels, layout, ui
│       ├── hooks/        voice pipeline (mic capture, wake word, WS), auth
│       ├── lib/          API client, audio utilities, shared types
│       └── store/        Zustand global state (orb state, auth, amplitude)
├── docker-compose.yml   Postgres + Ollama + backend + frontend
└── .env.example         every environment variable, documented
```

## Free by default

| Capability     | Default (free)                                          | Optional paid alternative      |
| -------------- | --------------------------------------------------------- | ------------------------------- |
| Reasoning/chat | Local model via [Ollama](https://ollama.com) (`AI_PROVIDER=local`) | OpenAI / Anthropic (bring your own API key) |
| Embeddings/memory | `sentence-transformers` running locally on CPU        | OpenAI embeddings API           |
| Speech-to-text | `faster-whisper`, fully offline                           | —                                |
| Text-to-speech | `edge-tts` (free, no key) or `pyttsx3` (fully offline)     | —                                |
| Vision (OCR, faces) | Tesseract OCR + OpenCV Haar cascades / LBPH, all offline | —                                |
| Browser agent  | Playwright (Chromium), self-hosted                          | —                                |

Nothing in this stack requires a credit card. Set `AI_PROVIDER=openai` or
`AI_PROVIDER=anthropic` with an API key in `.env` only if you want to swap in
a hosted model.

## Quick start (local, no Docker)

1. **Install Ollama** and pull a model (this is what makes chat free/local):
   ```bash
   ollama pull llama3.1
   ollama serve
   ```
2. **Backend**
   ```bash
   cd backend
   python -m venv .venv && source .venv/bin/activate
   pip install -r requirements.txt
   cp ../.env.example .env   # defaults already point at Ollama + SQLite
   uvicorn app.main:app --reload
   ```
   First run downloads the local embedding model and Whisper weights — this
   happens once and is cached under `backend/data/`.
3. **Frontend**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
4. Open `http://localhost:3000`, register an account, and say "Jarvis" or
   type a message.

## Quick start (Docker Compose)

```bash
cp .env.example .env
docker compose up -d
docker compose exec ollama ollama pull llama3.1
```

Then open `http://localhost:3000`.

> **Computer-control automation note:** `open_application`, mouse/keyboard
> control, and screenshots (`app/automation/computer.py`) operate on the OS
> the backend process runs in. Inside a headless Docker container there is
> no desktop to control, so those specific actions will fail there even
> with `AUTOMATION_ENABLED=true`. For full computer control, run the
> backend natively on your desktop (the "Quick start, no Docker" path
> above) rather than in a container. Chat, memory, tasks/calendar/notes,
> the browser agent, and webcam/screen vision (if a camera/display is
> passed through) all work fine in Docker.

## Security model

- JWT-based auth; every API route (except register/login) requires a
  bearer token.
- `AUTOMATION_ENABLED` (Settings → off by default) is the master switch for
  any action that controls the OS — mouse, keyboard, opening/closing apps.
- Regardless of that switch, a fixed set of actions **always** requires an
  explicit confirmation round-trip before executing: deleting a file,
  sending an email, running a terminal command, and logging into a website
  (see `app/core/permissions.py::ALWAYS_GATED_ACTIONS`). The agent creates a
  short-lived pending confirmation token and returns it to the UI instead of
  acting; the user must approve it (`ConfirmBanner` in the UI, or
  `/api/chat/confirm`) before anything happens.
- Email/IMAP credentials are encrypted at rest (`app/services/crypto.py`).
- Face recognition is gated behind an explicit `FACE_RECOGNITION_CONSENT`
  flag — off by default.

## Writing a plugin

Drop a new folder into `backend/plugins_dir/`:

```
plugins_dir/my_plugin/
  manifest.json
  plugin.py
```

`plugin.py` must define a `Plugin` class extending `app.plugins.base.BasePlugin`
and implement `register_tools(registry)`, calling `registry.register(...)`
for each new tool. See `backend/plugins_dir/datetime_tools/` for a complete,
working example (date/time lookup + a safe calculator). No core application
code needs to change — enable/disable plugins live from the Plugins panel.

## Environment variables

See [`.env.example`](.env.example) for the full, documented list (AI
provider, database, voice, vision, automation, email defaults).

## Tech stack

**Frontend:** Next.js 14, React 18, TypeScript, Tailwind CSS, Framer Motion,
Three.js, React Three Fiber, Zustand.

**Backend:** Python, FastAPI, SQLAlchemy (async), Alembic-ready schema,
JWT auth.

**Database:** SQLite by default (zero setup, `USE_SQLITE=true`); PostgreSQL
for production (`USE_SQLITE=false` + `DATABASE_URL`).

**Memory:** Chroma (embedded, persistent) vector store.

**Speech:** faster-whisper (STT), edge-tts/pyttsx3 (TTS).

**Vision:** OpenCV, mss (screen capture), pytesseract (OCR).

**Automation:** PyAutoGUI (computer control), Playwright (browser agent).

**Deployment:** Docker + Docker Compose.
