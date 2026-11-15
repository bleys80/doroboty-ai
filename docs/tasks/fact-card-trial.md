# Fact card selection test (P1) for Punkt Labs

Slug: `fact-card-trial`
Created: 2026-11-15
Brief: [karta-faktow.md](karta-faktow.md) (v1, Polish, handed over from the course vault; not edited here). Data: [karta-faktow-dane.json](karta-faktow-dane.json), copied with unchanged content to `src/features/prototype/data/punkt-labs-trial.json` because the participant package excludes `docs/tasks`. A unit test compares both files when the hand-over file exists.

## Goal

Let a test participant act as the Punkt Labs recruiter, pick 3 of 10 prepared applications (Match Score ≥75) in view A „Dziś” and view B „Karta faktów”, and then see how many of the picked people received continue after the first interview (historical decision), against the 3/10 baseline and the 0.9 random mean.

## Decisions

- **Data placement.** Company, historical job and recruiter persona are scenario records derived from the fixture (`fact-card-trial.ts`). The 10 applications, their texts, fact cards and the historical decision stay in the read-only fixture; only per-view selections (`factCardTrial.a/b`: `selected`, `invitedAt`) are stored. The decision is therefore never stored, imported or exported. It is still in the static bundle: hiding is a UI rule, not confidentiality.
- **No candidate personas.** The 10 people are not added to `people`/`applications`, so the person picker, candidate flows and BrightLabs/Northstar lists are unchanged.
- **Historical job is `expired`** (20.06–20.07.2026), so it is not in the public listing/map and cannot receive new applications.
- **Schema version 2.** `migrateState` upgrades version 1 saves/imports (adds Punkt Labs, empty selections) and keeps every existing record. The storage key is unchanged so existing browser saves are read, not orphaned. Unsupported versions stay blocked as before.
- **Routes.** `/#/app/kandydaci?widok=a|b`, `/#/app/kandydaci/:key?widok=…`, `/#/app/kandydaci/wynik?widok=…`. The view lives in the URL so screenshots and back/forward are reproducible.
- **UI.** Composed from existing roles: outlined white surfaces, paper inner sheet for the fact card, ink selected state on the view switch, pink selection highlight, MatchScore unchanged, RecordSheet for materials, BackLink, Checkbox, ConfirmDialog for the reset. Styles in `src/app/fact-card.css`.

## Acceptance criteria

- [x] Ewa Malinowska in the picker opens the candidate list with the task instruction.
- [x] A and B show the same 10 people in the fixture order; B shows 2–3 facts, the „przygotowane ręcznie” label, W4 marked as added during recruitment and both list notes.
- [x] Selection per view, max 3, counter, invite enabled only at 3; invite locks the view.
- [x] Result: X of 3, list with decision, 3/10 and 0,9 reference, fixed caption, A vs B comparison when both views are done, „Spróbuj drugiego widoku”, „Zacznij od nowa” with confirmation.
- [x] No historical decision on the list/detail; not in localStorage/export.
- [x] Version 1 saves upgrade without data loss; import/export/reset keep working.
- [x] 390 px without horizontal overflow (list, detail, result).
- [x] `npm run check` exits 0 in an LF clone; in this CRLF checkout only the line-ending-sensitive steps fail (see evidence).

## Evidence (2026-11-15, local Windows machine)

This checkout has `core.autocrlf=true`, so tracked files are CRLF. On it, `npm run format:check`, `npm run design-system:check` (kit hashes) and `npm run verify:packet` (byte comparison of `baseline.csv`) fail before and after this change. Playwright's bundled Chromium is not installed, so `npm run test:e2e` cannot launch a browser. The gate was therefore run in a fresh LF clone of `81682a8` with this change overlaid (scratch directory, shared `node_modules`):

- `format:check`, `design-system:check` (67 files), `lint`, `typecheck`, `npm test` (6 files, 35 tests), `verify:packet` (120 journeys) and `build`: passed.
- E2E with system Chrome (temporary config outside the repo, `channel: "chrome"`): 35 of 37 passed, including the 3 new tests in `tests/e2e/fact-card.spec.ts`. The 2 failures are the Anna/Marek PDF tests, which count Chrome's built-in PDF viewer `chrome-extension://` request as external. They fail the same way on unchanged `81682a8` with system Chrome; the bundled Chromium does not make that request.
- Manual browser pass at 1280 and 390 px: full A → result → B → comparison → reset path, no horizontal overflow.
- After Playwright Chromium was installed (with approval): `npm run test:e2e` in this checkout 37/37 passed, and the full `npm run check` in the LF clone exited 0 (37/37 e2e). In this CRLF checkout `npm run check` still stops at `format:check`.

The data file copy in `src/` is content-identical to the hand-over file (Prettier reformatted whitespace); a unit test compares the parsed JSON. The two hand-over files are listed in `.prettierignore` so they stay byte-identical to the vault.

## Not covered

- Real AI fact extraction, a second recruitment for a clean T1 (same people in A and B), timing of choices and reasons (T1 measures these outside the prototype).
