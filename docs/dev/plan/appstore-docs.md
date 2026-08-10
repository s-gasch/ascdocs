# Plan pracy — grupa: appstore-docs

> Część `docs/dev/plan/index.md` — patrz tam: Przegląd, Macierz traceability, DoD przyrostu, Strategia
> testowania (przegląd), Diagram, Log decyzji.

### TASK-001: Scaffolding struktury katalogów `content/`
- **Traceability:** REQ-002, REQ-001, REQ-009
- **Podejście techniczne:** Utworzyć bazową strukturę katalogów: `content/common/{css,js,templates}/`
  oraz konwencję `content/<app-name>/{template/,<lang>/}`. Brak kroku build — struktura na dysku jest
  strukturą produkcyjną (spójne z REQ-001). Dodać `content/common/README.md` (krótki, techniczny —
  odróżniony od pełnego przewodnika autorskiego z TASK-008) opisujący przeznaczenie każdego
  podkatalogu.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Płaska struktura `content/<app-name>-<lang>-
  <doc>.html` bez zagnieżdżenia — odrzucona: utrudnia skalowanie i narusza wprost wskazaną w
  REQ-002 strukturę katalogową. (b) Struktura z osobnym katalogiem `templates/` na poziomie root
  (poza `content/`) — odrzucona: rozdziela logicznie powiązane zasoby (treść i szablon danej
  aplikacji) między dwa różne miejsca w drzewie, utrudniając nawigację. Wybrano strukturę zgodną z
  REQ-002 dosłownie, jako najprostszą i najbardziej przewidywalną (Zasady globalne, pkt 7).
- **Zależności:** brak
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Struktura katalogów istnieje na dysku zgodnie z REQ-002; dodanie nowego
  `content/<app-name>/en/` nie wymaga zmian w żadnym innym katalogu.
- **Definition of Done (zadanie):** Struktura scaffoldowana i zacommitowana; test gate: przegląd
  struktury przez Code Reviewer potwierdza zgodność 1:1 z REQ-002.
- **Strategia testowania:** Weryfikacja manualna/checklist zgodności struktury z REQ-002 (brak logiki
  do testowania jednostkowego na tym etapie).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-002: Silnik renderujący (JS) — kompozycja treści i szablonu
- **Traceability:** REQ-001, REQ-003, REQ-004, REQ-005, REQ-006, REQ-017
- **Podejście techniczne:** Moduł ES (`content/common/js/render.js`) ładowany przez `<script
  type="module">` w każdym pliku wejściowym. Kontrakt: plik wejściowy zawiera treść wewnątrz
  dedykowanego kontenera (np. `<template id="doc-content">` lub `<main data-doc-content>`), a moduł po
  `DOMContentLoaded`: (1) odczytuje treść z kontenera, (2) ustala źródło szablonu — sprawdza istnienie
  `content/<app-name>/template/` (nadpisanie, REQ-005) i w razie braku używa
  `content/common/templates/` (REQ-006), (3) komponuje finalny DOM (nagłówek/nawigacja/stopka wokół
  treści). Brak frameworka — vanilla JS/Web APIs (zgodnie z domyślną zasadą Domeny B: framework tylko
  przy realnej potrzebie).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Framework typu Lit/Web Components pełny —
  odrzucone: nadmiarowe dla 3 prostych typów dokumentów, wprowadza zależność zewnętrzną bez wyraźnej
  korzyści (naruszałoby zasadę domyślnie vanilla). (b) Renderowanie po stronie build (np. statyczny
  generator w Node.js, wynik = gotowe pliki HTML) — odrzucone: wprost sprzeczne z REQ-004
  ("renderowanie... tylko w przeglądarce w JS"). (c) Custom Elements (np. `<asc-document>`) zamiast
  zwykłego modułu inicjalizującego DOM — rozważone jako alternatywa: dają enkapsulację, ale dodają
  niepotrzebną złożoność (Shadow DOM utrudniłby dziedziczenie stylu common→override z REQ-007).
  Wybrano prosty moduł ES z jawną funkcją inicjalizującą jako najprostsze rozwiązanie spełniające
  wymagania (Zasady globalne, pkt 7). **Zgodność z REQ-017:** moduł nie importuje ani nie ładuje
  żadnej zewnętrznej biblioteki/frameworka JS — wyłącznie natywne Web API (`customElements` nieużyte,
  `fetch`, DOM API standardowe).
- **Zależności:** TASK-001
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Dla pliku wejściowego bez własnego szablonu aplikacji, po załadowaniu strony
  DOM zawiera złożoną strukturę (nagłówek + treść + stopka) pochodzącą z `content/common/templates/`;
  dla aplikacji z `template/` — z szablonu aplikacji. Kod modułu nie zawiera importu żadnej zewnętrznej
  biblioteki JS (REQ-017).
- **Definition of Done (zadanie):** Moduł zaimplementowany, pokryty testami jednostkowymi (patrz
  Strategia testowania), brak błędów w konsoli przeglądarki przy renderowaniu przykładowego dokumentu.
- **Strategia testowania:** Jednostkowe (Vitest + `happy-dom`) — pokrycie: rozwiązywanie źródła szablonu
  (override obecny/nieobecny), poprawność ekstrakcji treści z kontenera, obsługa brakującego
  kontenera treści (błąd jawny, nie cichy fallback). Kryterium przejścia: 100% pokrycia gałęzi logiki
  wyboru szablonu.
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** Web Platform Documentation Researcher potwierdził (REQ-004): ES modules
  wspierane we wszystkich przeglądarkach z macierzy REQ-011 — brak ryzyka kompatybilności.

### TASK-003: Szablon bazowy HTML/CSS (`content/common/`)
- **Traceability:** REQ-004, REQ-006, REQ-014, REQ-015, REQ-016
- **Podejście techniczne:** Semantyczny szablon HTML (landmark roles: `header`, `nav`, `main`,
  `footer`), CSS mobile-first z media queries progresywnie rozszerzającymi layout dla szerszych
  viewportów, zmienne CSS (custom properties) na poziomie `:root` jako punkty rozszerzenia dla
  override per aplikacja (przygotowanie pod TASK-004). Optymalizacja wydajności: pojedynczy mały plik
  CSS krytyczny inline'owany lub ładowany blokująco tylko dla stylu bazowego layoutu (unikanie CLS),
  reszta (nice-to-have) asynchronicznie.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) CSS framework (np. utility-first) — odrzucone:
  nadmiarowe dla prostego, treściowego layoutu 3 typów dokumentów; zwiększa rozmiar transferu bez
  korzyści dla Core Web Vitals (REQ-016). (b) CSS-in-JS generowany przez silnik renderujący — odrzucone:
  utrudnia cache'owanie przeglądarki (statyczny plik `.css` cache'uje się niezależnie od treści) i
  wprowadza zależność stylu od wykonania JS, co szkodzi LCP/CLS. Wybrano statyczny plik CSS + custom
  properties jako najlepsze rozwiązanie pod kątem wydajności i prostoty (Zasady globalne, pkt 7).
- **Zależności:** TASK-002
- **Właściciel/rola:** Web Frontend Software Architect + Web Frontend Software Engineer
- **Acceptance Criteria:** Szablon renderuje się poprawnie od 320px szerokości viewportu wzwyż (REQ-015);
  landmarki i nagłówki obecne i w poprawnej hierarchii (REQ-014).
- **Definition of Done (zadanie):** Szablon zaimplementowany; test gate: axe-core 0 naruszeń poziomu
  A/AA na wyrenderowanej stronie referencyjnej; Lighthouse mobile w progu "dobry" dla LCP/CLS/INP.
- **Strategia testowania:** E2E (Playwright, render + snapshot DOM) dla poprawności landmarków;
  accessibility (axe-core, zintegrowane z Playwright) jako test gate; performance (Lighthouse CI) na
  stronie referencyjnej z TASK-009.
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** brak.

### TASK-004: Mechanizm nadpisania szablonu/stylu per aplikacja
- **Traceability:** REQ-005, REQ-007, REQ-017
- **Podejście techniczne:** Dwa niezależne poziomy nadpisania: (1) **Styl** — plik opcjonalny
  `content/<app-name>/template/override.css` ładowany zawsze *po* `content/common/templates/base.css`,
  nadpisujący wyłącznie zdefiniowane w TASK-003 custom properties (np. `--asc-accent-color`,
  `--asc-font-heading`) — bez potrzeby duplikowania reguł strukturalnych. (2) **Struktura szablonu** —
  opcjonalny plik/zestaw plików `content/<app-name>/template/template.html` (+ ewentualny
  `template.js`), używany przez silnik renderujący z TASK-002 zamiast szablonu bazowego, gdy istnieje.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Wymuszenie pełnego przedefiniowania szablonu przy
  każdym override (brak rozróżnienia styl/struktura) — odrzucone: narusza REQ-007 ("bez konieczności
  kopiowania całego arkusza stylów wspólnego"). (b) Nadpisanie przez SASS/LESS z kompilacją — odrzucone:
  wprowadza krok build, sprzeczny z REQ-001. Wybrano CSS custom properties + opcjonalny override
  struktury jako rozwiązanie minimalizujące duplikację przy zachowaniu pełnej elastyczności, gdy jest
  potrzebna (Zasady globalne, pkt 7).
- **Zależności:** TASK-002, TASK-003
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zmiana wyłącznie `--asc-accent-color` w `override.css` jednej aplikacji
  zmienia jej wygląd bez wpływu na inne aplikacje (REQ-007, kryterium akceptacji dosłowne).
- **Definition of Done (zadanie):** Mechanizm zaimplementowany i pokryty testem E2E na 2 aplikacjach
  przykładowych (jedna z override, jedna bez).
- **Strategia testowania:** E2E (Playwright) — porównanie obliczonych stylów (`getComputedStyle`)
  elementu akcentu między aplikacją z override a bez; jednostkowe — logika wyboru pliku szablonu
  (współdzielona z TASK-002).
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** brak.

### TASK-005: Specyfikacja plików wejściowych i rozszerzalność typów dokumentów
- **Traceability:** REQ-003, REQ-008
- **Podejście techniczne:** Formalna specyfikacja (część `docs/authoring-guide.md`, TASK-008, ale
  zdefiniowana tutaj jako kontrakt techniczny): minimalna struktura pliku wejściowego = `<!doctype
  html>` + `<html lang="...">` + `<head>` z odwołaniami do wspólnego/ specyficznego CSS/JS + `<body>`
  zawierające dokładnie jeden kontener treści zgodny z kontraktem TASK-002. Dodanie nowego typu
  dokumentu = nowy plik `.html` zgodny z tą specyfikacją w `content/<app-name>/<lang>/` — bez zmian w
  `content/common/`.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Rejestr typów dokumentów w centralnym pliku
  konfiguracyjnym (np. `content/common/doc-types.json`) — odrzucone jako nadmiarowe: silnik renderujący
  nie potrzebuje wiedzieć o "typach" dokumentów, tylko o obecności kontenera treści; dodanie pliku
  wystarcza samo w sobie (REQ-008 dosłownie: "bez zmian w content/common/"). Wybrano rozwiązanie
  najprostsze spełniające wymaganie.
- **Zależności:** TASK-001
- **Właściciel/rola:** Web Frontend Software Architect
- **Acceptance Criteria:** Dodanie pliku `content/<app-name>/<lang>/marketing-disclosure.html` zgodnego
  ze specyfikacją renderuje się poprawnie bez jakiejkolwiek zmiany w `content/common/`.
- **Definition of Done (zadanie):** Specyfikacja spisana i zweryfikowana przez dodanie jednego
  dodatkowego, nietypowego dokumentu testowego w aplikacji referencyjnej (TASK-009).
- **Strategia testowania:** E2E (Playwright) — dodanie nowego typu dokumentu w projekcie testowym i
  weryfikacja poprawnego renderowania bez zmian w `content/common/` (diff repozytorium jako część
  asercji testu).
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** brak.

### TASK-006: Fallback językowy do wersji angielskiej
- **Traceability:** REQ-009, REQ-010
- **Podejście techniczne:** Zgodnie z Logiem decyzji #3 (`plan/index.md`) — mechanizm **build-time /
  publish-time**: skrypt narzędziowy (Node.js, uruchamiany lokalnie/w CI, nie na serwerze produkcyjnym
  — zgodne z REQ-001, bo to narzędzie deweloperskie, nie runtime) przegląda `content/<app-name>/`,
  wykrywa języki występujące w co najmniej jednej aplikacji, i dla każdej aplikacji/języka/dokumentu
  bez odpowiadającego pliku — kopiuje plik z `en/` do brakującej lokalizacji `<lang>/` jako część
  procesu publikacji (przed wdrożeniem na hosting statyczny), oznaczając skopiowany plik komentarzem
  HTML `<!-- fallback: en -->` dla przejrzystości audytu.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Runtime JS: `fetch()` próbne dla `<lang>/...`,
  przy błędzie 404 przekierowanie do `en/...` — odrzucone: wymaga dodatkowego żądania sieciowego
  (opóźnienie, potencjalny flash treści), a dokładne wykrycie "błędu 404 dla dokumentu" wymaga
  dodatkowej logiki po stronie klienta większej niż uzasadnia to prostota rozwiązania; nie działa dla
  bezpośrednich odnośników linkowanych w App Store Connect, które muszą wskazywać istniejący,
  konkretny URL. (b) Przekierowanie na poziomie hostingu (np. reguły serwera statycznego typu Netlify
  `_redirects`) — rozważone jako uzupełnienie, ale niejednoznaczne wobec REQ-001 (zależność od
  konkretnego dostawcy hostingu); build-time copy działa niezależnie od dostawcy. Wybrane: build-time
  copy jako rozwiązanie przenośne, testowalne i niezależne od hostingu (Zasady globalne, pkt 7).
- **Zależności:** TASK-002
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Dla aplikacji z brakującym `pl/support.html`, po uruchomieniu skryptu
  publikacji plik `content/<app-name>/pl/support.html` istnieje i jest kopią (z adnotacją fallback)
  `en/support.html`; URL `content/<app-name>/pl/support.html` otwiera się poprawnie.
- **Definition of Done (zadanie):** Skrypt zaimplementowany, udokumentowany w `docs/authoring-guide.md`
  (TASK-008), pokryty testem jednostkowym.
- **Strategia testowania:** Jednostkowe (Node.js test runner) — scenariusze: brak pliku językowego
  (kopiowany z adnotacją), plik istnieje (nietknięty), brak nawet `en/` (błąd jawny zatrzymujący
  publikację, ponieważ REQ-009 wymaga zawsze istniejącego `en/`).
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** Wymaga procesu publikacji (skrypt uruchamiany przed wdrożeniem) — do
  udokumentowania w `docs/authoring-guide.md` jako krok obowiązkowy przed publikacją zmian treści.

### TASK-007: Walidacja cross-browser, dostępności i wydajności
- **Traceability:** REQ-011, REQ-014, REQ-015, REQ-016
- **Podejście techniczne:** Zestaw testów Playwright uruchamiany na silnikach Chromium, WebKit,
  Firefox (pokrycie desktop Chrome/Edge/Safari/Firefox przez silniki równoważne) + manualna checklista
  dla rzeczywistego mobile Safari (iOS) i Chrome (Android, przez urządzenie/emulator), zgodnie z
  macierzą REQ-011. Integracja `axe-core` z testami Playwright (REQ-014) oraz Lighthouse CI (REQ-016)
  jako część tego samego przebiegu walidacyjnego.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Wyłącznie manualne testy cross-browser bez
  automatyzacji — odrzucone: nie skaluje się przy kolejnych aplikacjach/dokumentach dodawanych w
  przyszłości; Playwright pokrywa 3 z 4 wymaganych silników automatycznie. (b) BrowserStack/Sauce Labs
  do pełnej automatyzacji łącznie z realnym mobile Safari — rozważone jako ulepszenie, ale wprowadza
  zależność od płatnej usługi zewnętrznej bez wyraźnej potrzeby na tym etapie; pozostawione jako opcja
  do rozważenia przy skalowaniu liczby aplikacji (odnotowane jako ryzyko/otwarta decyzja).
- **Zależności:** TASK-003, TASK-004, TASK-005, TASK-006
- **Właściciel/rola:** Web Frontend QA Strategy Engineer
- **Acceptance Criteria:** Zestaw testów przechodzi (zielony) na Chromium/WebKit/Firefox dla wszystkich
  3 typów dokumentów aplikacji referencyjnej (TASK-009); axe-core 0 naruszeń A/AA; Lighthouse mobile w
  progu "dobry" dla LCP/INP/CLS; manualna checklista mobile Safari/Chrome Android podpisana jako
  zaliczona.
- **Definition of Done (zadanie):** Wszystkie powyższe kryteria spełnione i udokumentowane (raport
  wyników jako artefakt CI lub log w PR).
- **Strategia testowania:** To zadanie *jest* strategią testowania end-to-end/cross-browser/
  accessibility/performance dla całego przyrostu — kryterium przejścia: zero błędów krytycznych, zero
  naruszeń A/AA, metryki CWV w progu "dobry".
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** Automatyzacja pełnego mobile Safari/Chrome Android wymaga usługi
  zewnętrznej (BrowserStack lub podobne) lub fizycznych urządzeń — do decyzji przy skalowaniu projektu;
  na tym etapie wystarcza manualna checklista.

### TASK-008: Przewodnik autorski (`docs/authoring-guide.md`) + bazowe pliki przykładowe `sample-app`
- **Traceability:** REQ-012, REQ-013
- **Podejście techniczne:** **Rozszerzenie (2026-08-10, na żądanie użytkownika):** to zadanie obejmuje
  teraz również przygotowanie bazowego zestawu przykładowych plików aplikacji referencyjnej
  `content/sample-app/` — konkretnie `content/sample-app/template/` (minimalny override
  demonstracyjny) i `content/sample-app/en/` z kompletnymi 3 dokumentami (`privacy-policy.html`,
  `terms-of-use.html`, `support.html`) zgodnymi ze specyfikacją z TASK-005 — tak, aby
  `docs/authoring-guide.md` mógł odwoływać się do realnych, istniejących ścieżek jako konkretnej
  ilustracji każdego kroku, zamiast do fragmentów kodu bez pokrycia w repozytorium. Poza tym dokument
  Markdown w `docs/` (obok `docs/readme.md`, poza `docs/dev/` — ponieważ to dokumentacja
  *produktu/procesu autorskiego*, nie dokumentacja deweloperska procesu workflow) opisujący krok po
  kroku, z odwołaniem do `content/sample-app/`: (1) jak dodać nową aplikację, (2) jak dodać/
  zaktualizować język istniejącej aplikacji, (3) jak dodać nowy typ dokumentu, (4) jak nadpisać styl/
  szablon aplikacji, (5) jak działa i kiedy uruchomić skrypt fallbacku językowego (TASK-006) przed
  publikacją. Zawiera minimalny szablon pliku wejściowego gotowy do skopiowania.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Dokumentacja wyłącznie w komentarzach w kodzie —
  odrzucone: nie spełnia REQ-012 (edytor treści niekoniecznie czyta kod źródłowy silnika). (b) Osobna,
  nowa aplikacja przykładowa "Example" niezależna od aplikacji referencyjnej QA — rozważone i
  odrzucone na żądanie użytkownika (2026-08-10, zob. Log decyzji #5 w `plan/index.md`): powielałoby
  strukturę już planowaną w TASK-009 bez dodatkowej korzyści. Wybrano osobny, samodzielny dokument
  Markdown + jedną wspólną aplikację `content/sample-app/`, rozbudowywaną dalej w TASK-009, jako
  najprostsze rozwiązanie bez duplikacji (Zasady globalne, pkt 7).
- **Zależności:** TASK-003, TASK-004, TASK-005, TASK-006
- **Właściciel/rola:** Technical Writer + Web Frontend Software Engineer (bazowe pliki `sample-app`)
- **Acceptance Criteria:** Dokument pokrywa wszystkie 5 punktów z Podejścia technicznego, z odwołaniem
  do konkretnych, istniejących ścieżek w `content/sample-app/`; osoba nieznająca implementacji jest w
  stanie wykonać każdy z nich, postępując wyłącznie wg instrukcji (weryfikowalne w ramach DoD
  przyrostu). `content/sample-app/en/` istnieje i zawiera 3 poprawnie renderujące się dokumenty.
- **Definition of Done (zadanie):** Dokument opublikowany w `docs/authoring-guide.md`; bazowe pliki
  `content/sample-app/en/` i `content/sample-app/template/` zacommitowane i renderują się bez błędów;
  dokument zweryfikowany przez "dry-run" wykonany przez osobę spoza zespołu implementującego (lub
  przez Code Reviewer udającego takiego użytkownika, jeśli niedostępna inna osoba).
- **Strategia testowania:** Walk-through manualny dokumentu (nie jest to kod testowalny automatycznie) —
  checklista 5 punktów, każdy zaliczony/niezaliczony z notatką; E2E (Playwright, współdzielone z
  TASK-007) potwierdzające poprawne renderowanie bazowych 3 dokumentów `sample-app/en/`.
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** brak.

### TASK-009: Rozszerzenie aplikacji referencyjnej `sample-app` (walidacja end-to-end całego przyrostu)
- **Traceability:** REQ-001–REQ-017 (walidacja całościowa)
- **Podejście techniczne:** Rozszerzenie bazowych plików `content/sample-app/` utworzonych w TASK-008
  (`en/` + `template/`) o: 1 dokument dodatkowy nietypowego typu (z TASK-005), drugi język w pełni
  przetłumaczony (np. `de/`), trzeci język celowo niekompletny (np. `pl/` bez `support.html`) do
  zademonstrowania fallbacku (TASK-006), oraz uzupełnienie `template/` o pełny override stylu
  (TASK-004) — tak, aby ta sama, jedna aplikacja demonstrowała pełny zakres mechanizmu w jednym
  miejscu, bez tworzenia drugiej, równoległej aplikacji przykładowej.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Testowanie wyłącznie jednostkowe/mockowane bez
  rzeczywistej aplikacji referencyjnej — odrzucone: nie daje pewności, że wszystkie mechanizmy
  współpracują poprawnie w realnym, kompletnym scenariuszu (integracja pełnego stosu). (b) Tworzenie
  aplikacji referencyjnej od zera w tym zadaniu, niezależnie od TASK-008 — odrzucone na żądanie
  użytkownika (2026-08-10): bazowe pliki `en/`/`template/` powstają już w TASK-008 na potrzeby
  dokumentacji, to zadanie tylko je rozszerza, unikając duplikacji pracy. Wybrano rozbudowę istniejącej
  `content/sample-app/` jako "żywej dokumentacji" i celu testów E2E z TASK-007.
- **Zależności:** TASK-007, TASK-008
- **Właściciel/rola:** Web Frontend Software Engineer + Web Frontend QA Strategy Engineer
- **Acceptance Criteria:** Wszystkie punkty z sekcji "Definition of Done — poziom przyrostu" w
  `plan/index.md` są spełnione z użyciem rozszerzonego `content/sample-app/` jako dowodu.
- **Definition of Done (zadanie):** Rozszerzony `content/sample-app/` zacommitowany, wszystkie testy z
  TASK-007 przechodzą na jego dokumentach, fallback językowy zademonstrowany i zweryfikowany.
- **Strategia testowania:** Pełny zestaw z TASK-007 uruchomiony na rozszerzonym `content/sample-app/`
  jako ostateczna brama jakości (test gate) całego przyrostu.
- **Uwagi z researchu Apple:** nie dotyczy.
- **Ryzyka / otwarte decyzje:** brak.
