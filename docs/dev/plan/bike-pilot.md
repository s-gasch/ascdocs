# Plan pracy — grupa: bike-pilot

> Część `docs/dev/plan/index.md` — patrz tam: Przegląd, Macierz traceability, DoD przyrostu, Strategia
> testowania (przegląd), Diagram, Log decyzji.

### TASK-010: Scaffolding nowej struktury plików `content/bike-pilot/` (dodana obok istniejącej)
- **Traceability:** REQ-018
- **Podejście techniczne:** Utworzyć na dysku, bez dotykania istniejących `content/bike-pilot/<lang>/
  *.html`: `content/bike-pilot/{privacy-policy,terms-of-use,support,index}.html` (szkielety HTML),
  `content/bike-pilot/css/{formal.css,support.css}` (puste/szkieletowe), `content/bike-pilot/js/
  {formal.js,support.js}` (puste moduły ES), `content/bike-pilot/formal/{terms-of-use,privacy-policy,
  support}/` (katalogi na 19 plików `<lang>.json` każdy), `content/bike-pilot/img/`,
  `content/bike-pilot/media/`, `content/bike-pilot/content/` (na `<lang>.json` marketingowe).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Umieścić nową strukturę we wspólnym
  `content/common/` i parametryzować per aplikację — odrzucone: użytkownik jawnie ograniczył zakres
  przyrostu wyłącznie do `content/bike-pilot/` (pilotaż), bez zmian w `content/common/`. (b) Zastąpić
  stare pliki `<lang>/*.html` nowymi od razu — odrzucone: jawna decyzja użytkownika o koegzystencji
  ("dodaj obok"), zero ryzyka regresji istniejących, używanych URL.
- **Zależności:** brak
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Struktura z REQ-018 istnieje w całości; `git diff` potwierdza zero zmian w
  plikach `content/bike-pilot/<lang>/*.html` (19 katalogów językowych, 3 pliki każdy).
- **Definition of Done (zadanie):** Struktura scaffoldowana i zacommitowana; test gate: Code Reviewer
  potwierdza brak modyfikacji istniejących plików (diff pusty na starych ścieżkach).
- **Strategia testowania:** Weryfikacja manualna/checklist zgodności struktury z REQ-018 + `git diff
  --stat` jako dowód nienaruszenia istniejących plików.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-011: Silnik JSON→HTML dla dokumentów formalnych (`js/formal.js`)
- **Traceability:** REQ-018, REQ-019, REQ-020
- **Podejście techniczne:** Moduł ES lokalny dla bike-pilot (`content/bike-pilot/js/formal.js`,
  ładowany przez `<script type="module">` w `privacy-policy.html`/`terms-of-use.html`/
  `support.html`), niezależny od silnika `content/common/js/render.js` (zgodnie z ograniczeniem
  zakresu do `content/bike-pilot/`). Kontrakt: po `DOMContentLoaded` moduł (1) ustala aktywny język
  (TASK-012), (2) pobiera `fetch()` odpowiedni plik `formal/<typ-dokumentu>/<lang>.json` (typ
  dokumentu ustalany z `data-doc-type` na `<body>` lub nazwy pliku), (3) wstrzykuje treść do
  kontenera `<main data-doc-content>`, (4) obsługuje zmianę języka (TASK-013) przez ponowne
  `fetch()` bez przeładowania strony.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Rozszerzyć wspólny `content/common/js/
  render.js` o obsługę źródła JSON — odrzucone: poza zakresem przyrostu (zakres ograniczony do
  bike-pilot, decyzja użytkownika). (b) Renderowanie po stronie serwera/pre-build (statyczny HTML per
  język generowany z JSON) — odrzucone: naruszałoby REQ-001 (wyłącznie statyczna architektura, brak
  kroku build) i wymagałoby zmiany procesu publikacji analogicznie do TASK-006 z grupy
  `appstore-docs`, czego przyrost nie obejmuje. Wybrano `fetch()` + wstrzyknięcie DOM w przeglądarce
  jako najprostsze rozwiązanie zgodne z istniejącą architekturą klient-side (Zasady globalne, pkt 7).
- **Zależności:** TASK-010
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Otwarcie `privacy-policy.html`/`terms-of-use.html`/`support.html` z co
  najmniej jednym gotowym plikiem `<lang>.json` renderuje treść bez błędów konsoli.
- **Definition of Done (zadanie):** Moduł zaimplementowany, zacommitowany, test gate: test
  jednostkowy logiki wstrzykiwania treści (mock `fetch`) zielony.
- **Strategia testowania:** Jednostkowe (Vitest + `happy-dom` lub odpowiednik) dla logiki parsowania/
  wstrzykiwania DOM w izolacji od sieci (mock `fetch`); e2e w TASK-019.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** `fetch()` na `file://` (otwarcie pliku lokalnie bez serwera HTTP) może
  być blokowany przez CORS w niektórych przeglądarkach — do zweryfikowania w TASK-019 na tym samym
  serwerze deweloperskim (`scripts/dev-server.js`) już używanym dla `sample-app`.

### TASK-012: Wykrywanie języka + fallback do `en` (moduł wspólny `js/language.js`)
- **Traceability:** REQ-019
- **Podejście techniczne:** Wspólny moduł ES `content/bike-pilot/js/language.js`, importowany przez
  `formal.js` i skrypt marketingowy (TASK-017), eksportujący funkcję ustalającą aktywny język: (1)
  cookie zapisany wcześniej (TASK-014) ma pierwszeństwo, (2) w jego braku — dopasowanie
  `navigator.languages`/`navigator.language` do listy 19 wspieranych kodów (dokładne dopasowanie
  kodu, potem dopasowanie prefiksu przed `-`, np. `pt` → `pt-PT`), (3) fallback do `en`.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Użyć wyłącznie `navigator.language` (pierwszy
  wpis) — odrzucone: `navigator.languages` daje pełniejszą listę preferencji użytkownika, lepiej
  dopasowuje w przypadku braku dokładnego trafienia pierwszego języka. (b) Biblioteka i18n
  zewnętrzna (np. `i18next`) — odrzucone: narusza domyślną zasadę Domeny B (framework tylko przy
  realnej potrzebie) dla zadania o niskiej złożoności.
- **Zależności:** TASK-010
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-019 (dokładnie i z fallbackiem).
- **Definition of Done (zadanie):** Moduł zaimplementowany, zacommitowany; test gate: testy
  jednostkowe pokrywają dopasowanie dokładne, dopasowanie po prefiksie i fallback do `en`.
- **Strategia testowania:** Jednostkowe (Vitest) z mockiem `navigator.language`/`navigator.languages`
  dla reprezentatywnego zestawu przypadków (dokładne trafienie, trafienie po prefiksie, brak
  trafienia).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Web Platform Documentation Researcher potwierdził (REQ-019):
  `navigator.language`/`navigator.languages` wspierane we wszystkich przeglądarkach z macierzy
  REQ-011 — brak ryzyka kompatybilności (źródło: MDN, `Navigator.language`).

### TASK-013: Przełącznik języka (UI) na wszystkich 4 stronach
- **Traceability:** REQ-020
- **Podejście techniczne:** Wspólny znacznik `<select>` (lub lista `<button>` dla dostępności —
  decyzja architekta w trakcie implementacji, poparta REQ-014 z grupy `appstore-docs` dot.
  dostępności) w `formal.css`/`formal.js` dla stron formalnych i w skrypcie marketingowym dla
  `index.html`, wypełniany 19 wspieranymi językami; zmiana wywołuje ponowne wywołanie logiki z
  TASK-011 (dokumenty formalne) lub odpowiednika dla `index.html` (TASK-017) z nowym językiem, bez
  pełnego przeładowania strony.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Przeładowanie strony z parametrem `?lang=`
  — odrzucone: mniej płynne UX, dodatkowe żądanie sieciowe całego dokumentu HTML zamiast tylko JSON.
  (b) Bez UI, tylko automatyczna detekcja — odrzucone: wprost narusza REQ-020.
- **Zależności:** TASK-011, TASK-012
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-020.
- **Definition of Done (zadanie):** Przełącznik zaimplementowany na 4 stronach, dostępny z klawiatury
  (nawigacja Tab, aktywacja Enter/Space) i czytników ekranu (semantyka `<select>`/`role` właściwa);
  test gate: axe-core na wszystkich 4 stronach — 0 naruszeń A/AA dla tego elementu.
- **Strategia testowania:** E2E (Playwright) — wybór każdego z 19 języków na każdej z 4 stron
  aktualizuje treść; axe-core dla dostępności przełącznika.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-014: Trwałe zapamiętanie wyboru języka (cookie)
- **Traceability:** REQ-021
- **Podejście techniczne:** Funkcja `setLanguageCookie(lang)`/`getLanguageCookie()` w
  `js/language.js` operująca na `document.cookie` (nazwa np. `bp_lang`, `Max-Age` długie — np. 1 rok,
  `Path=/`, `SameSite=Lax`); wywoływana z TASK-013 po zmianie języka **tylko jeśli** zgoda z TASK-015
  została już udzielona (w przeciwnym razie język zmienia się tylko w bieżącej sesji DOM, bez zapisu).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) `localStorage` zamiast cookie — odrzucone:
  jawna decyzja użytkownika (2026-09-07), by mechanizmem był cookie, co świadomie aktywuje wymóg
  klauzuli informacyjnej (REQ-022/TASK-015). (b) Cookie sesyjne (bez `Max-Age`) — odrzucone: nie
  spełnia wymogu "trwale zapamiętany" z REQ-021 (zniknęłoby po zamknięciu przeglądarki).
- **Zależności:** TASK-012, TASK-013, TASK-015
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-021.
- **Definition of Done (zadanie):** Zaimplementowane i zacommitowane; test gate: test jednostkowy
  zapisu/odczytu cookie (mock `document.cookie`) + test e2e trwałości między wizytami (Playwright,
  kontekst z zachowanymi cookies).
- **Strategia testowania:** Jednostkowe (Vitest, mock `document.cookie`) + e2e (Playwright, dwie
  kolejne nawigacje w tym samym kontekście przeglądarki).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Web Platform Documentation Researcher potwierdził (REQ-021): zapis
  przez `document.cookie` z atrybutami `Max-Age`/`SameSite`/`Path` jest naturalnym, natywnym
  mechanizmem bez potrzeby biblioteki (źródło: MDN, `Document.cookie`).

### TASK-015: Baner zgody na cookies (consent), wspólny dla 4 stron
- **Traceability:** REQ-022
- **Podejście techniczne:** Współdzielony fragment UI (znacznik + style w `formal.css` dla stron
  formalnych, odpowiednik w stylu marketingowym dla `index.html`) i logika w `js/language.js`:
  `hasConsent()`/`grantConsent()` z osobnym cookie zgody (np. `bp_consent=1`, bez daty wygaśnięcia
  krótkiej — długie `Max-Age`), niezależnym od cookie językowego (TASK-014). Baner renderowany, jeśli
  `hasConsent()` zwraca `false`; zatwierdzenie ukrywa baner i ustawia cookie zgody na wszystkich 4
  stronach (cookie ma zasięg `Path=/`, więc obejmuje cały `content/bike-pilot/`).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Osobna zgoda per strona (4 niezależne cookies)
  — odrzucone: użytkownik zdecydował, że zgoda ma obejmować wszystkie strony bike-pilot jednym
  zatwierdzeniem. (b) Zgoda przechowywana w `localStorage` zamiast cookie — odrzucone dla spójności z
  TASK-014 (jeden mechanizm trwałości, cookie, dla całej funkcjonalności i18n bike-pilot).
- **Zależności:** TASK-010
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-022.
- **Definition of Done (zadanie):** Baner zaimplementowany na 4 stronach; test gate: axe-core 0
  naruszeń A/AA dla banera (kontrast, focus trap opcjonalny, semantyka `role="dialog"`/`alert` wg
  decyzji architekta).
- **Strategia testowania:** E2E (Playwright) — pierwsza wizyta pokazuje baner na każdej z 4 stron;
  zatwierdzenie na jednej stronie i nawigacja do pozostałych 3 w tym samym kontekście potwierdza brak
  banera; axe-core dla dostępności.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-016: Styl `formal.css`/`support.css` — minimalistyczny, spójny, z miejscem na logo
- **Traceability:** REQ-023
- **Podejście techniczne:** `css/formal.css` definiuje typografię, kolorystykę, odstępy i miejsce na
  mały, dyskretny znacznik logo (np. w nagłówku, ograniczony rozmiar maks. np. 32–40px wysokości);
  `css/support.css` dokłada wyłącznie style specyficzne dla `support.html` (np. sekcja FAQ/kontakt),
  bez powielania reguł z `formal.css`.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Jeden wspólny plik CSS bez podziału
  formal/support — odrzucone: `ideas.md` wprost wskazuje podział na `formal.css` + `support.css` jako
  rozszerzenie; podział ułatwia utrzymanie i jest zgodny ze strukturą z REQ-018. Wybrano podział 1:1
  ze strukturą wskazaną w `ideas.md` (Zasady globalne, pkt 7 — najprostsze, przewidywalne
  rozwiązanie zgodne ze źródłem wymagań).
- **Zależności:** TASK-010
- **Właściciel/rola:** Web Frontend Software Architect (decyzja stylistyczna) + Web Frontend Software
  Engineer (implementacja)
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-023.
- **Definition of Done (zadanie):** Style zaimplementowane, zacommitowane; test gate: przegląd wizualny
  (Code Reviewer) potwierdzający spójność i obecność miejsca na logo bez dominacji nad treścią.
- **Strategia testowania:** Manualna/checklist wizualna (brak logiki do testowania automatycznego);
  kontrast kolorów weryfikowany przez axe-core w TASK-019 (WCAG AA, spójne z REQ-014 z grupy
  `appstore-docs`).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-017: Strona marketingowa `index.html` + treść `content/<lang>.json`
- **Traceability:** REQ-024, REQ-025
- **Podejście techniczne:** Nowy, niezależny zestaw plików w `content/bike-pilot/` — `index.html`
  własny layout, własny CSS/JS (nie `formal.css`/`formal.js`) budowany od zera wg `ideas.md`,
  reużywający wyłącznie wspólne moduły i18n (`js/language.js` z TASK-012 dla wykrywania/przełączania/
  zapamiętania języka i baner zgody z TASK-015). Treść ładowana z `content/bike-pilot/content/
  <lang>.json` (19 plików). Istniejący prototyp `en/merketing/` (nazwa, zasoby, skrypt) pozostaje bez
  zmian i nieużywany przez nową stronę — zgodnie z decyzją użytkownika (2026-09-07) o zignorowaniu go.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Rozbudować istniejący prototyp `en/merketing/`
  (poprawić literówkę w nazwie, dodać i18n) — odrzucone: jawna decyzja użytkownika, by zignorować
  prototyp i zbudować stronę od zera zgodnie ze strukturą z `ideas.md` (`index.html` w korzeniu
  `content/bike-pilot/`, nie w podkatalogu językowym). (b) Współdzielić `css`/`js` ze stronami
  formalnymi — odrzucone: REQ-024 wprost wymaga odrębnego projektu strony marketingowej.
- **Zależności:** TASK-010, TASK-012, TASK-015
- **Właściciel/rola:** Web Frontend Software Architect (projekt/layout) + Web Frontend Software
  Engineer (implementacja)
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-024 i REQ-025.
- **Definition of Done (zadanie):** Strona zaimplementowana i zacommitowana; test gate: axe-core 0
  naruszeń A/AA, brak odwołań do plików z `en/merketing/`.
- **Strategia testowania:** E2E (Playwright) — renderowanie treści marketingowej w kilku językach z
  wykrywaniem/przełącznikiem/zapamiętaniem (reużycie scenariuszy z TASK-012/013/014 dla `index.html`);
  axe-core dla dostępności; przegląd wizualny dla atrakcyjności/konwersji (subiektywny, checklist
  Web Frontend Software Architect).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-018: Treść JSON (formal + marketingowa) dla wszystkich 19 języków
- **Traceability:** REQ-018, REQ-019, REQ-025
- **Podejście techniczne:** Wyekstrahować istniejącą treść tekstową z `content/bike-pilot/<lang>/
  {privacy-policy,terms-of-use,support}.html` (19 języków × 3 dokumenty) do odpowiadających plików
  `content/bike-pilot/formal/<typ>/<lang>.json`, bez zmiany plików źródłowych (tylko odczyt);
  przygotować równolegle 19 plików `content/bike-pilot/content/<lang>.json` z treścią marketingową
  (nowa treść, bo strona marketingowa jest budowana od zera — TASK-017).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Ręczne tłumaczenie/pisanie treści JSON od
  zera dla dokumentów formalnych — odrzucone: ryzyko niespójności prawnej/treściowej z już
  zatwierdzoną treścią istniejących 19 wersji językowych; ekstrakcja z istniejących plików gwarantuje
  zgodność treści między starą i nową ścieżką dostępu do tego samego dokumentu. (b) Zautomatyzowany
  skrypt parsujący HTML → JSON — rozważone jako preferowane dla 57 plików (19 języków × 3 dokumenty),
  by uniknąć błędów ręcznego kopiowania; decyzja implementacyjna (skrypt jednorazowy, deweloperski,
  nie runtime) należy do Web Frontend Software Engineer w trakcie realizacji zadania.
- **Zależności:** TASK-010, TASK-011, TASK-017
- **Właściciel/rola:** Web Frontend Software Engineer + Technical Writer (przegląd spójności treści)
- **Acceptance Criteria:** Dla każdego z 19 języków i 3 typów dokumentów formalnych istnieje plik
  `formal/<typ>/<lang>.json`, którego treść po wyrenderowaniu przez TASK-011 jest tekstowo zgodna z
  istniejącym `content/bike-pilot/<lang>/<typ>.html`; dla każdego z 19 języków istnieje
  `content/<lang>.json` z kompletną treścią marketingową.
- **Definition of Done (zadanie):** Wszystkie 57 + 19 = 76 plików JSON istnieją i przechodzą walidację
  formatu (parsowalny JSON) oraz przegląd zgodności treści (Technical Writer); test gate: e2e w
  TASK-019 renderuje każdy język bez błędów braku pliku (404).
- **Strategia testowania:** Walidacja jednostkowa formatu JSON (parsowalność, wymagane pola) dla
  wszystkich 76 plików + porównanie tekstowe (checklist/manualne dla języków niełacińskich, gdzie
  automatyczne porównanie znak-w-znak jest wiarygodne) z istniejącą treścią źródłową.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Języki RTL (`ar`) i CJK (`ja`, `ko`, `zh-Hans`) wymagają weryfikacji
  poprawnego renderowania (kierunek tekstu, czcionki) w TASK-019 — nie tylko poprawności samej treści
  JSON.

### TASK-019: Walidacja end-to-end nowej struktury bike-pilot + brak regresji na starych URL
- **Traceability:** REQ-018, REQ-019, REQ-020, REQ-021, REQ-022, REQ-023, REQ-024, REQ-025
- **Podejście techniczne:** Rozszerzyć istniejący zestaw Playwright (analogicznie do TASK-007 z
  grupy `appstore-docs`) o scenariusze dla 4 nowych stron bike-pilot: renderowanie per język (19
  języków), przełącznik języka, trwałość cookie językowego, baner zgody (w tym blokada zapisu cookie
  przed zgodą), axe-core (0 naruszeń A/AA) na Chromium/WebKit/Firefox z macierzy REQ-011. Dodatkowo:
  test regresji potwierdzający, że wszystkie 19×3 istniejące URL `content/bike-pilot/<lang>/*.html`
  nadal renderują się identycznie jak przed tym przyrostem (brak modyfikacji, TASK-010).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Osobny, nowy runner testowy tylko dla
  bike-pilot — odrzucone: reużycie istniejącej infrastruktury Playwright/axe-core (Vitest już
  skonfigurowany w projekcie) jest szybsze i spójne (Zasady globalne, pkt 7).
- **Zależności:** TASK-011, TASK-012, TASK-013, TASK-014, TASK-015, TASK-016, TASK-017, TASK-018
- **Właściciel/rola:** Web Frontend QA Strategy Engineer + Web Frontend Test Engineer
- **Acceptance Criteria:** Wszystkie scenariusze e2e (nowa struktura + regresja starej) zielone na 3
  automatyzowalnych silnikach; 0 naruszeń axe-core A/AA na 4 nowych stronach.
- **Definition of Done (zadanie):** Zestaw testów zacommitowany i zielony w CI/lokalnie; test gate:
  pełny przebieg `npx playwright test` (istniejące + nowe scenariusze) bez błędów.
- **Strategia testowania:** E2E (Playwright, 3 silniki) + axe-core (dostępność) — analogicznie do
  strategii z `plan/appstore-docs.md`; manualna weryfikacja mobile Safari/Chrome Android pozostaje
  poza zakresem tego środowiska (tak jak odnotowano dla `appstore-docs`, LOG-003/LOG-005).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Jak w TASK-002 grupy `appstore-docs` — mobile Safari (iOS)/Chrome
  (Android) na rzeczywistych urządzeniach wymaga manualnej weryfikacji przed produkcyjną publikacją.

---

## Dodatek (2026-09-07): TASK-020–TASK-022 — treść formalna bez HTML w JSON (REQ-026)

Poniższe zadania **poprawiają** rezultat TASK-011 (silnik renderujący) i TASK-018 (ekstrakcja treści),
oba zamknięte jako `Done` przed tym dodatkiem: pierwsza implementacja zapisała w
`formal/<typ>/<lang>.json` pole `html` z surowym znacznikami HTML skopiowanym 1:1 ze źródła, co nie
spełnia REQ-026 (dopisanego po tym fakcie na żądanie użytkownika). TASK-011/TASK-018 pozostają w
rejestrze bez zmian treści (Zasada przyrostowego rejestru) — poniższe zadania je zastępują w
zakresie *formatu danych JSON i sposobu renderowania*, nie w zakresie pozostałych ustaleń (ścieżki
plików, zależność od TASK-010, itd.), które nadal obowiązują.

### TASK-020: Model danych treści formalnej (blocks/runs) — schemat + walidacja
- **Traceability:** REQ-026
- **Podejście techniczne:** Zdefiniować i udokumentować (komentarz nagłówkowy w kodzie, wzorem
  `content/common/js/render.js`) schemat JSON opisany w REQ-026: dokument = `{ title, blocks[] }`,
  gdzie `blocks[].type` ∈ `heading | paragraph | list | table`, a tekst sformatowany wewnątrz akapitu/
  komórki/pozycji listy to tablica `runs[]` segmentów `{ text, bold?, italic?, code?, href?, break? }`.
  Dodać lekką funkcję walidującą (`content/bike-pilot/js/formal.js` lub moduł pomocniczy) odrzucającą
  nieznane pola `type`/klucze `runs` (fail-fast, zgodnie z kontraktem "jawny błąd zamiast cichego
  fallbacku" już przyjętym w `render.js`, TASK-002).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Zagnieżdżona struktura `sections[].blocks[]`
  (nagłówek + jego zawartość jako dziecko) — odrzucone: źródłowe dokumenty nie zagnieżdżają zawartości
  pod nagłówkiem w DOM (płaska sekwencja `<h2>`/`<p>`/... jako rodzeństwo), więc płaska tablica
  `blocks[]` 1:1 z kolejnością elementów źródłowych jest prostszym, bezstratnym odwzorowaniem i
  eliminuje potrzebę decyzji "co należy do którego nagłówka" przy ekstrakcji. (b) Markdown zamiast
  modelu blocks/runs — odrzucone: nadal wymagałby parsera przy renderowaniu (kolejna forma znaczników
  do parsowania w przeglądarce) i nie mapuje się czysto na istniejące tabele/listy zagnieżdżone z
  formatowaniem inline w komórkach.
- **Zależności:** brak (poprawka niezależna, poprzedza TASK-021/TASK-022)
- **Właściciel/rola:** Web Frontend Software Architect (schemat) + Web Frontend Software Engineer
  (implementacja walidacji)
- **Acceptance Criteria:** Schemat udokumentowany pokrywa bez wyjątku wszystkie znaczniki
  zaobserwowane w 57 plikach źródłowych (`h2`, `h3`, `p`, `ul`, `ol`, `table`, `strong`, `em`, `code`,
  `a`, `br` — zob. REQ-026); walidator odrzuca dokument z nieznanym `type` lub brakującym wymaganym
  polem, z jawnym komunikatem błędu.
- **Definition of Done (zadanie):** Schemat i walidator zaimplementowane, zacommitowane; test gate:
  test jednostkowy walidatora (przypadki poprawne + każdy typ błędu) zielony.
- **Strategia testowania:** Jednostkowe (Vitest) dla walidatora, z fixture'ami reprezentującymi każdy
  typ bloku/run oraz co najmniej po jednym przypadku nieprawidłowym per reguła.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-021: Przebudowa `js/formal.js` — renderowanie DOM z modelu blocks/runs (bez `innerHTML` treści)
- **Traceability:** REQ-026, REQ-011
- **Podejście techniczne:** Zastąpić w `content/bike-pilot/js/formal.js` wstrzykiwanie treści przez
  `innerHTML` (dotychczasowe pole `html` z TASK-011) budową DOM programowo z `document.createElement`/
  `textContent` na podstawie `blocks[]`/`runs[]` (TASK-020): `heading` → `<h2>`/`<h3>`, `paragraph` →
  `<p>` z rodzeństwem tekst/`<strong>`/`<em>`/`<code>`/`<a href>`/`<br>` wg `runs`, `list` → `<ul>`/
  `<ol>` z `<li>` per pozycja (każda pozycja to własna sekwencja `runs`), `table` → `<table>`/
  `<thead>`/`<tbody>` z `<th>`/`<td>` renderowanymi z `runs` per komórka. Zachować istniejący kontrakt
  wejścia/wyjścia modułu (fetch `formal/<typ>/<lang>.json`, wstrzyknięcie do `<main data-doc-content>`,
  obsługa zmiany języka) — zmienia się wyłącznie sposób budowy fragmentu treści.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Zbudować fragment HTML jako string przez
  konkatenację i nadal użyć `innerHTML` — odrzucone: wprost sprzeczne z celem REQ-026 (unikanie
  jakiegokolwiek pośredniego HTML, także budowanego runtime z danych niezaufanych/tłumaczonych) i
  odtwarzałoby to samo ryzyko wstrzyknięcia, tylko przesunięte z pliku JSON do kodu JS. (b) Użycie
  `document.createRange().createContextualFragment()` na wygenerowanym markupie — odrzucone z tego
  samego powodu (nadal parsowanie HTML). Wybrano wyłącznie DOM API (`createElement`/`textContent`),
  zgodnie z zasadą braku zależności do dodatkowych bibliotek (REQ-017 z grupy `appstore-docs`,
  stosowana analogicznie tu) i bez żadnego parsowania HTML w runtime.
- **Zależności:** TASK-020
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Dla każdego z 57 plików `formal/<typ>/<lang>.json` po regeneracji (TASK-022)
  wyrenderowany DOM zawiera identyczny, widoczny tekst i tę samą strukturę semantyczną (liczba/poziom
  nagłówków, listy uporządkowane/nieuporządkowane, tabele, linki z poprawnym `href`) jak przed zmianą.
- **Definition of Done (zadanie):** Moduł przebudowany, zacommitowany; test gate: testy jednostkowe
  renderowania każdego typu bloku/run (mock `fetch` zwracający przykładowy dokument blocks/runs)
  zielone; brak w kodzie modułu jakiegokolwiek przypisania do `innerHTML` dla treści dokumentu
  (dopuszczalne wyłącznie dla elementów structuralnych szablonu spoza treści per język, jeśli takie
  istnieją).
- **Strategia testowania:** Jednostkowe (Vitest + `happy-dom`) — per typ bloku/run oraz e2e
  (rozszerzenie TASK-019) potwierdzające brak regresji wizualnej/tekstowej na próbce języków.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Tabele/listy z zagnieżdżonym formatowaniem inline (np. `<strong>`
  wewnątrz komórki) wymagają, by `runs` renderujący był reużywalną funkcją pomocniczą wywoływaną z
  każdego miejsca (akapit, pozycja listy, komórka) — do potwierdzenia w code review, że nie ma
  duplikacji logiki.

### TASK-022: Regeneracja 57 plików `formal/<typ>/<lang>.json` do modelu blocks/runs
- **Traceability:** REQ-026, REQ-018
- **Podejście techniczne:** Rozszerzyć/przepisać `scripts/extract-bikepilot-content.mjs` (z TASK-018)
  o parser HTML→blocks/runs: dla każdego z 19×3 plików źródłowych `content/bike-pilot/<lang>/
  {privacy-policy,terms-of-use,support}.html` odczytać `<template id="doc-content">` (bez modyfikacji
  pliku źródłowego — tylko odczyt, jak w TASK-018) i zmapować jego bezpośrednie elementy potomne na
  `blocks[]` wg schematu z TASK-020, nadpisując istniejące pliki `formal/<typ>/<lang>.json` (usuwając
  pole `html`). Zachować `title` bez zmian.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Ręczna, manualna konwersja 57 plików —
  odrzucone: wysokie ryzyko błędu/niespójności przy takiej objętości, ekstrakcja skryptowa (już
  wybrana w TASK-018 z tego samego powodu) pozostaje najlepszym wyborem, teraz rozszerzona o mapowanie
  strukturalne zamiast kopiowania `innerHTML`. (b) Napisać konwerter online/w przeglądarce zamiast
  skryptu Node — odrzucone: niepotrzebne, ten sam plik wejściowy/wyjściowy jest dostępny lokalnie na
  dysku, skrypt Node (już istniejący z TASK-018) jest najprostszym środowiskiem do jednorazowego
  przetworzenia plików.
- **Zależności:** TASK-020, TASK-021
- **Właściciel/rola:** Web Frontend Software Engineer + Technical Writer (przegląd zgodności treści
  po regeneracji, analogicznie do przeglądu z TASK-018)
- **Acceptance Criteria:** Wszystkie 57 plików `formal/<typ>/<lang>.json` są zgodne ze schematem
  TASK-020 (przechodzą walidator), nie zawierają pola `html` ani żadnego ciągu ze znacznikiem HTML;
  Acceptance Criteria REQ-026 (test regresji tekstowej/strukturalnej wobec stanu sprzed zmiany) są
  spełnione dla wszystkich 57 plików.
- **Definition of Done (zadanie):** Skrypt rozszerzony, 57 plików zregenerowanych i zacommitowanych;
  test gate: `node:test` porównujący wyrenderowaną (TASK-021) treść każdego zregenerowanego pliku z
  zapisanym wcześniej "złotym" tekstem/strukturą referencyjną (ekstrahowaną raz, przed zmianą, z
  poprzedniej wersji plików z polem `html`) — 0 rozbieżności.
- **Strategia testowania:** Walidacja formatu (`node:test`, 57/57 plików zgodnych ze schematem) +
  test regresji tekstowej per plik + e2e (rozszerzenie TASK-019) na próbce reprezentatywnej języków
  (w tym RTL `ar` i CJK `ja`/`ko`/`zh-Hans`, zgodnie z ryzykiem odnotowanym w TASK-018).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Elementy inline nietypowe dla prostego mapowania 1:1 (np. `<strong>`
  obejmujący tylko fragment zdania na granicy dwóch węzłów tekstowych) wymagają starannego
  zachowania dokładnych granic segmentów `runs` przy parsowaniu — do zweryfikowania w code review
  próbką kilku najbardziej złożonych akapitów (np. blok kontaktowy z `<br>`, tabela uprawnień w
  `privacy-policy`).

---

| ID | Tytuł | Status | Archiwum |
|----|-------|--------|----------|
| TASK-023 | Ciemny motyw formal.css/support.css z akcentami pomarańczowymi | Done (zweryfikowane) | [`plan/archive/bike-pilot.md`](archive/bike-pilot.md) |
| TASK-024 | Ujednolicenie nazewnictwa dokumentów formalnych | Done (zweryfikowane) | [`plan/archive/bike-pilot.md`](archive/bike-pilot.md) |
| TASK-025 | Wersjonowanie dokumentów formalnych | Done (zweryfikowane) | [`plan/archive/bike-pilot.md`](archive/bike-pilot.md) |
| TASK-026 | Usunięcie widocznej etykiety "Language" z nagłówka | Done (zweryfikowane) | [`plan/archive/bike-pilot.md`](archive/bike-pilot.md) |
| TASK-027 | Powiększenie logo o 150% (1.5×) | Done (zweryfikowane) | [`plan/archive/bike-pilot.md`](archive/bike-pilot.md) |
| TASK-028 | Walidacja end-to-end recenzji (REQ-027-REQ-031) | Done (zweryfikowane) | [`plan/archive/bike-pilot.md`](archive/bike-pilot.md) |
