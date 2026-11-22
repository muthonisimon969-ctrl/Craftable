# Zuno AI

**Zuno AI** — *Chat. Think. Create. Build. Imagine it. Describe it. Build it with Zuno.*

Zuno AI is a responsive **React + TypeScript + Vite** all-in-one AI workspace deployed to **Vercel** (`vercel.json` SPA routing + `/api/*` serverless functions) with PWA support (`/public/manifest.webmanifest` and `/public/sw.js`).

## Unified Capabilities
- **Minimal Home Canvas (`/`):** Centered intelligent prompt composer with multimodal file/image attachments (`Paperclip`), Chat / Build / 3D Scene / Image mode selector, and no cluttered template walls.
- **Chat & Think (`/chat`):** Natural AI conversations, architecture planning, multimodal image/file understanding, and one-click handoff to Build an App or Create a 3D Experience.
- **Build Workspace (`/workspace/:id`):** Split-screen AI chat + live preview + multi-file code explorer (`index.html`, `styles.css`, `app.js`), preview console logs, and standalone HTML export.
- **Create Studio (`/create` & `/creative/:id`):** Interactive **Three.js** 3D games, product showcases, and animated environments plus real Gemini **AI Image Generation** (`gemini-2.5-flash-image`) with PNG download.
- **Projects & Optional Explore (`/projects`, `/explore`):** Search, star, rename, delete, or inspect example websites and Three.js experiments off the main homepage.
- **Owner-Only Admin Key Vault (`/admin` & `/settings`):** Server-side password-protected API key control (`/api/admin`). Keys remain write-only on the server and are never exposed to client JS or browser storage.

## Private Design Intelligence

Build and 3D generation can receive an additional private instruction from the server environment variable `ZUNO_DESIGN_INTELLIGENCE_PROMPT`. This value is read only by `/api/craft`, is never returned to the browser, and is not stored in this repository. Configure it directly in Vercel Project Settings → Environment Variables. Do not put private prompts, asset URLs, or credentials in client-side files or commit them to this public repository.

This is a private instruction layer, not private image storage. To keep original asset files private, connect a private object-storage bucket (for example, a bucket with public access disabled) and serve only the required website-ready derivatives. Any image rendered on a published public website can still be saved by its visitors.

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
3. `vercel.json` excludes `/api/*` and `/vendor/*` from SPA rewrites so `/api/craft`, `/api/admin`, and `/vendor/three-studio-runtime.js` are served cleanly while client routes serve `/index.html`.
