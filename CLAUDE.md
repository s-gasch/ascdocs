# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

ASCDocs produces the documents App Store Connect requires (Privacy Policy, Terms of Use, Support, plus
app-specific types) for **multiple apps × multiple languages**, as a **fully static site**: HTML/CSS/JS
served as-is, no server logic, **no build step**, and **zero runtime JS dependencies** (REQ-017 — `package.json`
devDependencies exist only for dev/test tooling and must never be imported by anything under `content/`).

`content/` is the deployed root: `.github/workflows/pages.yml` copies `content/.` into `_site` and publishes to
GitHub Pages on every push to `main`. Anything outside `content/` (`scripts/`, `test/`, `docs/`) is tooling and
never reaches the browser.

Project documentation and most code comments are in **Polish**; keep that convention when editing them.

## Commands

```sh
npm test                      # Vitest (test/unit, happy-dom) + node:test (test/node)
npm run test:watch            # Vitest watch
npm run test:node             # node --test test/node/*.test.mjs only
npm run test:e2e              # Playwright: Chromium + WebKit + Firefox, incl. axe-core a11y
npm run serve                 # static dev server on http://localhost:4173 (PORT env overrides)
npm run fallback:languages    # publication step — fills missing <lang>/ docs from en/ (see below)
```

Single test / narrower runs:

```sh
npx vitest run test/unit/formal.test.js
npx vitest run -t "rejects a document with a missing version"
node --test test/node/bike-pilot-content.test.mjs
npx playwright test test/e2e/bike-pilot.spec.js --project=chromium
npx playwright test -g "TASK-023"
```

`playwright.config.js` starts `scripts/dev-server.js` itself (baseURL `http://127.0.0.1:4173`), so E2E needs no
separate server. E2E URLs are repo-relative (`/content/<app>/...`) because the dev server's root is the repo root,
whereas in production the root is `content/`.

## Two coexisting architectures

Both are live at once, and they must not be merged or "unified" without an explicit requirement.

### 1. Legacy/common: one HTML file per language, client-side composition

Used by `content/sample-app/` and by the frozen `content/bike-pilot/<lang>/*.html`.

- Input file contract: exactly one `<template id="doc-content" data-doc-title="...">` in `<body>`, plus
  `<script type="module" src="../../common/js/render.js">`. A missing/duplicate template is a **hard error**
  (never a silent fallback) — that fail-fast stance is a deliberate convention across the codebase.
- `content/common/js/render.js` derives all paths from the directory layout — `commonBase` from
  `import.meta.url`, `appBase` from `location.href` (`content/<app>/<lang>/<doc>.html`) — so there is no
  per-file configuration. It injects `content/common/css/base.css`, then optional
  `content/<app>/template/override.css`, then fetches `content/<app>/template/template.html` if present else
  `content/common/templates/base.html`, and slots the content in.
- Template contract: exactly one `[data-doc-slot]`; optional `[data-doc-title]`, `[data-doc-app-name]`,
  `[data-doc-year]`, and `a[data-doc-nav="<doc-id>"]` links (the active one gets `aria-current="page"` +
  `.is-active`). `<doc-id>` is the filename without extension, so a new document type needs **no engine change**.
- `content/sample-app/` is the QA reference app: `en/` + `de/` complete, `pl/` deliberately incomplete to
  demonstrate fallback, `marketing-disclosure.html` as an extra doc type, and a full `template/override.css`.
- `scripts/fallback-languages.js` (`npm run fallback:languages`) is a **publication-time** tool: it copies missing
  `<lang>/` documents from `en/`, tagging them `<!-- fallback: en -->`. `en/` is the source of truth and its
  absence is a fatal error. Run it before publishing content changes; never at runtime.

### 2. bike-pilot pilot: one HTML shell per document type + JSON per language

Scoped strictly to `content/bike-pilot/` (never touches `content/common/`):

- 4 entry points at `content/bike-pilot/`: `privacy-policy.html`, `terms-of-use.html`, `support.html` (formal) and
  `index.html` (marketing). Bootstrapping is driven by body data attributes: `data-page-kind="formal"|"marketing"`
  and, for formal pages, `data-doc-type="<privacy-policy|terms-of-use|support>"`.
- `js/formal.js` fetches `formal/<doc-type>/<lang>.json`, validates it, and builds the DOM. `js/index.js` does the
  same for `content/<lang>.json` (marketing). `js/support.js` is a thin extension point that just re-imports
  `formal.js`.
- `js/language.js` is the shared i18n + consent module: the canonical `SUPPORTED_LANGUAGES` list (19 codes, with
  `dir` for RTL), all shared UI label translations (`UI_TRANSLATIONS`), language detection
  (cookie → `navigator.languages` → `en`), the `<select>` switcher, and the cookie-consent banner. Cookies:
  `bp_lang` and `bp_consent` — **the language cookie is only written after consent** (`hasConsent`), a tested
  invariant.
- Formal document model (`formal/<type>/<lang>.json`), documented at the top of `js/formal.js`:
  `{ title, version, blocks[] }`, where blocks are `heading | paragraph | list | table` and inline formatting is
  expressed as `runs[]` (`{ text, bold?, italic?, code?, href?, break? }`). **There is no raw HTML anywhere in
  these JSON files** (REQ-026) — `renderDocumentContent` builds nodes exclusively via `createElement`/`textContent`
  and never assigns document content to `innerHTML`. `validateDocumentModel` rejects unknown block types, unknown
  run keys, and a `version` that is not `MAJOR.MINOR`.
- `version` is shared across all 19 languages of a document type (one legal document translated 19×). Editing
  content in one language means bumping `version` identically in all 19 files of that type: MINOR for editorial
  changes, MAJOR for changes in legal scope/meaning (`docs/authoring-guide.md` §7).
- Missing language JSON falls back to `en` at runtime (`fetchDocumentData` recurses once), separately from the
  build-time fallback script.

## Invariants the test suite enforces

Before changing anything under `content/bike-pilot/`, know that `test/node/bike-pilot-content.test.mjs` will fail if you:

- **modify any `content/bike-pilot/<lang>/*.html`** — the 57 legacy files are frozen by SHA-256 fixtures in
  `test/fixtures/bike-pilot-legacy-hashes.json` (TASK-019). They are also the golden source for the extracted
  JSON: `test/fixtures/bike-pilot-formal-golden.json` compares visible text of the JSON model against them.
- add/regenerate formal JSON that fails the blocks/runs schema, still carries an `html` key, or omits `version`
  (checked for all 19 × 3 files) — `version` must also be *identical* across the 19 languages of a doc type.
- desynchronize a JSON `title` from the matching `navPrivacy`/`navTerms`/`navSupport` label in `js/language.js`
  (57 pairs must agree).

`scripts/extract-bikepilot-content.mjs` is the one-off extractor that produced the 57 formal JSON files from the
legacy HTML (HTML → blocks/runs via happy-dom). Re-run it only to regenerate from that legacy source, and expect
the golden-text test to be the arbiter.

`test/e2e/*.spec.js` run axe-core against the 4 bike-pilot pages plus sample-app and assert 0 WCAG A/AA
violations; the formal pages use a dark theme with orange accents (`#f48525`) whose contrast is part of that
budget. Keep semantic landmarks, a single `h1`, and the `.sr-only` pattern (the visible "Language" label is
hidden but the `<select>` keeps its accessible name).

## Docs / process conventions

- `docs/readme.md` is the live status index for `docs/dev/` and **must be updated after every change under
  `docs/dev/`** (requirements, plan, log, reports).
- `docs/dev/` holds numbered registers: `requirements/` (REQ-XXX), `plan/` (TASK-XXX, plus a decision/escalation
  log in `plan/index.md`), `log.md` (LOG-XXX), `reports/`. Closed items are moved to `*/archive/` leaving pointer
  rows behind. Code comments and commit messages reference these IDs (e.g. `TASK-025: …`) — follow that when
  touching existing features.
- `docs/authoring-guide.md` is the content-author entry point (add an app / language / document type / style
  override, when to run the fallback script, bike-pilot versioning policy).
- `.github/copilot-instructions.md` mandates an external workflow framework at `~/.copilot/workflow/workflow.md`
  (scenarios 1–15, personas, global rules) for choosing how to work in this repo. It is outside the repo; read it
  when a task is framed in its terms (e.g. "Scenariusz 4", persona selection, artifact placement).
- Do not introduce a framework, bundler, or runtime dependency — vanilla HTML/CSS/JS is the deliberate default.
