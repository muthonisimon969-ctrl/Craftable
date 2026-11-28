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
| PR #7 — `general` in electronics whitelist | Rejected. | Electronics category whitelist remains electronics-only; no general assets are admitted by default. |
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
- [x] Category matcher filters active assets and category pool before keyword matching; no cross-category fallback.
- [x] Prompt asset list, commerce image QA requirements, and final image-URL sanitizer all use the same category-scoped asset selection. Unselected active assets cannot leak through URL sanitization.
- [ ] 20 electronics prompt tests: zero wrong-category assets (not yet run).
- [ ] 20 conversation tests: zero accidental rebuilds and zero version increments (not yet run).
- [ ] Conversation persistence after reload (not yet run).
- [ ] TypeScript and production build checks (Vercel branch check currently pending).
- [ ] Preview/browser verification (automatic Vercel preview check has started; not yet confirmed ready).
- [ ] Merge gate review.

## Implementation commits
- PR #5 conversation/persistence implementation and PR #7 presentation guidance are on this branch, with targeted fixes for request classification, unchanged-project detection, and category-scoped image enforcement.
- Latest implementation commit: `f3bab049e92664d0bef4a8611b61d13105f749aa`.

## Known review risks to resolve
- [x] Corrected PR #5's double-escaped word-boundary expressions in the request classifier.
- [x] Read-only turns append messages without calling `applyIterationTurn`; the Workspace additionally verifies all project code/title/description are unchanged before taking that path.
- [x] An empty or unmatched category pool returns no assets; keyword matching is confined to the filtered pool.
- A successful TypeScript build is not proof of conversation safety or visual quality.
- [x] No Workspace layout or palette/navigation redesign was taken.
- [!] Important baseline discrepancy: current `main` at `22f38a2` already contains `const isWideScreen = true` in `WorkspacePage.tsx`; the responsive width detection described in the earlier plan is not present on the actual base branch. Track B inherits this pre-existing behavior unchanged. Do not silently alter it in this production-safety track; review restoration of responsive detection as a separate explicitly approved UI fix.
- [x] Electronics whitelist excludes `general`.
