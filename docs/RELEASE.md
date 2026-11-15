# Release, smoke check and recovery

Target hosting: **GitHub Pages** from the participant fork `bleys80/doroboty-ai` (public repository, GitHub Free). Expected address: `https://bleys80.github.io/doroboty-ai/`. The app is static (`dist/`, hash routes, relative `base: "./"`), so no server, environment variables or secrets are needed.

Status on 2026-11-15: the workflow `.github/workflows/pages.yml` exists in the working tree (not committed or pushed). Pages is **not enabled** and nothing is deployed; enabling and the first deployment are the next course quest. This file does not prove that a deployment works.

Owner and incident contact: the fork owner (Błażej Grabowski). Audience: the AIPH 3 course group.

Provider facts below were checked on 2026-11-15 in the GitHub Docs pages "Using custom workflows with GitHub Pages", "Configuring a publishing source", "GitHub Pages limits", "Securing your site with HTTPS" and "GitHub's plans". Re-check them before setup.

## What becomes public

- Everything in `dist/` is public on the internet: all fictional scenario data, both sample CVs, `case/baseline.csv` and the historical Punkt Labs decisions inside the JavaScript bundle (see FEATURES.md EMP-11).
- The fork itself is already public, including `docs/source` and Git history. That is a course distribution decision, not something a deployment changes; confirm with the course if unsure.
- GitHub logs visitor IP addresses. The in-app privacy page already says the host keeps access logs.

## Release procedure

The workflow `.github/workflows/pages.yml` publishes exactly one commit: it checks it out, runs `npm ci` from `package-lock.json`, runs the full gate `./scripts/verify` (which also builds `dist/`) and uploads `dist/` only if the gate passes. It runs on every push to `main` and on manual "Run workflow". The build job has read-only repository access; only the deploy job gets `pages: write` and `id-token: write`.

1. One-time setup, **before** the workflow reaches `main`: in the fork open **Settings → Pages → Build and deployment → Source → GitHub Actions**. Without it the "Verify and build" job fails at `configure-pages` and nothing is published.
2. Pick the commit to publish and get it onto `main` (today the release candidate is on branch `karta-faktow`; merge it after review). Every later push to `main` publishes again.
3. Locally on that commit run `./scripts/verify` (or `npm run check`) and confirm exit 0. The workflow repeats the same gate on GitHub.
4. In **Actions → Pages** wait for both jobs to succeed, then in **Settings → Environments → github-pages** (or the deployment link on the repository page) note the deployed commit SHA.
5. In **Settings → Pages** enable **Enforce HTTPS** (github.io sites are served over HTTPS automatically).
6. Run the smoke check below on the public address.

## Smoke check after each deployment

Owner: the fork owner. Use a fresh private browser window so no old local save interferes.

1. `https://bleys80.github.io/doroboty-ai/` opens over HTTPS, shows the homepage and the browser console has no errors.
2. `#/oferty` lists jobs; open one job and its company page.
3. Wybierz osobę → employer (Karolina or Tomasz) → publish a job; switch to candidate (Anna or Marek) → apply to it; switch back → record a decision.
4. Reload the page: the published job, application and decision are still there.
5. Ewa (Punkt Labs) → `#/app/kandydaci?widok=a` and `?widok=b`: select 3, invite, see the result screen.
6. Settings: export downloads a JSON file; reset asks for confirmation.
7. Open one CV PDF and `case/baseline.csv` (asset paths work under `/doroboty-ai/`).
8. Repeat steps 1–2 on a phone or at 390 px width.

**Roll back** when step 1, 3 or 4 fails and the cause is not fixed within about 30 minutes, or immediately when the site shows anything other than the intended fictional data.

## Rolling back to the previous version

GitHub Pages has no one-click rollback, and GitHub Docs do not promise that re-running an old workflow run restores that version. Use Git instead:

1. Find the last good commit (the previous `github-pages` deployment shows its SHA; the last known good source before this release is `81682a8` on `main`).
2. Revert the bad change on `main` (`git revert <bad-commit>`) and push; the workflow redeploys the previous code. Do not force-push or rewrite `main`.
3. Run the smoke check again.

Data effect: users' scenarios live only in their own browsers and are not touched by a rollback. If an older version cannot read a newer save, it shows the "Nie udało się odczytać zapisu" notice and does **not** overwrite the save (`readState` blocks writes); users can download the raw save in settings or reset.

## When the site does not work

1. Check whether the problem is the site or one browser: open the address in a private window and on another device.
2. Check **Actions** (last Pages run failed?) and **Settings → Pages** (source still GitHub Actions, custom domain/HTTPS settings unchanged). GitHub status: https://www.githubstatus.com/.
3. If the latest deployment broke the site, roll back as above.
4. If only one person is affected: the in-app error screen offers refresh, homepage and "Pobierz kopię danych"; settings offer export and reset. A reset only clears that browser's scenario.
5. Tell participants in the course channel what is happening and when to retry. Do not ask them to send exports containing real personal data.

## Limits

Published site up to 1 GB (current `dist/` ≈ 16 MB), soft bandwidth limit 100 GB per month (about 2.3 MB per first visit), deployments time out after 10 minutes. GitHub may return HTTP 429 when rate-limited.
