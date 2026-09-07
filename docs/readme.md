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
- **Status:** Zaakceptowane (31/31 wymagań ze statusem "Zaakceptowane", 0 otwartych pytań).
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`requirements/appstore-docs.md`](dev/requirements/appstore-docs.md) | REQ-001–REQ-017 | Struktura, renderowanie klienckie, szablony/override, i18n/fallback, macierz przeglądarek, dostępność/wydajność, brak zależności do dodatkowych bibliotek JS. |
  | [`requirements/bike-pilot.md`](dev/requirements/bike-pilot.md) | REQ-018–REQ-031 | Pilotaż nowej architektury (na podstawie `docs/dev/requirements/ideas.md`) dla aplikacji bike-pilot: szablon+JSON per język (zamiast pliku per język), wykrywanie/przełącznik/trwałe zapamiętanie języka (cookie), klauzula zgody na cookies, strona marketingowa — dodane **obok** istniejącej struktury `content/bike-pilot/<lang>/*.html`, bez jej zmiany, ograniczone do `content/bike-pilot/`; REQ-026 doprecyzowuje, że treść formalna w JSON jest ustrukturyzowana (model blocks/runs), bez znaczników HTML; REQ-027–REQ-031 (recenzja post-implementacyjna) — **zaimplementowane i zweryfikowane**, wpisy zarchiwizowane w [`requirements/archive/bike-pilot.md`](dev/requirements/archive/bike-pilot.md): ciemny motyw z akcentami pomarańczowymi, spójność nazewnictwa dokumentów, wersjonowanie dokumentów formalnych, usunięcie etykiety "Language" z nagłówka, powiększenie logo o 150%/1.5×. |

### Plan pracy (`docs/dev/plan/`)
- **Status:** Grupa `appstore-docs` zaimplementowana w całości (Scenariusz 4, TASK-001–TASK-009
  `Done`). Grupa `bike-pilot` (TASK-010–TASK-019) — **zaimplementowana i zweryfikowana**. Dodatek
  TASK-020–TASK-022 (REQ-026, format treści formalnej JSON bez HTML) — **zaimplementowany i
  zweryfikowany**. Dodatek TASK-023–TASK-028 (REQ-027–REQ-031, recenzja post-implementacyjna) —
  **zaimplementowany i zweryfikowany**, wpisy zarchiwizowane w
  [`plan/archive/bike-pilot.md`](dev/plan/archive/bike-pilot.md) (pointer w `plan/bike-pilot.md`).
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`plan/appstore-docs.md`](dev/plan/appstore-docs.md) | TASK-001–TASK-009 | Scaffolding struktury, silnik renderujący, szablon bazowy, mechanizm override, spec plików wejściowych, fallback językowy, walidacja cross-browser/a11y/performance, przewodnik autorski + bazowe pliki `sample-app`, rozszerzenie `sample-app` do pełnej referencyjnej aplikacji QA. |
  | [`plan/bike-pilot.md`](dev/plan/bike-pilot.md) | TASK-010–TASK-028 | Scaffolding nowej struktury równoległej, silnik JSON→HTML, wykrywanie/przełącznik/zapamiętanie języka, baner zgody na cookies, style formalne, strona marketingowa, treść JSON dla 19 języków, walidacja e2e + regresja starej struktury; TASK-020–TASK-022 (dodatek) zastępują format treści formalnej JSON HTML → model blocks/runs bez znaczników; TASK-023–TASK-028 (dodatek) — ciemny motyw z akcentami pomarańczowymi, spójność nazewnictwa, wersjonowanie dokumentów, usunięcie etykiety "Language", powiększenie logo 1.5×, walidacja zbiorcza — **zaimplementowane i zweryfikowane**, zarchiwizowane w [`plan/archive/bike-pilot.md`](dev/plan/archive/bike-pilot.md). |
- **Log decyzji/eskalacji:** 14 wpisów w `plan/index.md` (fallback językowy, macierz przeglądarek,
  mechanizm techniczny fallbacku, brak zależności do dodatkowych bibliotek JS, scalenie aplikacji
  przykładowej z aplikacją referencyjną `sample-app`; dla grupy `bike-pilot`: koegzystencja ze starą
  strukturą, zakres pilotażu ograniczony do bike-pilot, los prototypu marketingowego `en/merketing/`,
  mechanizm trwałości języka (cookie), zakres banera zgody na cookies, format treści JSON (blocks/runs
  bez HTML); z recenzji post-implementacyjnej 2026-09-07: nazwa kanoniczna PL "Terms of Use",
  interpretacja "powiększ logo na 150%", granularność/format wersjonowania dokumentów).

### Log implementacji (`docs/dev/log.md`)
- **Status:** Utworzony — 8 wpisów (LOG-001–LOG-008), zakres iteracji: `appstore-docs` +
  `bike-pilot` (w tym dodatek TASK-020–TASK-022, REQ-026).
- **Wynik testów:** `npm test` (Vitest 44/44 jednostkowe + `node:test` 12/12) i `npx playwright test`
  (498/498 E2E na Chromium/WebKit/Firefox, w tym bike-pilot 456/456 oraz axe-core: 0 naruszeń A/AA
  na 4 stronach, w tym ciemny motyw TASK-023 na 3×19 stronach formalnych) — wszystkie zielone (stan
  po dodatku TASK-023–TASK-028; LOG-008 nie zaktualizowany dla tego dodatku — Scenariusz 4 nie
  zapisuje do `docs/dev/log/`, zob. wpis w sekcji "Ostatnia aktualizacja" poniżej).
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
  współdzielony `js/language.js`, lokalne silniki `js/formal.js` (model treści formalnej
  `blocks[]`/`runs[]`, walidator + renderer DOM bez `innerHTML` treści — REQ-026) i `js/index.js`,
  style `css/formal.css`, `css/support.css`, `css/index.css`, 57 plików `formal/<typ>/<lang>.json`
  (ustrukturyzowana treść bez znaczników HTML), 19 plików `content/<lang>.json`, wspólny baner
  zgody na cookies i lokalne przełączanie języka.
- `content/sample-app/` — aplikacja referencyjna: `en/`+`de/` kompletne, `pl/` celowo niekompletny
  (demonstracja fallbacku), `marketing-disclosure.html` (dodatkowy typ dokumentu), pełny
  `template/override.css`.
- `docs/authoring-guide.md` — przewodnik autorski (REQ-012/REQ-013), 5 kroków + minimalny szablon
  pliku wejściowego.
- `scripts/fallback-languages.js` — narzędzie publikacyjne (build-time fallback językowy, REQ-010).
- `scripts/extract-bikepilot-content.mjs` — jednorazowy skrypt ekstrakcji 57 istniejących plików
  `content/bike-pilot/<lang>/*.html` do równoległych JSON-ów formalnych (TASK-018); od TASK-022
  mapuje treść na model `blocks[]`/`runs[]` (parser HTML→blocks oparty na `happy-dom`) zamiast
  surowego pola `html`.
- `scripts/dev-server.js` — lokalny serwer statyczny do developmentu/E2E (narzędzie deweloperskie).
- Testy: `test/unit/` (Vitest+happy-dom), `test/node/` (`node:test`), `test/e2e/` (Playwright +
  axe-core). Uruchomienie: `npm test` (jednostkowe) / `npx playwright test` (E2E).

## Audyty / raporty (`docs/dev/audits/`, `docs/dev/reports/`)
- [`reports/2026-09-07-bike-pilot-review.md`](dev/reports/2026-09-07-bike-pilot-review.md) —
  recenzja wizualna/UX wdrożonego pilotażu bike-pilot (7 punktów: ciemny motyw, akcenty
  pomarańczowe, spójność nazewnictwa, wersjonowanie, etykieta języka, rozmiar logo), sformalizowana
  jako REQ-027–REQ-031 i TASK-023–TASK-028 (zob. wyżej).

## Ostatnia aktualizacja
**Najnowsza aktualizacja (2026-09-07, Scenariusz 4):** Zaimplementowano cały dodatek
TASK-023–TASK-028 (REQ-027–REQ-031) w jednej iteracji (decyzja użytkownika: "all"): (1) ciemny
motyw `formal.css` z akcentami pomarańczowymi (`#f48525`, odcień ~28°, kontrast tekstu ≥ 7.7:1)
na 3 stronach formalnych, `index.html` nietknięty (poza zakresem REQ-027); (2) poprawiono 10
rozbieżności nazewnictwa `navPrivacy`/`navTerms`/`navSupport` vs `title` w `js/language.js` — 0/57
rozbieżności po zmianie; (3) dodano pole `version` (`MAJOR.MINOR`, wspólne per typ dokumentu) do
schematu (`js/formal.js`, `validateDocumentModel`), do wszystkich 57 plików
`formal/<typ>/<lang>.json` oraz renderowanie obok daty aktualizacji (`[data-doc-version]`),
udokumentowano politykę wersjonowania w `docs/authoring-guide.md` (§7); (4) ukryto wizualnie
etykietę "Language" (nowa klasa `.sr-only`) na 4 stronach z zachowaniem nazwy dostępnej `<select>`;
(5) powiększono logo do 1.5× (atrybuty HTML + CSS `height`, które nadpisywały rozmiar) na 4
stronach. Rozszerzono testy: Vitest (18 testów w `formal.test.js`, w tym walidacja/renderowanie
`version`), `node:test` (2 nowe testy regresyjne — 57 par nazewnictwa, 57 plików wersji), Playwright
(nowe bloki TASK-023/025/026/027/028, w tym axe-core na ciemnym motywie dla 3×19 stron formalnych).
Wynik: `npm test` 44/44 + `node --test` 12/12 zielone; `npx playwright test` 498/498 zielone na
Chromium/WebKit/Firefox (0 naruszeń axe-core A/AA), `git diff --stat` na 19 katalogów
`content/bike-pilot/<lang>/*.html` pusty (brak regresji). Code Reviewer: brak istotnych zastrzeżeń.
Weryfikacja wsteczna (Scenariusz 4, krok 5) potwierdziła zgodność ze wszystkimi kryteriami akceptacji
REQ-027–REQ-031 — wpisy TASK-023–TASK-028/REQ-027–REQ-031 zarchiwizowane (Zasady globalne, pkt 11)
do [`plan/archive/bike-pilot.md`](dev/plan/archive/bike-pilot.md) i
[`requirements/archive/bike-pilot.md`](dev/requirements/archive/bike-pilot.md); pliki aktywne
zawierają odtąd tylko wiersze-wskaźniki dla tych ID.

**Poprzednia aktualizacja (2026-09-07, Scenariusz 2 → Scenariusz 3, planowanie — bez implementacji):**
Sformalizowano
`docs/dev/reports/2026-09-07-bike-pilot-review.md` (recenzja wdrożonego pilotażu bike-pilot) jako
REQ-027–REQ-031 (`requirements/bike-pilot.md`) i zaplanowano TASK-023–TASK-028
(`plan/bike-pilot.md`, dodatek do grupy `bike-pilot`): ciemny motyw z akcentami pomarańczowymi
spójnymi z `img/logo.png` dla 3 stron formalnych (REQ-027/TASK-023), spójność nazewnictwa
dokumentów między `title` (JSON) a etykietami nawigacyjnymi `js/language.js` — w tym znana
niespójność `pl.navTerms` (REQ-028/TASK-024), wersjonowanie semantyczne (`MAJOR.MINOR`, wspólne per
typ dokumentu dla 19 języków) rozszerzające model danych z REQ-026 (REQ-029/TASK-025), usunięcie
widocznej etykiety "Language" z nagłówka z zachowaniem dostępności — technika "visually hidden"
(REQ-030/TASK-026), powiększenie logo do 1.5× obecnego rozmiaru na 4 stronach (REQ-031/TASK-027)
oraz zbiorcza walidacja e2e/a11y/regresji (TASK-028). Niejednoznaczności raportu (nazwa kanoniczna
PL, interpretacja "150%", format/granularność wersjonowania) rozstrzygnięte z użytkownikiem
(2026-09-07) — zob. `plan/index.md`, wpisy 12–14 w Logu decyzji. **Status: zaplanowane, oczekuje na
implementację (Scenariusz 4)** — brak zmian w kodzie produkcyjnym na tym etapie.

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

**Najnowsza aktualizacja (2026-09-07, Scenariusz 4):** Zaimplementowano dodatek TASK-020–TASK-022
(REQ-026) — treść formalna bike-pilot bez HTML w JSON. Zdefiniowano i udokumentowano w kodzie
(`content/bike-pilot/js/formal.js`) model danych `{ title, blocks[] }`/`runs[]` z walidatorem
fail-fast (`validateDocumentModel`); przebudowano renderowanie tak, by budować DOM wyłącznie przez
`document.createElement`/`textContent` (bez `innerHTML` treści); rozszerzono
`scripts/extract-bikepilot-content.mjs` o parser HTML→blocks/runs (oparty na `happy-dom`) i
zregenerowano wszystkie 57 plików `formal/<typ>/<lang>.json` — żaden nie zawiera już pola `html`
ani znaczników HTML. Zweryfikowano brak regresji tekstowej/strukturalnej testem golden-text wobec
treści sprzed zmiany (57/57 plików) oraz pełnym zestawem `npm test` (Vitest 42/42 + `node:test`
10/10) i `npx playwright test` (291/291, w tym bike-pilot 249/249, axe-core 0 naruszeń A/AA).
Pliki źródłowe `content/bike-pilot/<lang>/*.html` pozostały nietknięte (fixture hashy TASK-019
nadal zielony). Zob. `docs/dev/log.md`, LOG-008.
