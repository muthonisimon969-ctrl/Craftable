# Zuno Production Integration Reconciliation Log

## Branch baseline
- Integration branch: `zuno/prod-integration-v1`
- Base branch: `main`
- Recorded main HEAD at branch creation: `22f38a2595c977c8a8164c9d96d3a26768ef64e5`
- Branch created from `main`; main was not modified.
- No production merge or deployment has been performed.

## PR reconciliation
| Source | Decision | Evidence / notes |
|---|---|---|
| PR #5 — project conversation safety | Selected as the starting implementation for its project_chat route, read-only request guard, conversation persistence helper, and project-chat workspace flow. | PR #5 is open and based on main. Its browser-level behavior remains unverified. |
| PR #7 — product presentation | Keep the product-presentation prompt improvements; reconcile them into the server-side build prompt used by PR #5. | PR #7 is open and based on main. |
| PR #7 — `general` in electronics whitelist | Rejected. | Read-only audit of `public.zuno_asset_library` found **0 general rows** (0 active). The actual table has a dedicated `smartphones` category with 1 active asset, so `smartphones` was added to the electronics whitelist instead. |
| Category-first matcher | Must be implemented explicitly. | Filter active assets, then category pool, then perform keyword matching only inside that pool. No cross-category fallback. |

## Scope protections
- Preserve Zuno's existing dark UI, colors, navigation, and working features.
- No changes to Supabase schema, bucket, URL policy, or permissions.
- No Vercel Blob or other storage changes.
- No provider/model changes.
- No changes to the IR pipeline in this track.
- Do not merge to main until the Track B gates pass.

## Verification status
- [x] Main HEAD recorded.
- [x] Integration branch created from main.
- [x] PR #5 conversation and persistence changes copied onto this branch; PR #7 product-presentation guidance reconciled into the server build prompt.
- [x] Category matcher filters active assets and resolves explicit product terms to exact library categories (e.g. laptop → `laptops`, smartphone → `smartphones`, rice → `rice-dishes`) before title/category keyword scoring. Generic industry briefs use only their own category family; unknown briefs require a direct match rather than receiving the mixed library.
- [x] Prompt asset list, commerce image QA requirements, and final image-URL sanitizer all use the same category-scoped asset selection. Unselected active assets cannot leak through URL sanitization.
- [ ] 20 electronics prompt tests against the running builder: not yet run.
- [ ] 20 conversation tests in Workspace: not yet run.
- [ ] Conversation persistence after reload (not yet run).
- [x] TypeScript and Vite production build passed on code commit `9a749cccb112d1dcac2812697e0d47e5b1f88dc7`; Vercel preview reached READY.
- [ ] Browser-level project-chat, IndexedDB persistence, and live image-selection verification remain outstanding.
- [ ] Merge gate review.

## Supabase library audit (read-only)
- Project: `Zuno AI` (`vlrpiosbqssfnycutzje`).
- `public.zuno_asset_library` category counts confirmed `general_total = 0` and `general_active = 0`.
- The actual catalog has a dedicated `smartphones` category with 1 active row; that category is included explicitly rather than using `general` as a catch-all.
- No Supabase rows, schema, bucket, URL, or permission settings were changed.

## Preliminary source-level smoke checks (not end-to-end)
- [x] 20 representative electronics prompts matched the electronics-intent rule (20/20); a synthetic active/inactive/general/fashion asset pool selected only active electronics categories.
- [x] 20 fashion prompts and 20 food prompts matched their category-intent rules (20/20 each), including singular `shoe`, `belt`, `dress`, and `curry` terms.
- [x] Exact product-category routing smoke checks passed 20/20 for each of electronics, fashion, and food; 20/20 conversation classification checks passed.
- [x] 20 representative project-chat prompts matched the intended read-only vs explicit-edit classification (20/20).
- These checks exercise the rule patterns and category whitelist with synthetic fixtures; they do not replace live API, IndexedDB persistence, browser, or Vercel preview tests.

## Implementation commits
- PR #5 conversation/persistence implementation and PR #7 presentation guidance are on this branch, with targeted fixes for request classification, unchanged-project detection, and category-scoped image enforcement.
- Latest matcher implementation commit before this log update: `b0c22082a765725de16362509fe9cf97aad446a7`.
- Exact-category matcher changes after `9a749...` still require their own Vercel preview build confirmation.
- Vercel TypeScript + Vite build passed for code commit `9a749cccb112d1dcac2812697e0d47e5b1f88dc7` (preview READY).
- Vercel's build log reported 4 high-severity npm audit findings and an esbuild install-script warning; dependency changes were intentionally left out of scope.
- Git integration automatically generated Vercel preview deployments for branch commits. No production deployment, promotion, or merge was performed.

## Known review risks to resolve
- [x] Corrected PR #5's double-escaped word-boundary expressions in the request classifier.
- [x] Read-only turns append messages without calling `applyIterationTurn`; the Workspace additionally verifies all project code/title/description are unchanged before taking that path.
- [x] An empty or unmatched category pool returns no assets; keyword matching is confined to the filtered pool.
- A successful TypeScript build is not proof of conversation safety or visual quality.
- [x] No Workspace layout or palette/navigation redesign was taken.
- [!] Important baseline discrepancy: current `main` at `22f38a2` already contains `const isWideScreen = true` in `WorkspacePage.tsx`; the responsive width detection described in the earlier plan is not present on the actual base branch. Track B inherits this pre-existing behavior unchanged. Do not silently alter it in this production-safety track; review restoration of responsive detection as a separate explicitly approved UI fix.
- [x] Electronics whitelist excludes `general`; Supabase audit confirmed there are 0 `general` rows and 0 active `general` rows.
- [x] Added the real `smartphones` category to the electronics whitelist after confirming its active library asset.
