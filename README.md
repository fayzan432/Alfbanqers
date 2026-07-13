# LEVEL UP MULLICK

**Train. Evolve. Ascend.**

A dark fantasy RPG-themed fitness, habit, nutrition, and self-improvement platform. Complete quests, log workouts, track nutrition and hydration, earn XP, level up, unlock ranks, maintain streaks, collect achievements, and spend Ascension Coins on rewards you set for yourself.

This is an original application. It uses the general concept of RPG progression (levels, ranks, XP) but does not copy any artwork, characters, names, or interface elements from any existing anime, game, or franchise.

---

## 1. Project Overview

LEVEL UP MULLICK turns real-life fitness and discipline into an RPG progression system:

- Create an account and sign in securely (Supabase Auth)
- Complete an onboarding flow that sets up your body stats and daily targets
- Create quests (goals), complete them, and earn XP + Ascension Coins
- Level up, unlock ranks (E → D → C → B → A → S → Ascendant), and grow five attributes (Strength, Endurance, Discipline, Agility, Consistency)
- Log workouts (including strength training with sets/reps/weight), nutrition, water, and weight
- Maintain streaks, unlock achievements, and redeem personal rewards
- View analytics, a monthly calendar, and a full activity history
- Export your data as JSON at any time
- Use the app on desktop, laptop, tablet, Android, and iPhone — and install it as a PWA

All calorie, macro, and body calculations shown in the app are **estimates only** and are **not medical advice**.

## 2. Main Features

- Email/password authentication with password reset, protected routes, and persistent sessions
- Onboarding wizard (body stats, activity level, goal, units, calorie/macro/water targets)
- Quests: create/edit/delete/complete/archive, with categories, difficulty, XP/coin rewards, recurrence (one-time/daily/weekly/weekdays/custom interval), and progress types
- Atomic, duplicate-proof quest and workout completion (server-side Postgres functions) that award XP/coins, grow attributes, and advance streaks
- XP/Level/Rank system with an original rank-badge system
- Workout tracking with strength exercises, sets/reps/weight, templates, duplication, and personal records
- Nutrition tracking with custom foods, saved/favorite foods, daily macro progress, and a Mifflin-St Jeor BMR/TDEE calorie calculator
- Water tracking with quick-add buttons and a weekly chart
- Weight tracking with a trend chart and target-weight progress
- Reminders with in-app and (permission-gated) browser notifications
- 12 achievements, unlocked automatically server-side
- Ascension Coins + a personal rewards vault with confirm-before-redeem
- Full activity history with filters, a monthly calendar, and analytics charts
- JSON data export
- Installable PWA with an offline fallback page
- Dark fantasy theme (plus a reduced-glow dark theme and a light theme), respecting `prefers-reduced-motion`

## 3. Technology Stack

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- React Router v7
- Supabase (Auth, Postgres, Row Level Security)
- TanStack Query
- React Hook Form + Zod
- Recharts
- Lucide React icons
- date-fns

## 4. Required Software

- [Node.js](https://nodejs.org/) 20 or later (Node 22 recommended)
- npm (bundled with Node.js)
- A free [Supabase](https://supabase.com/) account
- A free [Netlify](https://www.netlify.com/) account (for deployment)
- Git

## 5. Installing Node.js

- **Windows/Mac:** download the LTS installer from [nodejs.org](https://nodejs.org/) and run it.
- **Mac (Homebrew):** `brew install node`
- **Linux:** use [nvm](https://github.com/nvm-sh/nvm): `curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash` then `nvm install --lts`

Verify with:

```bash
node --version
npm --version
```

## 6. Installing Dependencies

From the project root:

```bash
npm install
```

## 7. Running the App Locally

```bash
npm run dev
```

Open the printed local URL (typically `http://localhost:5173`). You'll need a configured `.env` file (see below) for authentication and data to work.

## 8. Building the App

```bash
npm run build
```

This runs a TypeScript check (`tsc -b`) and then `vite build`, producing a static site in `dist/`. Preview the production build locally with:

```bash
npm run preview
```

## 9. Creating a Supabase Project

1. Go to [supabase.com](https://supabase.com/) and sign in.
2. Click **New Project**.
3. Choose an organization, name the project (e.g. `level-up-mullick`), set a strong database password, and pick a region close to you.
4. Wait for provisioning to finish (a couple of minutes).

## 10. Running the SQL Migrations

The SQL files in `supabase/migrations/` create every table, index, trigger, Row Level Security policy, and Postgres function the app needs — run them **in order**.

**Option A — Supabase SQL Editor (simplest):**

1. Open your project in the Supabase dashboard.
2. Go to **SQL Editor** → **New query**.
3. Open each file in `supabase/migrations/` in numeric order (`0001_...sql`, `0002_...sql`, …) and run its contents one at a time.

**Option B — Supabase CLI:**

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

Migrations are idempotent-ish (`create table if not exists`, `on conflict do nothing` for seed data) but still run them in order the first time.

## 11. Getting Supabase Environment Variables

In your Supabase project dashboard:

1. Go to **Project Settings** → **API**.
2. Copy the **Project URL** → this is `VITE_SUPABASE_URL`.
3. Copy the **anon public** key (under Project API keys) → this is `VITE_SUPABASE_ANON_KEY`.

**Never use the `service_role` key in the frontend.** Only the anon/public key is safe to ship in a browser bundle — Row Level Security policies (created by the migrations) are what actually protect user data.

## 12. Creating the `.env` File

Copy the example file and fill in your values:

```bash
cp .env.example .env
```

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

`.env` is git-ignored — never commit real credentials.

## 13. Deploying on Netlify

1. Push this repository to GitHub (or GitLab/Bitbucket).
2. In Netlify, click **Add new site** → **Import an existing project**.
3. Connect your git provider and select the repository.
4. Build settings should be auto-detected from `netlify.toml`:
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Add environment variables (see below) **before** the first deploy, or trigger a redeploy after adding them.
6. Deploy.

`netlify.toml` already includes the SPA fallback (`/* → /index.html`) so React Router works correctly on refresh and direct links to any route.

## 14. Adding Environment Variables in Netlify

1. Site settings → **Environment variables** → **Add a variable**.
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` with the same values as your local `.env`.
3. Redeploy the site (Netlify only bakes env vars in at build time, since Vite inlines `VITE_*` variables into the built JS).

## 15. Connecting Netlify to GitHub

In Netlify: **Add new site → Import an existing project → GitHub**, authorize Netlify's GitHub app, and pick this repository. Every push to your production branch will trigger an automatic build and deploy.

## 16. Manual Drag-and-Drop Deployment

If you'd rather not connect a git provider:

```bash
npm run build
```

Then drag the generated `dist/` folder onto the **Sites** page in the Netlify dashboard (the "drag and drop" drop zone). Note: with manual deploys you must set environment variables in Netlify and rebuild locally with them present (`.env`) before dragging, since Vite bakes `VITE_*` vars in at build time.

## 17. Testing Mobile Responsiveness

- Use your browser's device toolbar (Chrome/Edge DevTools → Toggle device toolbar, or Firefox's Responsive Design Mode) to test common breakpoints (360px, 390px, 768px, 1024px, 1280px+).
- On mobile widths, navigation moves to a bottom tab bar with a "More" sheet for secondary sections; on desktop (`lg` breakpoint and up) a sidebar is shown instead.
- Test on a real Android phone and iPhone if possible — visit the deployed Netlify URL in Chrome/Safari, and try "Add to Home Screen" to confirm the PWA installs and opens in standalone mode.
- Check that dialogs/modals, forms, and charts remain usable and don't overflow horizontally at narrow widths.

## 18. Features Complete

Everything described in section 2 above is implemented and functional against a properly configured Supabase project: auth, onboarding, quests/XP/levels/ranks, streaks, workouts (with strength exercises/sets/templates/personal records), nutrition/calorie calculator, water, weight, reminders + browser notifications, achievements, coins + rewards, history, analytics, calendar, data export, settings (profile/goals/appearance/reset/delete), and PWA installability with an offline fallback page.

## 19. Features Left Incomplete / Known Limitations

- **Full account deletion:** the frontend can (and does, via Settings → Delete Account) erase all of a user's application data using a Row-Level-Security-scoped Postgres function. Removing the underlying Supabase **auth** user record requires the `service_role` key, which must never be shipped to the browser — that step needs a small trusted server component (e.g. a Supabase Edge Function you deploy yourself) that isn't included in this static-site build.
- **Food data:** nutrition entries are manually entered or picked from your own saved foods — there's no third-party nutrition database integration (by design, per the v1 scope).
- **Exact-time browser reminders:** browser notifications only fire while a tab is open (this is a browser platform limitation, not specific to this app) — the app is upfront about this in the Reminders page and always shows upcoming reminders in-app as a fallback.
- **PWA icons** are original placeholder SVGs; swap `public/icons/icon-192.svg` / `icon-512.svg` (and regenerate PNG equivalents if you want maximum iOS home-screen icon compatibility) with your own branded artwork before a public launch.
- **Data import** (re-importing a previously exported JSON file) is intentionally left for a later milestone, as noted in the original spec.

## 20. Common Errors & Troubleshooting

**Blank page / "Supabase environment variables are missing" console warning**
`.env` is missing or the dev server wasn't restarted after adding it. Confirm `.env` exists at the project root and restart `npm run dev`.

**Login/signup does nothing, or console shows a CORS/network error**
Double-check `VITE_SUPABASE_URL` has no trailing slash and matches your project exactly. Confirm the Supabase project is not paused (free-tier projects pause after inactivity — resume it in the dashboard).

**"new row violates row-level security policy" errors**
A migration didn't fully run, or you're operating on another user's row. Re-run the migrations in order from the SQL Editor and confirm no step errored out.

**Signing up creates an account but there's no profile row / onboarding loops**
Confirm `0001_profiles.sql` ran successfully — it creates the `handle_new_user` trigger that auto-creates a profile row on signup. If you created users before running migrations, they won't have a profile; delete and recreate the test user, or manually insert a profile row.

**React Router 404s / blank page after refreshing a route like `/goals` on Netlify**
Confirm `netlify.toml`'s `[[redirects]]` block (`/* → /index.html`, status 200) deployed correctly — check the "Redirects" tab in your Netlify deploy log.

**Build fails with a TypeScript error**
Run `npm run build` locally and read the first reported error — it will point to a specific file/line. Ensure your Node version is 20+.

**Service worker seems stuck on an old version**
Service workers only update on a full reload after a new one activates. In DevTools → Application → Service Workers, click "Unregister" and hard-refresh if you're testing PWA changes locally against a production build (`npm run build && npm run preview`).

**Notifications never appear**
Browser notifications require explicit permission (Settings → Appearance & Notifications, or the banner on the Reminders page) and only fire while a browser tab for the app is open — this is a browser limitation, not a bug.

---

## Environment Variables Reference

| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project's URL |
| `VITE_SUPABASE_ANON_KEY` | Your Supabase project's public anon key (never the service role key) |

## Project Structure

```
src/
  components/    Shared UI (buttons, panels, modals) and layout (sidebar, bottom nav)
  features/      One folder per domain: auth, onboarding, dashboard, goals, workouts,
                 nutrition, water, weight, player, achievements, rewards, reminders,
                 analytics, calendar, history, settings
  hooks/         Shared React hooks (online status, notification permission)
  lib/           Supabase client, TanStack Query client
  services/      Supabase data-access functions, grouped by domain
  types/         Shared TypeScript types mirroring the Postgres schema
  utils/         Pure logic: XP/level/rank math, streaks, date/timezone, unit
                 conversion, BMR/TDEE, attribute gains
supabase/
  migrations/    Numbered SQL migrations — tables, RLS policies, triggers, functions
public/
  manifest.webmanifest, sw.js, offline.html, icons/   PWA assets
```
