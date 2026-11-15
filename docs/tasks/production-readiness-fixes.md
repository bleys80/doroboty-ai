# Production readiness fixes before publishing

Slug: `production-readiness-fixes`
Created: 2026-11-15
Source: first production-readiness audit (`docs/production-readiness.html`), decision by the fork owner: "A plus .gitattributes, hosting GitHub Pages". No commit, push or deployment in this task.

## Goal

Remove the preparation blockers that can be fixed in the repository, so the version prepared for GitHub Pages has a green quality gate, a visible recovery path after unexpected errors and a written release, smoke and rollback procedure.

## Changes

- `.gitattributes`: `* text=auto eol=lf` plus binary assets, so the Windows checkout (`core.autocrlf=true`) no longer breaks formatting and byte-hash checks. Index content was already LF (`git add --renormalize .` changed nothing); only working files were rewritten.
- `FEATURES.md`: Prettier formatting of the EMP-13 row (failed `format:check` on the committed version); new SYS-12 entry.
- `src/features/prototype/error-boundary.tsx`, `src/main.tsx`: top-level error boundary with a Polish recovery screen (refresh, homepage, raw save download). Independent from scenario state and router; no network, no extra logging.
- `tests/e2e/error-screen.spec.ts`: forces a render failure through `Intl.DateTimeFormat.prototype.format`, checks the screen, unchanged save, download, focus and 390 px layout.
- `docs/RELEASE.md`: GitHub Pages procedure, suggested workflow (not added), smoke check, rollback and incident steps, provider limits checked on 2026-11-15.

- `.github/workflows/pages.yml` (added after the owner's request): manual and `main`-push publication of the verified `dist/` to GitHub Pages; build job read-only, deploy job with `pages: write` and `id-token: write`, environment `github-pages`. Action versions from GitHub Docs (2026-11-15). Not run yet: Pages is not enabled and nothing is pushed.
- FEATURES.md register reviewed for the workflow: no product behavior changes, so no new entry (tooling only; SYS-06 still describes the gate).

## Acceptance criteria

- [x] `npm run check` exits 0 in this Windows checkout.
- [x] Unexpected render error shows the recovery screen on desktop and at 390 px; the browser save is unchanged.
- [x] FEATURES.md describes the new behavior.
- [x] Release, smoke and rollback steps are written for GitHub Pages.

## Open (owner decisions, not code)

Audience (course group) and incident owner (fork owner) were confirmed on 2026-11-15. Still open: a support channel line in the app (recommendation), enabling Pages, the first deployment, a rollback trial and the deployment-stage checks in the next quest.
