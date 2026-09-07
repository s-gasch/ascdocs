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
- **Status:** Zaakceptowane (25/25 wymagań ze statusem "Zaakceptowane", 0 otwartych pytań).
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`requirements/appstore-docs.md`](dev/requirements/appstore-docs.md) | REQ-001–REQ-017 | Struktura, renderowanie klienckie, szablony/override, i18n/fallback, macierz przeglądarek, dostępność/wydajność, brak zależności do dodatkowych bibliotek JS. |
  | [`requirements/bike-pilot.md`](dev/requirements/bike-pilot.md) | REQ-018–REQ-026 | Pilotaż nowej architektury (na podstawie `docs/dev/requirements/ideas.md`) dla aplikacji bike-pilot: szablon+JSON per język (zamiast pliku per język), wykrywanie/przełącznik/trwałe zapamiętanie języka (cookie), klauzula zgody na cookies, strona marketingowa — dodane **obok** istniejącej struktury `content/bike-pilot/<lang>/*.html`, bez jej zmiany, ograniczone do `content/bike-pilot/`; REQ-026 doprecyzowuje, że treść formalna w JSON jest ustrukturyzowana (model blocks/runs), bez znaczników HTML. |

### Plan pracy (`docs/dev/plan/`)
- **Status:** Grupa `appstore-docs` zaimplementowana w całości (Scenariusz 4, TASK-001–TASK-009
  `Done`). Grupa `bike-pilot` (TASK-010–TASK-019) — **zaimplementowana i zweryfikowana**. Dodatek
  TASK-020–TASK-022 (REQ-026, format treści formalnej JSON bez HTML) — **plan gotowy, implementacja
  jeszcze nie rozpoczęta**.
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`plan/appstore-docs.md`](dev/plan/appstore-docs.md) | TASK-001–TASK-009 | Scaffolding struktury, silnik renderujący, szablon bazowy, mechanizm override, spec plików wejściowych, fallback językowy, walidacja cross-browser/a11y/performance, przewodnik autorski + bazowe pliki `sample-app`, rozszerzenie `sample-app` do pełnej referencyjnej aplikacji QA. |
  | [`plan/bike-pilot.md`](dev/plan/bike-pilot.md) | TASK-010–TASK-022 | Scaffolding nowej struktury równoległej, silnik JSON→HTML, wykrywanie/przełącznik/zapamiętanie języka, baner zgody na cookies, style formalne, strona marketingowa, treść JSON dla 19 języków, walidacja e2e + regresja starej struktury; TASK-020–TASK-022 (dodatek) zastępują format treści formalnej JSON HTML → model blocks/runs bez znaczników. |
- **Log decyzji/eskalacji:** 10 wpisów w `plan/index.md` (fallback językowy, macierz przeglądarek,
  mechanizm techniczny fallbacku, brak zależności do dodatkowych bibliotek JS, scalenie aplikacji
  przykładowej z aplikacją referencyjną `sample-app`; dla grupy `bike-pilot`: koegzystencja ze starą
  strukturą, zakres pilotażu ograniczony do bike-pilot, los prototypu marketingowego `en/merketing/`,
  mechanizm trwałości języka (cookie), zakres banera zgody na cookies).

### Log implementacji (`docs/dev/log.md`)
- **Status:** Utworzony — 7 wpisów (LOG-001–LOG-007), zakres iteracji: `appstore-docs` +
  `bike-pilot`.
- **Wynik testów:** `npm test` (Vitest 30/30 jednostkowe + `node:test` 9/9) i `npx playwright test`
  (291/291 E2E na Chromium/WebKit/Firefox, w tym bike-pilot 249/249 oraz axe-core: 0 naruszeń A/AA
  na 4 nowych stronach) — wszystkie zielone.
- **Otwarte punkty przed pierwszą produkcyjną publikacją** (odnotowane w LOG-003/LOG-005, nie
  blokują zamknięcia tej iteracji implementacyjnej; rozszerzone w LOG-007 o grupę `bike-pilot`):
  1. Manualna checklista mobile Safari (iOS)/Chrome (Android) na rzeczywistych
     urządzeniach/emulatorach (REQ-011) — niewykonalna w tym środowisku sandboxowym.
  2. Powtórzenie audytu Lighthouse (symulowany mobilny throttling) na docelowej infrastrukturze
     hostingowej — w sandboxie deweloperskim wynik z throttlingiem był niereprezentatywny (LCP
     8.0s/wynik 0.58), podczas gdy surowe metryki bez throttlingu były doskonałe (LCP 0.2s, CLS 0,
     TBT 0ms, wynik 1.0), potwierdzając wydajną architekturę.
  3. Natywna/lokalizacyjna korekta marketingowych tłumaczeń bike-pilot (`content/bike-pilot/content/
     <lang>.json`) przed publikacją produkcyjną.
  4. Uruchomienie `npm run fallback:languages` przed każdą publikacją zmian treści (udokumentowane
     w `docs/authoring-guide.md`).

## Kod produkcyjny i narzędzia deweloperskie
- `content/common/` — silnik renderujący (`js/render.js`), szablon bazowy (`templates/base.html`),
  styl bazowy (`css/base.css`). Zero zależności runtime (REQ-017).
- `content/bike-pilot/` — pilotaż równoległej architektury JSON+szablon: 3 formalne punkty wejścia
  (`privacy-policy.html`, `terms-of-use.html`, `support.html`), marketingowe `index.html`,
  współdzielony `js/language.js`, lokalne silniki `js/formal.js` i `js/index.js`, style
  `css/formal.css`, `css/support.css`, `css/index.css`, 57 plików `formal/<typ>/<lang>.json`,
  19 plików `content/<lang>.json`, wspólny baner zgody na cookies i lokalne przełączanie języka.
- `content/sample-app/` — aplikacja referencyjna: `en/`+`de/` kompletne, `pl/` celowo niekompletny
  (demonstracja fallbacku), `marketing-disclosure.html` (dodatkowy typ dokumentu), pełny
  `template/override.css`.
- `docs/authoring-guide.md` — przewodnik autorski (REQ-012/REQ-013), 5 kroków + minimalny szablon
  pliku wejściowego.
- `scripts/fallback-languages.js` — narzędzie publikacyjne (build-time fallback językowy, REQ-010).
- `scripts/extract-bikepilot-content.mjs` — jednorazowy skrypt ekstrakcji 57 istniejących plików
  `content/bike-pilot/<lang>/*.html` do równoległych JSON-ów formalnych (TASK-018).
- `scripts/dev-server.js` — lokalny serwer statyczny do developmentu/E2E (narzędzie deweloperskie).
- Testy: `test/unit/` (Vitest+happy-dom), `test/node/` (`node:test`), `test/e2e/` (Playwright +
  axe-core). Uruchomienie: `npm test` (jednostkowe) / `npx playwright test` (E2E).

## Audyty / raporty (`docs/dev/audits/`, `docs/dev/reports/`)
- Brak na tym etapie.

## Ostatnia aktualizacja
2026-09-07 — Zaimplementowano cały plan `bike-pilot` (TASK-010–TASK-019, Scenariusz 4): nową,
równoległą strukturę `content/bike-pilot/` z 4 punktami wejścia HTML, lokalnym silnikiem JSON→HTML
dla dokumentów formalnych, wspólnym modułem `js/language.js` (detekcja języka, przełącznik, cookie
persistencji i cookie consent), nową marketingową `index.html`, 57 formalnymi JSON-ami
wyekstrahowanymi ze starej struktury oraz 19 marketingowymi JSON-ami. Walidacja: `npm test`
(30/30 Vitest + 9/9 `node:test`) i `npx playwright test` (291/291 Chromium/WebKit/Firefox, 0
naruszeń axe-core A/AA na 4 nowych stronach). Istniejące `content/bike-pilot/<lang>/*.html`
pozostały nietknięte (hash regression + pusty `git diff --stat` na 19 katalogach językowych).
Otwarte punkty przed publikacją produkcyjną: manualna weryfikacja mobile Safari/Chrome Android,
powtórzenie audytu Lighthouse na docelowej infrastrukturze oraz natywna korekta marketingowych
tłumaczeń bike-pilot. Poprzednia aktualizacja (2026-08-10): zaimplementowano cały plan
`appstore-docs` (TASK-001–TASK-009, Scenariusz 4).

**Najnowsza aktualizacja (2026-09-07, Scenariusze 2+3):** Dodano REQ-026 (grupa wymagań `bike-pilot`)
i odpowiadające zadania TASK-020–TASK-022 (grupa planu `bike-pilot`) na jawne żądanie użytkownika:
pliki treści formalnej `content/bike-pilot/formal/<typ>/<lang>.json` (57 plików) mają zawierać
wyłącznie ustrukturyzowany model treści (`blocks[]`/`runs[]`), bez znaczników HTML — dotychczasowa
implementacja (TASK-011/TASK-018) zapisywała surowy HTML w polu `html`. TASK-011/TASK-018 pozostają
w rejestrze bez zmian (Zasada przyrostowego rejestru); TASK-020–TASK-022 zastępują ich rezultat w
zakresie formatu danych i renderowania. **Implementacja TASK-020–TASK-022 jeszcze nie rozpoczęta** —
plan gotowy do potwierdzenia/realizacji.
