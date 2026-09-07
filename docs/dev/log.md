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

### LOG-006: TASK-010–TASK-018 zaimplementowane dla grupy `bike-pilot`
- **Data:** 2026-09-07
- **Zakres iteracji:** Grupa `bike-pilot` — implementacja
- **Persony zaangażowane:** Web Frontend Software Engineer, Web Frontend Software Architect,
  Technical Writer, Code Reviewer, Git Workflow Master
- **Dyskusje/niejasności i rozstrzygnięcia:** Nowa architektura została utrzymana w 100% lokalnie w
  `content/bike-pilot/` — bez zmian w `content/common/` i bez podpinania nowych punktów wejścia do
  starej struktury `content/bike-pilot/<lang>/*.html`. Treści formalne zostały wyekstrahowane
  jednorazowym skryptem Node `scripts/extract-bikepilot-content.mjs` do 57 plików JSON
  (`formal/<typ>/<lang>.json`), a nowa strona marketingowa otrzymała 19 osobnych plików
  `content/<lang>.json`, zgodnie z REQ-018/REQ-025. Dodatkowo wprowadzono wspólny moduł
  `js/language.js` (wykrywanie języka, przełącznik, cookie zgody i trwałości wyboru) reużywany
  zarówno przez dokumenty formalne, jak i stronę marketingową.
- **Commit:**
  - `TASK-010/TASK-018: scaffold bike-pilot parallel content structure`
  - `TASK-011/TASK-016: implement bike-pilot formal runtime and styles`
  - `TASK-017: build localized bike-pilot marketing page`
- **Wynik test gate:** Przeszedł — `npm test` po wdrożeniu logiki i treści: Vitest 30/30 oraz
  `node:test` 9/9; dodatkowo celowany przebieg `npx playwright test test/e2e/bike-pilot.spec.js --project=chromium`
  zakończony wynikiem 83/83.
- **Weryfikacja wsteczna:** REQ-018–REQ-025 pokryte implementacyjnie; brak zmian w istniejących
  plikach `content/bike-pilot/<lang>/*.html` potwierdzony dwoma niezależnymi mechanizmami:
  (1) fixture hashy `test/fixtures/bike-pilot-legacy-hashes.json` + test `node:test`,
  (2) ręczny `git diff --stat` na 19 katalogach językowych zwracający pusty wynik.
- **Aktualizacja dokumentacji/instrukcji obsługi:** komentarze TASK-011/TASK-012/TASK-015/TASK-017
  dopisane w nowych modułach `content/bike-pilot/js/*.js`; nowy znak aplikacji dodany jako
  `content/bike-pilot/img/bike-pilot-mark.svg`.

### LOG-007: TASK-019 — pełna walidacja bike-pilot i stan przyrostu po wdrożeniu
- **Data:** 2026-09-07
- **Zakres iteracji:** Grupa `bike-pilot` — walidacja końcowa i status
- **Persony zaangażowane:** Web Frontend QA Strategy Engineer, Web Frontend Test Engineer,
  Requirements Analyst, Technical Writer, Code Reviewer
- **Wynik weryfikacji wg macierzy traceability (`plan/index.md`):**
  | REQ | Status | Dowód |
  |-----|--------|-------|
  | REQ-018 | Zgodne | nowa równoległa struktura `content/bike-pilot/` + 76 plików JSON + brak zmian w starej strukturze (hash test + `git diff`) |
  | REQ-019 | Zgodne | `js/language.js`, testy jednostkowe dopasowania exact/prefix/fallback, E2E 19 języków × 4 strony |
  | REQ-020 | Zgodne | przełącznik języka na wszystkich 4 stronach, E2E bez pełnego reloadu (`performance.getEntriesByType('navigation') === 1`) |
  | REQ-021 | Zgodne | `bp_lang` w cookie z `Max-Age`, `Path=/`, `SameSite=Lax`; testy jednostkowe i E2E trwałości między stronami |
  | REQ-022 | Zgodne | wspólny baner `bp_consent` na 4 stronach, blokada zapisu cookie przed zgodą zweryfikowana E2E |
  | REQ-023 | Zgodne | `css/formal.css` + `css/support.css`, spójny minimalistyczny układ z dyskretnym logo |
  | REQ-024 | Zgodne | nowa marketingowa `index.html` z własnym `css/index.css` i `js/index.js`, bez użycia `en/merketing/` |
  | REQ-025 | Zgodne | marketing `content/<lang>.json` dla wszystkich 19 języków, E2E renderowania i przełączania |
- **Commit:** `TASK-019: add bike-pilot unit, node, and E2E coverage`
- **Wynik test gate:** Przeszedł — pełny zestaw po wdrożeniu: `npm test` (Vitest 30/30 +
  `node:test` 9/9) oraz `npx playwright test` (291/291 na Chromium/WebKit/Firefox, w tym
  nowy pakiet bike-pilot 249/249 i axe-core: 0 naruszeń A/AA na 4 nowych stronach).
- **Weryfikacja wsteczna:** Stary zestaw `sample-app` nadal zielony (42/42 E2E), co potwierdza brak
  regresji w istniejącej infrastrukturze; nowe testy bike-pilot dodatkowo dowodzą poprawnego
  renderowania dokumentów formalnych i marketingu dla wszystkich 19 języków.
- **Otwarte punkty przed pierwszą produkcyjną publikacją `bike-pilot` (nie blokują zamknięcia tej
  iteracji implementacyjnej):**
  1. Manualna checklista mobile Safari (iOS)/Chrome (Android) na rzeczywistych urządzeniach,
     analogicznie do ograniczenia już odnotowanego dla grupy `appstore-docs` (REQ-011 / wpływ na
     REQ-019–REQ-025).
  2. Natywna/lokalizacyjna korekta marketingowych tłumaczeń 18 plików `content/<lang>.json`
     przed publikacją produkcyjną — formalne dokumenty prawne pochodzą z istniejących,
     zatwierdzonych plików źródłowych, ale nowe treści marketingowe zostały przygotowane w tej
     iteracji i powinny przejść przegląd native speakera / copywritera dla maksymalnej jakości.
  3. Powtórzenie audytu Lighthouse na docelowej infrastrukturze hostingowej przed publikacją
     produkcyjną całego repozytorium (otwarty punkt LOG-003/LOG-005 nadal pozostaje aktualny).
- **Aktualizacja dokumentacji/instrukcji obsługi:** `docs/readme.md` zaktualizowany o zamknięcie
  grupy `bike-pilot`, wyniki testów i otwarte punkty produkcyjne.

### LOG-008: TASK-020–TASK-022 — treść formalna bez HTML w JSON (REQ-026)
- **Data:** 2026-09-07
- **Zakres iteracji:** Grupa `bike-pilot` — dodatek TASK-020–TASK-022 (REQ-026)
- **Persony zaangażowane:** Web Frontend Software Architect, Web Frontend Software Engineer,
  Technical Writer, Code Reviewer
- **Podsumowanie zmian:**
  1. **TASK-020:** Zdefiniowano i udokumentowano (komentarz nagłówkowy w
     `content/bike-pilot/js/formal.js`) schemat modelu danych `{ title, blocks[] }` z typami bloków
     `heading | paragraph | list | table` i segmentami `runs[]` (`text`/`bold`/`italic`/`code`/
     `href`/`break`). Dodano `validateDocumentModel()` — walidator fail-fast odrzucający nieznany
     `type` bloku, nieznany klucz w `runs`, brakujące wymagane pola (np. `level` nagłówka,
     `ordered`/`items` listy, `headers`/`rows` tabeli, `text` runa bez `break`).
  2. **TASK-021:** Przebudowano `injectDocumentContent`/dodano `renderDocumentContent` w
     `content/bike-pilot/js/formal.js` — treść dokumentu jest teraz budowana wyłącznie przez
     `document.createElement`/`textContent`/`appendChild` na podstawie `blocks[]`/`runs[]`, bez
     żadnego przypisania do `innerHTML` dla treści dokumentu (nagłówki, akapity z formatowaniem
     inline, listy uporządkowane/nieuporządkowane, tabele z `<thead>`/`<tbody>`).
  3. **TASK-022:** Rozszerzono `scripts/extract-bikepilot-content.mjs` o parser HTML→blocks/runs
     oparty na `happy-dom` (już obecny jako devDependency) i zregenerowano wszystkie 57 plików
     `content/bike-pilot/formal/{privacy-policy,terms-of-use,support}/<lang>.json` — żaden nie
     zawiera już pola `html` ani ciągu ze znacznikiem HTML. Pliki źródłowe `content/bike-pilot/
     <lang>/*.html` pozostały nietknięte (fixture hashy TASK-019 nadal zielony).
- **Rozważone alternatywy i uzasadnienie wyboru:** jak udokumentowano w `plan/bike-pilot.md`
  (TASK-020/TASK-021/TASK-022) — model płaski `blocks[]` zamiast zagnieżdżonych `sections[]`, DOM
  API zamiast budowania fragmentu HTML jako string lub `createContextualFragment` (uniknięcie
  wszelkiego parsowania HTML w runtime), skrypt Node rozszerzający istniejącą ekstrakcję zamiast
  ręcznej konwersji 57 plików.
- **Commit:** `TASK-020/TASK-021/TASK-022: replace bike-pilot formal HTML JSON with blocks/runs model`
- **Wynik test gate:** Przeszedł — `npm test` (Vitest 42/42, w tym 16 nowych/przebudowanych testów
  `test/unit/formal.test.js` pokrywających walidator i renderer dla każdego typu bloku/runa, oraz
  `node:test` 10/10, w tym dwa nowe testy w `test/node/bike-pilot-content.test.mjs`: zgodność
  schematu + brak HTML dla 57/57 plików, i regresja tekstowa 57/57 wobec „złotego” tekstu
  wyekstrahowanego z poprzedniej wersji plików z polem `html` — zapisanego przed regeneracją w
  `test/fixtures/bike-pilot-formal-golden.json`) oraz pełny `npx playwright test` (291/291 na
  Chromium/WebKit/Firefox, w tym pakiet `bike-pilot` 249/249 i axe-core: 0 naruszeń A/AA na 4
  stronach bike-pilot).
- **Weryfikacja wsteczna:** Brak regresji tekstowej/strukturalnej potwierdzony testem golden-text
  dla wszystkich 57 plików (nagłówki, akapity, listy, tabele, formatowanie inline, `<br>`, linki);
  brak regresji w pozostałych grupach (`appstore-docs`, `sample-app`) potwierdzony pełnym przebiegiem
  Playwright (291/291, w tym 42/42 `sample-app`).
- **Aktualizacja dokumentacji/instrukcji obsługi:** `docs/readme.md` zaktualizowany o zamknięcie
  TASK-020–TASK-022; schemat modelu danych udokumentowany bezpośrednio w kodzie
  (`content/bike-pilot/js/formal.js`, komentarz nagłówkowy).
