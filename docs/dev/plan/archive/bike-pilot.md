# Archiwum planu — grupa `bike-pilot` (TASK-023–TASK-028)

> Wpisy przeniesione z `plan/bike-pilot.md` po zamknięciu (Scenariusz 4, krok 5 — weryfikacja
> wsteczna potwierdziła zgodność z Acceptance Criteria i REQ-XXX). Treść skopiowana dosłownie, bez
> zmian (Zasady globalne, pkt 11).


Kolejny dodatek (TASK-023–TASK-028) implementuje REQ-027–REQ-031, powstałe na podstawie
`docs/dev/reports/2026-09-07-bike-pilot-review.md` (Scenariusz 2 → Scenariusz 3).

### TASK-023: Ciemny motyw `formal.css`/`support.css` z akcentami pomarańczowymi
- **Traceability:** REQ-027
- **Podejście techniczne:** Przebudować tokeny kolorów w `css/formal.css` (`:root`): `--bp-bg` →
  czarny/prawie czarny (np. `#000000`/`#0a0a0a`), `--bp-surface`/`--bp-surface-strong` → ciemne
  odcienie neutralne zapewniające subtelną hierarchię kontenerów na czarnym tle, `--bp-text` →
  biały/jasny (np. `#f5f7fa`), `--bp-muted` → jasnoszary o kontraście ≥ 4.5:1, `--bp-accent`/
  `--bp-accent-soft` → pomarańcz w rodzinie dominującego koloru `img/logo.png` (odcień HSL ~25–35°,
  zmierzony punkt odniesienia ok. `#f07000`), `--bp-border`/`--bp-shadow` dopasowane do ciemnego tła
  (jaśniejsze/bardziej widoczne obramowania niż na jasnym tle). Zaktualizować `body` (usunąć jasny
  gradient `radial-gradient`/`linear-gradient`, zastąpić jednolitym lub bardzo subtelnym ciemnym
  tłem) i `support.css` (dziedziczy tokeny, bez własnej duplikacji kolorów).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Przełącznik jasny/ciemny motyw (zachować
  obecny jasny jako domyślny, dodać przełącznik) — odrzucone: raport użytkownika żąda ciemnego
  motywu jako jedynego/domyślnego dla dokumentów formalnych, bez wzmianki o przełączniku; upraszcza
  zakres. (b) Zmienić tylko `--bp-bg`/`--bp-text`, zachowując niebieski akcent — odrzucone: raport
  wprost żąda akcentów pomarańczowych spójnych z logo (pkt 3).
- **Zależności:** TASK-016
- **Właściciel/rola:** Web Frontend Software Architect (dobór dokładnych wartości kolorów/kontrastu)
  + Web Frontend Software Engineer (implementacja)
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-027.
- **Definition of Done (zadanie):** Tokeny kolorów zaktualizowane i zacommitowane na 3 stronach
  formalnych; test gate: axe-core 0 naruszeń A/AA (kontrast) na wszystkich 3 stronach × 19 języków
  (rozszerzenie zestawu z TASK-019).
- **Strategia testowania:** axe-core (kontrast, część walidacji e2e TASK-019/TASK-028) + przegląd
  wizualny (Code Reviewer/Web Frontend Software Architect) potwierdzający spójność z logo i brak
  regresji layoutu.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Dobór dokładnego odcienia pomarańczu i jego wariantów (hover/focus/
  visited dla linków) na czarnym tle wymaga iteracyjnej weryfikacji kontrastu — Web Frontend
  Software Architect dobiera finalne wartości HEX w ramach implementacji, w granicach kryterium
  akceptacji REQ-027 (odcień ~20–40°, kontrast ≥ 4.5:1).

### TASK-024: Ujednolicenie nazewnictwa dokumentów formalnych między JSON `title` i etykietami nawigacyjnymi
- **Traceability:** REQ-028
- **Podejście techniczne:** (1) Poprawić `content/bike-pilot/js/language.js`: `pl.navTerms` z
  "Warunki użytkowania" na "Warunki korzystania". (2) Napisać skrypt/test weryfikujący dla
  pozostałych 18 języków, że `navPrivacy`/`navTerms`/`navSupport` w `js/language.js` odpowiadają
  dokładnie polu `title` w `formal/{privacy-policy,terms-of-use,support}/<lang>.json` dla tego
  samego języka; dla każdej wykrytej rozbieżności — poprawić `js/language.js` (etykieta nawigacyjna
  ma być zgodna z `title` dokumentu, nie odwrotnie, bo `title` jest źródłem prawdy dla treści
  dokumentu).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Zmienić `title` w JSON, by dopasować do
  etykiety nawigacyjnej — odrzucone: `title` pochodzi z faktycznej treści historycznego dokumentu
  prawnego (ekstrakcja TASK-018/TASK-022), etykieta nawigacyjna jest wtórnym skrótem UI, więc to ona
  ma się dostosować. (b) Ręczne poprawki bez automatycznego testu regresji — odrzucone: 57 par do
  zweryfikowania, ręczna jednorazowa poprawka bez testu nie zapobiegnie przyszłej regresji (np. przy
  dodaniu nowego języka).
- **Zależności:** TASK-011, TASK-018
- **Właściciel/rola:** Web Frontend Software Engineer (poprawka + skrypt weryfikujący) + Technical
  Writer (przegląd poprawności nazw w pozostałych 18 językach, analogicznie do przeglądu z TASK-018)
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-028.
- **Definition of Done (zadanie):** `js/language.js` poprawiony (co najmniej `pl.navTerms`), test
  automatyczny (57 porównań) zacommitowany i zielony; test gate: 0 rozbieżności.
- **Strategia testowania:** `node:test` porównujące `title` (JSON) z odpowiadającą etykietą
  nawigacyjną (`js/language.js`) dla wszystkich 57 par język×typ dokumentu.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-025: Wersjonowanie dokumentów formalnych (rozszerzenie modelu danych + renderowanie)
- **Traceability:** REQ-029
- **Podejście techniczne:** Rozszerzyć schemat modelu danych z TASK-020 (`{ title, blocks[] }`) o
  pole `"version": "MAJOR.MINOR"` (string, np. `"1.0"`) na poziomie dokumentu. Ustawić `version:
  "1.0"` w każdym z 57 plików `formal/<typ>/<lang>.json`, identyczną wartość dla wszystkich 19
  języków tego samego typu dokumentu. Rozszerzyć `js/formal.js` (renderer z TASK-021), by
  wyświetlał wersję obok istniejącej daty ostatniej aktualizacji (np. w stopce dokumentu), z
  etykietą tłumaczoną per język w `js/language.js` (nowy klucz współdzielony, analogiczny do
  istniejących etykiet, np. `versionLabel: "Wersja"`/`"Version"`/...). Udokumentować w
  `docs/authoring-guide.md` politykę podnoszenia wersji (`MINOR` — zmiana redakcyjna/kosmetyczna;
  `MAJOR` — zmiana zakresu/znaczenia prawnego treści).
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Wersja per język (57 niezależnych numerów) —
  odrzucone: jawna decyzja użytkownika (2026-09-07) o jednej wersji wspólnej per typ dokumentu,
  ponieważ to ten sam dokument prawny tłumaczony na 19 języków, nie 19 niezależnych dokumentów.
  (b) Format daty jako "wersji" (np. `2026.09`) zamiast `MAJOR.MINOR` — odrzucone: jawna decyzja
  użytkownika o formacie semantycznym, niezależnym od daty aktualizacji (już istniejącej osobno).
- **Zależności:** TASK-020, TASK-021, TASK-022
- **Właściciel/rola:** Web Frontend Software Engineer (implementacja) + Technical Writer (polityka
  wersjonowania w `docs/authoring-guide.md`)
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-029.
- **Definition of Done (zadanie):** Schemat rozszerzony i udokumentowany (komentarz w `js/formal.js`,
  analogicznie do TASK-020), 57 plików zaktualizowanych, renderowanie wersji zweryfikowane e2e,
  polityka wersjonowania opisana w `docs/authoring-guide.md`; test gate: walidator schematu (TASK-020)
  rozszerzony o wymagane pole `version` odrzuca pliki bez niego.
- **Strategia testowania:** `node:test` (walidacja obecności/formatu `version` w 57 plikach + zgodność
  wartości między 19 językami tego samego typu) + e2e (Playwright, widoczność wersji na stronie w
  próbce języków).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-026: Usunięcie widocznej etykiety "Language" z nagłówka (4 strony), z zachowaniem dostępności
- **Traceability:** REQ-030
- **Podejście techniczne:** W `privacy-policy.html`, `terms-of-use.html`, `support.html`, `index.html`
  zastąpić widoczny `<span data-language-label>` techniką "visually hidden" (klasa CSS ukrywająca
  wizualnie element, zachowując go w drzewie dostępności — np. `.sr-only` w `formal.css`/
  `css/index.css`: `position:absolute; width:1px; height:1px; overflow:hidden; clip:rect(0,0,0,0);
  white-space:nowrap;`), zamiast całkowitego usunięcia elementu z DOM. `js/language.js`
  (`updateSharedLabels`) nadal ustawia tekst `languageLabel` w tym elemencie (dla czytników ekranu),
  ale element przestaje być widoczny wizualnie obok `<select data-language-select>`.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Całkowite usunięcie elementu `<span
  data-language-label>` z DOM/HTML — odrzucone: `<select>` bez żadnej programowej nazwy (accessible
  name) narusza WCAG 4.1.2, technika "visually hidden" zachowuje dostępność bez zajmowania miejsca
  wizualnie (Uwagi z researchu REQ-030). (b) Zastąpić etykietą `aria-label` na samym `<select>` i
  usunąć `<span>` — również poprawne technicznie, ale odrzucone na rzecz zachowania jednego,
  współdzielonego mechanizmu (`updateSharedLabels`) już aktualizującego treść `<span>` per język, bez
  duplikowania logiki tłumaczenia etykiety w dwóch miejscach.
- **Zależności:** TASK-013, TASK-017
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-030.
- **Definition of Done (zadanie):** Klasa "visually hidden" dodana i zastosowana na 4 stronach;
  test gate: axe-core 0 nowych naruszeń A/AA związanych z brakiem nazwy dostępnej pola `<select>`.
- **Strategia testowania:** axe-core (rozszerzenie TASK-019/TASK-028) + e2e (Playwright) sprawdzający
  computed `visibility`/rozmiar elementu `[data-language-label]` (niewidoczny wizualnie) oraz obecność
  jego tekstu w drzewie dostępności (accessible name `<select>`).
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.

### TASK-027: Powiększenie logo o 150% (1.5×) na 4 stronach bike-pilot
- **Traceability:** REQ-031
- **Podejście techniczne:** Zaktualizować atrybuty `width`/`height` znacznika `<img src="./img/
  logo.png">` w: `privacy-policy.html`, `terms-of-use.html`, `support.html` (`72×36` → `108×54`),
  `index.html` (2 wystąpienia: `76×38` → `114×57`, `68×34` → `102×51`). Zweryfikować rozdzielczość
  natywną `content/bike-pilot/img/logo.png` — jeśli niewystarczająca dla największego nowego rozmiaru
  (108px szerokości w gęstości `1x`, uwzględniając ekrany `2x`/`3x` → efektywnie do ~324px), rozważyć
  dostarczenie zasobu o wyższej rozdzielczości (poza zakresem zmiany, jeśli plik źródłowy już to
  pokrywa). Sprawdzić i w razie potrzeby dostosować reguły CSS w `formal.css`/`css/index.css`
  ograniczające rozmiar `.bp-brand img`/odpowiednika, by nie nadpisywały nowych atrybutów `width`/
  `height`.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Zmienić rozmiar wyłącznie przez CSS
  (`transform: scale(1.5)`) zamiast atrybutów `width`/`height` — odrzucone: `transform: scale` nie
  rezerwuje dodatkowego miejsca w layoucie (może nachodzić na sąsiednie elementy nagłówka), zmiana
  atrybutów/CSS `width`/`height` jest przewidywalna i poprawnie wpływa na przepływ dokumentu.
- **Zależności:** TASK-010, TASK-016, TASK-017
- **Właściciel/rola:** Web Frontend Software Engineer
- **Acceptance Criteria:** Zgodne z kryteriami akceptacji REQ-031.
- **Definition of Done (zadanie):** Atrybuty/CSS zaktualizowane na 4 stronach i zacommitowane; test
  gate: przegląd wizualny (Code Reviewer) potwierdzający brak rozjeżdżania layoutu nagłówka/stopki i
  brak pikselizacji.
- **Strategia testowania:** E2E (Playwright) — odczyt `getBoundingClientRect()` elementu logo na
  każdej z 4 stron, porównanie z oczekiwanym rozmiarem 1.5× wartości sprzed zmiany; przegląd wizualny
  (zrzuty ekranu) dla jakości/braku pikselizacji.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** Jeśli rozdzielczość natywna `logo.png` okaże się niewystarczająca dla
  ekranów HiDPI w nowym, większym rozmiarze — eskalować do Graphic Artist (Scenariusz 15) po
  dostarczenie zasobu w wyższej rozdzielczości; do zweryfikowania na starcie zadania.

### TASK-028: Walidacja end-to-end recenzji (REQ-027–REQ-031) + brak regresji na TASK-010–TASK-022
- **Traceability:** REQ-027, REQ-028, REQ-029, REQ-030, REQ-031
- **Podejście techniczne:** Rozszerzyć zestaw testów e2e/jednostkowych z TASK-019 (i rozszerzenia z
  TASK-020–TASK-022) o scenariusze dla wszystkich 5 zmian: axe-core na ciemnym motywie (TASK-023,
  wszystkie 3×19 stron formalnych), test nazewnictwa (TASK-024, 57 par), test wersjonowania
  (TASK-025, 57 plików + 19×3 renderowań), test dostępności etykiety języka (TASK-026, 4×19 stron),
  test rozmiaru logo (TASK-027, 4 strony). Potwierdzić równolegle brak regresji na istniejących
  57 plikach `content/bike-pilot/<lang>/*.html` (fixture hashy z TASK-019, musi pozostać zielony) i
  brak regresji funkcjonalnej i18n/cookie consent (REQ-019–REQ-022) po zmianie stylów/etykiet.
- **Rozważone alternatywy i uzasadnienie wyboru:** (a) Weryfikować każde REQ-027–REQ-031 wyłącznie w
  ramach jego własnego TASK (023–027), bez zbiorczego zadania walidacyjnego — odrzucone: powtarza
  wzorzec z TASK-019 (zbiorcza walidacja e2e + regresja po grupie zmian), zapewnia jeden punkt
  potwierdzenia, że zmiany nie kolidują ze sobą nawzajem (np. ciemny motyw + większe logo + brak
  etykiety języka w tym samym nagłówku).
- **Zależności:** TASK-023, TASK-024, TASK-025, TASK-026, TASK-027
- **Właściciel/rola:** Web Frontend Test Engineer + Web Frontend QA Strategy Engineer (przegląd
  zakresu regresji)
- **Acceptance Criteria:** Wszystkie kryteria akceptacji REQ-027–REQ-031 spełnione jednocześnie na
  tych samych 4 stronach/19 językach; pełny zestaw testów (Vitest, `node:test`, Playwright) zielony
  bez regresji względem stanu z LOG-008; `git diff --stat` na `content/bike-pilot/<lang>/*.html`
  (19 katalogów) pozostaje pusty.
- **Definition of Done (zadanie):** Rozszerzony zestaw testów zacommitowany i zielony; test gate:
  0 naruszeń axe-core A/AA, 0 rozbieżności nazewnictwa, 0 plików bez wersji, 0 widocznych etykiet
  języka, rozmiar logo 1.5× na wszystkich 4 stronach.
- **Strategia testowania:** Pełny zestaw (jednostkowe + e2e + axe-core), zgodnie ze Strategią
  testowania grupy `bike-pilot` z `plan/index.md`, rozszerzoną o powyższe 5 scenariuszy.
- **Uwagi z researchu Apple:** nie dotyczy (domena web).
- **Ryzyka / otwarte decyzje:** brak.
