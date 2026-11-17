# Craftable Web Studio

**Craftable** — *Idea to interactive app in seconds.*

This repository contains the complete, responsive **React + TypeScript + Vite** web version of Craftable, ready to deploy to **Vercel** (zero 404 errors via `vercel.json` SPA rewrites) and structured with a Web App Manifest and Service Worker (`/public/manifest.webmanifest` and `/public/sw.js`) for Progressive Web App (PWA) installability. Your existing Android source (`app/`) is preserved intact.

## Key Features Preserved
- **Prompt Studio & Craft AI (`/api/craft` + optional browser key):** Generates and iterates interactive multi-file HTML, CSS, and JavaScript web applications with a 6-check QA audit (`WebQualityValidator`).
- **6 Curated Studio Templates:** Includes **Savanna Manual Pay** (KSh pricing, Till `5829140` / Paybill `400200`, M-Pesa confirmation code checkout & Owner Verify tab without Daraja API), **Maison Atelier**, **PulseMetrics SaaS**, **Osteria Solis**, **Meridian Advisory**, and **FlowLedger Studio**.
- **Responsive Multi-Mode Workspace:**
  - **Mobile/Tablet (< 900px):** 3-tab switcher (`Chat`, `Preview`, `Code`).
  - **Desktop/Wide (>= 900px):** Split-pane `BuilderChatPane` + `Preview / Code` with Fullscreen toggle.
- **Full-Bleed Live Preview & Console:** Sandboxed iframe with live `console.log/warn/error` capture and standalone HTML export/share.
- **Local Project Persistence:** IndexedDB (with `localStorage` fallback) for projects, versions, starring, renaming, deleting, and conversation history.

## Local Development
```bash
npm install
npm run dev
```

## Deploying to Vercel (No 404s)
1. Push this repository to GitHub.
2. Import the repository in **Vercel** (Framework Preset: **Vite**, Build Command: `npm run build`, Output Directory: `dist`).
3. *(Optional for server-hosted Craft AI)* Add `GEMINI_API_KEY` under **Project Settings → Environment Variables** in Vercel. Users can also configure a personal Gemini key directly in the browser via the **Studio** pill in the top bar.
4. `vercel.json` automatically rewrites client routes such as `/workspace/:id` to `/index.html`, preventing 404 errors on page reload.
