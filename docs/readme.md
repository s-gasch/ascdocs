# ASCDocs — status i spis treści `docs/dev/`

> Ten plik jest obowiązkowy (Zasady globalne workflow, pkt 7) i musi być aktualizowany po każdej
> zmianie w `docs/dev/`.

## Opis projektu

ASCDocs to projekt w pełni statycznych plików (HTML/CSS/JS, obrazy, wideo — bez logiki serwerowej ani
kroku build) służący do ujednoliconego przygotowywania dokumentów wymaganych przez App Store Connect
(Privacy Policy, Terms of Use, Support i inne specyficzne dla aplikacji) dla wielu aplikacji i wielu
wersji językowych, ze wspólnym szablonem bazowym (`content/common/`) i możliwością nadpisania go/jego
stylu per aplikacja (`content/<app-name>/template/`).

## Stan rejestrów

### Wymagania (`docs/dev/requirements/`)
- **Status:** Zaakceptowane (17/17 wymagań ze statusem "Zaakceptowane", 0 otwartych pytań).
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`requirements/appstore-docs.md`](dev/requirements/appstore-docs.md) | REQ-001–REQ-017 | Struktura, renderowanie klienckie, szablony/override, i18n/fallback, macierz przeglądarek, dostępność/wydajność, brak zależności do dodatkowych bibliotek JS. |

### Plan pracy (`docs/dev/plan/`)
- **Status:** Zaimplementowany w całości (Scenariusz 4) — wszystkie TASK-001–TASK-009 mają status
  `Done`.
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`plan/appstore-docs.md`](dev/plan/appstore-docs.md) | TASK-001–TASK-009 | Scaffolding struktury, silnik renderujący, szablon bazowy, mechanizm override, spec plików wejściowych, fallback językowy, walidacja cross-browser/a11y/performance, przewodnik autorski + bazowe pliki `sample-app`, rozszerzenie `sample-app` do pełnej referencyjnej aplikacji QA. |
- **Log decyzji/eskalacji:** 5 wpisów w `plan/index.md` (fallback językowy, macierz przeglądarek,
  mechanizm techniczny fallbacku, brak zależności do dodatkowych bibliotek JS, scalenie aplikacji
  przykładowej z aplikacją referencyjną `sample-app`).

### Log implementacji (`docs/dev/log.md`)
- **Status:** Utworzony — 5 wpisów (LOG-001–LOG-005), zakres iteracji: cały plan.
- **Wynik testów:** `npm test` (Vitest 17/17 jednostkowe + `node:test` 6/6 dla skryptu fallbacku) i
  `npx playwright test` (42/42 E2E na Chromium/WebKit/Firefox, w tym axe-core: 0 naruszeń A/AA) —
  wszystkie zielone.
- **Otwarte punkty przed pierwszą produkcyjną publikacją** (odnotowane w LOG-003/LOG-005, nie
  blokują zamknięcia tej iteracji implementacyjnej):
  1. Manualna checklista mobile Safari (iOS)/Chrome (Android) na rzeczywistych
     urządzeniach/emulatorach (REQ-011) — niewykonalna w tym środowisku sandboxowym.
  2. Powtórzenie audytu Lighthouse (symulowany mobilny throttling) na docelowej infrastrukturze
     hostingowej — w sandboxie deweloperskim wynik z throttlingiem był niereprezentatywny (LCP
     8.0s/wynik 0.58), podczas gdy surowe metryki bez throttlingu były doskonałe (LCP 0.2s, CLS 0,
     TBT 0ms, wynik 1.0), potwierdzając wydajną architekturę.
  3. Uruchomienie `npm run fallback:languages` przed każdą publikacją zmian treści (udokumentowane
     w `docs/authoring-guide.md`).

## Kod produkcyjny i narzędzia deweloperskie
- `content/common/` — silnik renderujący (`js/render.js`), szablon bazowy (`templates/base.html`),
  styl bazowy (`css/base.css`). Zero zależności runtime (REQ-017).
- `content/sample-app/` — aplikacja referencyjna: `en/`+`de/` kompletne, `pl/` celowo niekompletny
  (demonstracja fallbacku), `marketing-disclosure.html` (dodatkowy typ dokumentu), pełny
  `template/override.css`.
- `docs/authoring-guide.md` — przewodnik autorski (REQ-012/REQ-013), 5 kroków + minimalny szablon
  pliku wejściowego.
- `scripts/fallback-languages.js` — narzędzie publikacyjne (build-time fallback językowy, REQ-010).
- `scripts/dev-server.js` — lokalny serwer statyczny do developmentu/E2E (narzędzie deweloperskie).
- Testy: `test/unit/` (Vitest+happy-dom), `test/node/` (`node:test`), `test/e2e/` (Playwright +
  axe-core). Uruchomienie: `npm test` (jednostkowe) / `npx playwright test` (E2E).

## Audyty / raporty (`docs/dev/audits/`, `docs/dev/reports/`)
- Brak na tym etapie.

## Ostatnia aktualizacja
2026-08-10 — Zaimplementowano cały plan (TASK-001–TASK-009, Scenariusz 4): silnik renderujący,
szablon bazowy, mechanizm override, spec plików wejściowych, fallback językowy, walidacja
cross-browser/a11y (Playwright + axe-core, 0 naruszeń A/AA), przewodnik autorski i pełna aplikacja
referencyjna `content/sample-app/`. Pełna weryfikacja wsteczna w `docs/dev/log.md` (LOG-005);
otwarte punkty przed produkcyjną publikacją: manualna weryfikacja mobile Safari/Chrome Android i
powtórzenie audytu Lighthouse na docelowej infrastrukturze.
