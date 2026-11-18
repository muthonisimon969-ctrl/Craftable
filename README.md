# Zuno AI Studio

**Zuno AI** — *Idea to interactive website, web app, or 3D game in seconds.*

Zuno AI is a responsive **React + TypeScript + Vite** AI builder deployed to **Vercel** (zero 404 errors via `vercel.json` SPA rewrites) with PWA support (`/public/manifest.webmanifest` and `/public/sw.js`). Your preserved Android reference source (`app/`) remains intact.

## Key Features
- **Prompt Studio & Zuno AI (`/api/craft`):** Generates and iterates multi-file HTML, CSS, and JavaScript web apps, dashboards, manual M-Pesa storefronts, and interactive 3D browser games with a 6-check QA audit.
- **Owner-Only Admin Control (`/admin`):** Server-side password-protected vault (`/api/admin`) where only the owner can paste one or more Gemini API keys (`ZUNO_ADMIN_PASSWORD` + optional `VERCEL_TOKEN`/`VERCEL_PROJECT_ID`, Vercel KV, or `GEMINI_API_KEY`). Keys are write-only and are never exposed to customers or browser storage.
- **AI Template Library (with 3D Game Studio):** Pick a design blueprint (**Use with AI**) to guide Zuno AI generation or launch a starter (**Starter**) to customize in AI chat—including **3D Game Studio**, **Savanna Manual Pay**, **Maison Atelier**, **PulseMetrics SaaS**, **Osteria Solis**, **Meridian Advisory**, and **FlowLedger Studio**.
- **Responsive Multi-Mode Workspace:**
  - **Mobile/Tablet (< 900px):** 3-tab switcher (`Chat`, `Preview`, `Code`).
  - **Desktop/Wide (>= 900px):** Split-pane `BuilderChatPane` + `Preview / Code` with Fullscreen preview toggle.
- **Full-Bleed Live Preview & Console:** Sandboxed iframe with live console capture (`zuno-console`) and standalone HTML export.

## Local Development
```bash
npm install
npm run dev
```

## Deploying to Vercel
1. Push this repository to GitHub and import into **Vercel** (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
2. Under **Project Settings → Environment Variables**, configure:
   - `ZUNO_ADMIN_PASSWORD` (required to unlock `/admin`)
   - `GEMINI_API_KEY` or `GEMINI_API_KEYS` (server-side Gemini keys), and optionally `VERCEL_TOKEN` + `VERCEL_PROJECT_ID` (or Vercel KV env vars) for persistent updates from `/admin`.
3. `vercel.json` excludes `/api/*` from SPA rewrites so `/api/craft` and `/api/admin` always reach your serverless functions while client routes (`/workspace/:id`, `/admin`) serve `/index.html`.
