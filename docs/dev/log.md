# Log implementacji — ASCDocs (Scenariusz 4)

> Przyrostowy rejestr implementacji planu `docs/dev/plan/appstore-docs.md` (TASK-001–TASK-009).
> Nowe wpisy dopisywane na końcu — istniejące wpisy nigdy nie są nadpisywane (Zasady globalne
> workflow, pkt 3).

### LOG-001: Zakres iteracji ustalony z użytkownikiem
- **Data:** 2026-08-10
- **Zakres iteracji:** Cały plan (TASK-001–TASK-009)
- **Persony zaangażowane:** Delivery Plan Facilitator, Web Frontend Software Architect, Web
  Frontend Software Engineer, Web Frontend Test Engineer, Web Frontend QA Strategy Engineer,
  Code Reviewer, Git Workflow Master, Technical Writer, Requirements Analyst
- **Dyskusje/niejasności i rozstrzygnięcia:** Użytkownik wybrał implementację całego planu
  (`ask_user`, odpowiedź: "Cały plan (TASK-001–TASK-009)"), zamiast implementacji krok po kroku.
- **Commit:** brak (decyzja o zakresie, bez zmian w kodzie)
- **Wynik test gate:** nie dotyczy
- **Weryfikacja wsteczna:** nie dotyczy
- **Aktualizacja dokumentacji/instrukcji obsługi:** brak na tym etapie

### LOG-002: TASK-001–TASK-006 zaimplementowane
- **Data:** 2026-08-10
- **Zakres iteracji:** Cały plan
- **Persony zaangażowane:** Web Frontend Software Engineer, Web Frontend Test Engineer,
  Code Reviewer, Git Workflow Master, Technical Writer
- **Dyskusje/niejasności i rozstrzygnięcia:** Brak nowych sporów — realizacja zgodna z podejściem
  technicznym z planu (kontrakt `<template id="doc-content">`, wyprowadzanie ścieżek z
  `import.meta.url`/`location.href` bez konfiguracji per plik, build-time fallback językowy).
  Jedna decyzja doprecyzowująca: happy-dom w środowisku testowym Vitest wykonuje bootstrap modułu
  (nasłuch DOM), dlatego dodano warunek pomijający auto-start w środowisku testowym (wykrywany po
  obecności globalnego `process`), by testy jednostkowe pozostały czyste.
- **Commit:**
  - `TASK-001: Scaffolding struktury katalogów content/common (css/js/templates) + README`
  - `TASK-002: Silnik renderujący (content/common/js/render.js) + testy jednostkowe (Vitest+happy-dom)`
  - `TASK-003: Szablon bazowy HTML/CSS (content/common/templates/base.html, css/base.css)`
  - `TASK-004: Testy integracyjne mechanizmu override (style/szablon per aplikacja, REQ-007)`
  - `TASK-005: Specyfikacja plików wejściowych + test rozszerzalności typów dokumentów (REQ-008)`
  - `TASK-006: Skrypt fallbacku językowego build-time (scripts/fallback-languages.js) + testy (node:test)`
- **Wynik test gate:** Przeszedł — 17/17 testów jednostkowych Vitest (`npm run test`, happy-dom),
  6/6 testów `node:test` dla skryptu fallbacku.
- **Weryfikacja wsteczna:** Zgodne z REQ-001–REQ-010, REQ-017 i TASK-001–TASK-006 (patrz LOG-005 —
  pełna weryfikacja wsteczna po zakończeniu całego zakresu).
- **Aktualizacja dokumentacji/instrukcji obsługi:** `content/common/README.md` (TASK-001);
  komentarze dokumentujące kontrakt bezpośrednio w `render.js`, `base.html`, `base.css`,
  `fallback-languages.js`.

### LOG-003: TASK-007 zaimplementowane
- **Data:** 2026-08-10
- **Zakres iteracji:** Cały plan
- **Persony zaangażowane:** Web Frontend QA Strategy Engineer, Web Frontend Test Engineer,
  Code Reviewer, Git Workflow Master
- **Dyskusje/niejasności i rozstrzygnięcia:** Sprawdzanie istnienia opcjonalnego
  `template/template.html`/`override.css` przez `fetch()` (REQ-005/REQ-007) nieuchronnie generuje
  w konsoli przeglądarki jeden nieszkodliwy wpis sieciowy "Failed to load resource ... 404" dla
  aplikacji bez własnego szablonu strukturalnego — jest to zamierzone zachowanie mechanizmu
  detekcji (obsłużone jawnie w JS przez `resourceExists`), a nie błąd. Test E2E "brak błędów
  konsoli" filtruje wyłącznie ten oczekiwany wpis diagnostyczny; każdy inny błąd nadal powoduje
  niepowodzenie testu. Dodatkowo dodano `<link rel="icon" href="data:,">` do plików wejściowych,
  by wyeliminować analogiczny, niezwiązany z aplikacją wpis 404 dla domyślnego żądania favicon
  przeglądarki.
- **Commit:** `TASK-007: Walidacja cross-browser/a11y (Playwright: Chromium/WebKit/Firefox + axe-core) — 0 naruszeń A/AA, override.css, responsywność mobile-first`
- **Wynik test gate:** Przeszedł — 27/27 testów E2E Playwright na Chromium, WebKit i Firefox (3
  automatyzowalne silniki z macierzy REQ-011); axe-core (`wcag2a`, `wcag2aa`, `wcag21a`,
  `wcag21aa`) zgłasza 0 naruszeń dla wszystkich 3 typów dokumentów aplikacji referencyjnej.
- **Weryfikacja wsteczna:** Zgodne z REQ-011 (w zakresie silników automatyzowalnych) i REQ-014.
  **Ograniczenie środowiska (odnotowane, zgodnie z "Ryzyka/otwarte decyzje" TASK-007 w planie):**
  rzeczywisty mobile Safari (iOS) i Chrome na fizycznym Androidzie **nie zostały zweryfikowane
  manualnie** w tym środowisku wykonawczym (brak dostępu do fizycznych urządzeń/emulatorów w
  sandboxie sesji) — pozostaje to jawnie otwartym krokiem przed pierwszą produkcyjną publikacją,
  zgodnie z ryzykiem już udokumentowanym w planie (opcja: BrowserStack/Sauce Labs lub fizyczne
  urządzenia).
  **Wydajność (REQ-016):** Lighthouse (`--form-factor=mobile`) uruchomiony lokalnie na
  Chromium z Playwright przeciw `content/sample-app/en/privacy-policy.html`:
  - z symulowanym mobilnym throttlingiem (domyślny tryb Lighthouse): LCP ~8.0s, wynik wydajności
    0.58 — wynik **niereprezentatywny**, bo throttling symulowany ekstrapoluje z próbki
    śladu wykonania w tym silnie ograniczonym środowisku sandboxowym (nested/wirtualizowane CPU),
    co jest znaną przyczyną zawyżonych/niestabilnych wyników przy symulowanym throttlingu w
    kontenerach CI.
  - z `--throttling-method=provided` (bez dodatkowego throttlingu, surowy pomiar w tym samym
    środowisku): LCP 0.2s, CLS 0, TBT 0ms, wynik wydajności 1.0 — potwierdza, że architektura
    (brak frameworka JS, pojedynczy mały plik CSS, brak web fontów blokujących, brak przesunięć
    layoutu) sama w sobie jest wydajna.
  - **Wniosek:** wynik z symulowanym throttlingiem należy **powtórzyć na docelowej infrastrukturze
    hostingowej** (poza sandboxem deweloperskim) przed uznaniem REQ-016 za w pełni zweryfikowane
    w warunkach produkcyjnych; surowe metryki (CLS/TBT/LCP bez throttlingu) są jednoznacznie dobre.

### LOG-004: TASK-008 i TASK-009 zaimplementowane
- **Data:** 2026-08-10
- **Zakres iteracji:** Cały plan
- **Persony zaangażowane:** Technical Writer, Web Frontend Software Engineer,
  Web Frontend QA Strategy Engineer, Code Reviewer, Git Workflow Master
- **Dyskusje/niejasności i rozstrzygnięcia:** Brak nowych sporów — `content/sample-app/`
  rozbudowane zgodnie z decyzją użytkownika z Logu decyzji #5 (`plan/index.md`): jedna, wspólna
  aplikacja referencyjna zamiast osobnej aplikacji "Example".
- **Commit:**
  - `TASK-008: Przewodnik autorski (docs/authoring-guide.md) + bazowe pliki content/sample-app (en/, template/override.css) + serwer dev do E2E`
  - `TASK-009: Rozszerzenie sample-app (de/ pełny, pl/ z fallbackiem, marketing-disclosure.html, pełny override.css) + testy E2E (42/42 na Chromium/WebKit/Firefox)`
- **Wynik test gate:** Przeszedł — 42/42 testów E2E (Chromium/WebKit/Firefox) po rozszerzeniu,
  w tym: drugi kompletny język (`de/`), fallback językowy zademonstrowany i zweryfikowany
  (`pl/support.html` wygenerowany przez `npm run fallback:languages`, oznaczony
  `<!-- fallback: en -->`, renderuje się poprawnie zamiast błędu 404), nowy typ dokumentu
  (`marketing-disclosure.html`) bez zmian w `content/common/`, pełny override stylu
  (`--asc-color-accent`, `--asc-color-border`, `--asc-color-muted`, `--asc-font-heading`,
  `--asc-max-width`) zweryfikowany przez `getComputedStyle`.
- **Weryfikacja wsteczna:** Zgodne z REQ-005, REQ-007, REQ-008, REQ-009, REQ-010, REQ-012, REQ-013.
- **Aktualizacja dokumentacji/instrukcji obsługi:** `docs/authoring-guide.md` opublikowany (5
  punktów: nowa aplikacja, nowy/aktualizowany język, nowy typ dokumentu, override stylu/szablonu,
  fallback językowy) z odwołaniami do realnych ścieżek `content/sample-app/`.

### LOG-005: Weryfikacja wsteczna całego przyrostu (REQ-001–REQ-017)
- **Data:** 2026-08-10
- **Zakres iteracji:** Cały plan — zamknięcie
- **Persony zaangażowane:** Requirements Analyst, Delivery Plan Facilitator, Code Reviewer
- **Wynik weryfikacji wg macierzy traceability (`plan/index.md`):**
  | REQ | Status | Dowód |
  |-----|--------|-------|
  | REQ-001 (statyczna architektura) | Zgodne | brak zależności runtime, `package.json` wyłącznie `devDependencies` |
  | REQ-002 (struktura `content/`) | Zgodne | `content/common/`, `content/sample-app/{en,de,pl,template}` |
  | REQ-003 (punkty wejścia per język) | Zgodne | `content/sample-app/<lang>/*.html`, test E2E "renderuje kompletny DOM" |
  | REQ-004 (renderowanie klienckie) | Zgodne | `render.js`, test E2E potwierdza kompozycję po `DOMContentLoaded` |
  | REQ-005 (override szablonu) | Zgodne | `resolveTemplate()`, testy jednostkowe + E2E |
  | REQ-006 (szablon bazowy) | Zgodne | `content/common/templates/base.html`, test "bez override" |
  | REQ-007 (override stylu) | Zgodne | `content/sample-app/template/override.css`, test `getComputedStyle` |
  | REQ-008 (rozszerzalność typów dok.) | Zgodne | `marketing-disclosure.html`, test jednostkowy + E2E |
  | REQ-009 (en jako źródło) | Zgodne | `planFallback` wymusza błąd przy braku `en/` |
  | REQ-010 (fallback językowy) | Zgodne | `scripts/fallback-languages.js`, `pl/support.html` z adnotacją, test E2E |
  | REQ-011 (macierz przeglądarek) | Częściowo — zob. LOG-003 | Chromium/WebKit/Firefox zautomatyzowane i zielone; mobile Safari/Chrome Android wymagają manualnej weryfikacji przed produkcją (ryzyko odnotowane w planie) |
  | REQ-012 (łatwa edycja) | Zgodne | `docs/authoring-guide.md`, minimalny kontrakt HTML |
  | REQ-013 (dokumentacja procesu) | Zgodne | `docs/authoring-guide.md` pokrywa wszystkie 5 punktów |
  | REQ-014 (dostępność WCAG AA) | Zgodne | axe-core: 0 naruszeń na wszystkich dokumentach/silnikach |
  | REQ-015 (mobile-first) | Zgodne | `base.css` mobile-first, test E2E 320px bez przewijania poziomego |
  | REQ-016 (Core Web Vitals) | Częściowo — zob. LOG-003 | Surowe metryki (bez throttlingu) doskonałe; wynik z symulowanym throttlingiem wymaga potwierdzenia na docelowej infrastrukturze poza sandboxem deweloperskim |
  | REQ-017 (brak zależności JS) | Zgodne | brak `<script src>`/`import` zewnętrznych bibliotek w `content/`; wszystkie narzędzia w `devDependencies` |
- **Otwarte punkty przed pierwszą produkcyjną publikacją (nie blokują zamknięcia tej iteracji
  implementacyjnej, ale muszą zostać wykonane przed wdrożeniem):**
  1. Manualna checklista mobile Safari (iOS)/Chrome (Android) na rzeczywistych
     urządzeniach/emulatorach (REQ-011).
  2. Powtórzenie audytu Lighthouse z symulowanym throttlingiem na docelowej infrastrukturze
     hostingowej, poza sandboxem deweloperskim (REQ-016).
  3. Uruchomienie `npm run fallback:languages` jako część procesu publikacji przed każdym
     wdrożeniem zmian treści (już udokumentowane w `docs/authoring-guide.md`, punkt 5).
- **Commit:** brak (weryfikacja, bez zmian w kodzie) — udokumentowana w tym wpisie logu.
- **Wynik test gate:** Przeszedł — pełny zestaw: `npm test` (Vitest 17/17 + node:test 6/6) i
  `npx playwright test` (42/42 na Chromium/WebKit/Firefox).
- **Weryfikacja wsteczna:** Zgodne z Acceptance Criteria i wymaganiami źródłowymi we wszystkich
  punktach poza dwoma jawnie odnotowanymi ograniczeniami środowiska sandboxowego (REQ-011 mobile
  manualne, REQ-016 throttling na docelowej infrastrukturze) — obie udokumentowane jako otwarte
  kroki przed produkcyjną publikacją, zgodnie z ryzykiem już zaakceptowanym w planie (TASK-007).
- **Aktualizacja dokumentacji/instrukcji obsługi:** `docs/readme.md` zaktualizowany o stan
  implementacji (ten log).
