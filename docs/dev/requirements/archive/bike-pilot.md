# Archiwum wymagań — grupa `bike-pilot` (REQ-027–REQ-031)

> Wpisy przeniesione z `requirements/bike-pilot.md` po zamknięciu (Scenariusz 4, krok 5 —
> weryfikacja wsteczna potwierdziła zgodność z Acceptance Criteria). Treść skopiowana dosłownie,
> bez zmian (Zasady globalne, pkt 11).


Kolejna grupa wpisów (REQ-027–REQ-031) powstała na podstawie recenzji wdrożonego pilotażu:
`docs/dev/reports/2026-09-07-bike-pilot-review.md` (Scenariusz 2 — Requirements, wyzwolone raportem
recenzyjnym, analogicznie do wejścia Scenariusza 7 wariant B). Ustalenia rozstrzygające
niejednoznaczności raportu z użytkownikiem (2026-09-07):
1. **Nazwa kanoniczna PL dla "Terms of Use":** "Warunki korzystania" (zgodna z
   `formal/terms-of-use/pl.json` i starym `content/bike-pilot/pl/terms-of-use.html`) — etykieta
   nawigacyjna `navTerms` w `js/language.js` ("Warunki użytkowania") jest niespójna i ma zostać
   ujednolicona do "Warunki korzystania".
2. **Interpretacja "powiększ logo na 150%":** finalny rozmiar logo = 1.5× obecnego (nie +150%/2.5×).
3. **Wersjonowanie dokumentów formalnych:** format semantyczny `MAJOR.MINOR` (np. "1.0", "1.1"),
   jedna wersja per typ dokumentu (`privacy-policy`/`terms-of-use`/`support`), wspólna dla wszystkich
   19 języków (nie osobna wersja per język).

### REQ-027: Ciemny motyw wizualny dokumentów formalnych (czarne tło, jasne teksty, pomarańczowe akcenty spójne z logo)
- **Status:** Zaakceptowane
- **Źródło:** `docs/dev/reports/2026-09-07-bike-pilot-review.md`, pkt 1–3: "Tlo dla wszystkich formal
  dokumentow powinno byc zawsze czarne."; "Wszystkie napisy jasne lub nawet biale."; "Akcenty
  pomaranczowe, spojne z kolorystyka logo.png."
- **Opis:** Doprecyzowuje kolorystykę ustaloną ogólnie w REQ-023 ("Style i kolorystyka spójne") dla
  trzech stron formalnych bike-pilot (`privacy-policy.html`, `terms-of-use.html`, `support.html`;
  **nie** dotyczy `index.html` — raport ogranicza się do "dokumentów formalnych"). `css/formal.css`
  (i rozszerzenie `support.css`) zostają przebudowane na ciemny motyw:
  - tło strony i wszystkich kontenerów (`.bp-formal-shell`, `.bp-formal-header`, `.bp-formal-intro`,
    `.bp-formal-content`, `.bp-formal-footer`) — czarne lub prawie czarne (dopuszczalny bardzo ciemny
    odcień neutralny dla subtelnej hierarchii wizualnej między kontenerami, np. `#000000`/`#0a0a0a`),
  - cała treść tekstowa (nagłówki, akapity, listy, tabele, stopka) — jasna/biała, z zachowaniem
    kontrastu WCAG AA,
  - akcenty (linki, aktywne elementy UI, obramowania wyróżnień) — pomarańczowe, w odcieniu spójnym z
    dominującym kolorem `content/bike-pilot/img/logo.png` (zmierzony dominujący odcień: rodzina barw
    wokół `#f07000`, odcień ~25–35° w HSL); zastępują dotychczasowy niebieski akcent
    (`--bp-accent: #1f6feb`).
- **Uzasadnienie:** Spójność wizualna z tożsamością marki (logo) i jednoznaczna preferencja
  użytkownika co do ciemnego motywu dla treści prawnych/wsparcia.
- **Kryteria akceptacji:** Na wszystkich 3 stronach formalnych, w każdym z 19 języków: obliczony
  (computed) kolor tła `html`/`body` i głównych kontenerów `.bp-formal-*` jest czarny/prawie czarny
  (luminancja relatywna ≤ 0.05); wszystkie elementy tekstowe mają kontrast ≥ 4.5:1 względem tła
  (axe-core, 0 naruszeń A/AA — bez regresji względem stanu sprzed zmiany, zob. DoD grupy
  `bike-pilot`); kolor akcentu (linki, elementy interaktywne) mieści się w zakresie odcienia
  ~20–40° (HSL hue), tj. w rodzinie pomarańczy logo, weryfikowalne przez odczyt `computed style`.
- **Zależności:** REQ-018, REQ-023 (doprecyzowuje kolorystykę)
- **Uwagi z researchu:** Web Platform Documentation Researcher: zmiana z jasnego na ciemne tło z
  wysokim kontraktem (biały tekst na czarnym) wymaga ponownej weryfikacji kontrastu wg WCAG 2.1/2.2 AA
  (min. 4.5:1 dla tekstu zwykłego, 3:1 dla dużego) — nie można założyć automatycznie wystarczającego
  kontrastu tylko dlatego, że kolory są odwrotne; źródło: WCAG 2.1, kryterium 1.4.3 Contrast
  (Minimum) (https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html).

### REQ-028: Spójność nazewnictwa dokumentów formalnych między wszystkimi miejscami użycia, w każdym języku
- **Status:** Zaakceptowane
- **Źródło:** `docs/dev/reports/2026-09-07-bike-pilot-review.md`, pkt 4: "Spojnosc nazw, np. w PL
  jest \"Warunki uzytkowania\" i potem \"Warunki korzystania\". Powinno to byc spojne we wszystkich
  jezykach."
- **Opis:** Dla każdego z 19 języków i każdego z 3 typów dokumentu formalnego (`privacy-policy`,
  `terms-of-use`, `support`), nazwa dokumentu widoczna użytkownikowi musi być identyczna we
  wszystkich miejscach jej użycia: pole `title` w `formal/<typ>/<lang>.json`, etykieta nawigacyjna
  odpowiadająca temu typowi w `js/language.js` (`navPrivacy`/`navTerms`/`navSupport`) oraz — jeśli
  dotyczy — treść widoczna na stronie marketingowej (`index.html`) linkująca do danego dokumentu.
  Zidentyfikowana konkretna niespójność do naprawienia: `js/language.js`, klucz `pl.navTerms` =
  "Warunki użytkowania", podczas gdy `formal/terms-of-use/pl.json` (`title`) i stary
  `content/bike-pilot/pl/terms-of-use.html` używają "Warunki korzystania" — kanoniczna nazwa PL to
  **"Warunki korzystania"** (ustalenie z użytkownikiem, 2026-09-07); `navTerms.pl` ma zostać
  ujednolicone do tej wartości. Dla pozostałych 18 języków oraz dla `navPrivacy`/`navSupport`
  wymagana jest analogiczna weryfikacja (obecnie zgodne dla PL, ale nie zweryfikowane dla
  pozostałych 18 języków).
- **Uzasadnienie:** Niespójna nazwa tego samego dokumentu w różnych miejscach interfejsu wprowadza
  użytkownika w błąd co do tego, czy to ten sam dokument prawny.
- **Kryteria akceptacji:** Automatyczna weryfikacja (skrypt/test) porównująca, dla wszystkich 57 par
  (19 języków × 3 typy dokumentów), wartość `title` z `formal/<typ>/<lang>.json` z odpowiadającą
  etykietą nawigacyjną (`navPrivacy`/`navTerms`/`navSupport`) w `js/language.js` dla tego samego
  języka — 0 rozbieżności po zmianie (obecnie: 1 znana rozbieżność, `pl.navTerms`).
- **Zależności:** REQ-018
- **Uwagi z researchu:** nie dotyczy (spójność treści tekstowej, nie API platformy).

### REQ-029: Wersjonowanie dokumentów formalnych (numer wersji obok daty aktualizacji)
- **Status:** Zaakceptowane
- **Źródło:** `docs/dev/reports/2026-09-07-bike-pilot-review.md`, pkt 5: "Zacznij wersjonowac
  dokumenty. Oprocz daty aktualizacji, powinna tez byc wersja kazdego z dokumentow."
- **Opis:** Każdy z 3 typów dokumentu formalnego (`privacy-policy`, `terms-of-use`, `support`)
  otrzymuje numer wersji w formacie semantycznym `MAJOR.MINOR` (np. `"1.0"`), przechowywany jako
  nowe pole na poziomie dokumentu w modelu danych z REQ-026 (obok istniejącego pola daty ostatniej
  aktualizacji), **wspólny dla wszystkich 19 języków tego samego typu dokumentu** (nie osobny numer
  per język — ustalenie z użytkownikiem, 2026-09-07). Szablon (`privacy-policy.html`/
  `terms-of-use.html`/`support.html` + `js/formal.js`) renderuje numer wersji obok istniejącej daty
  aktualizacji (np. "Wersja 1.0 · Ostatnia aktualizacja: ..."), we wszystkich 19 językach (etykieta
  "Wersja"/"Version" itd. tłumaczona analogicznie do innych etykiet współdzielonych w
  `js/language.js`). Punkt startowy: wszystkie 3 typy dokumentów zaczynają od wersji `"1.0"` przy
  wdrożeniu tego wymagania (niezależnie od tego, że treść mogła się już zmieniać wcześniej — to
  pierwsza formalna wersja od momentu wprowadzenia wersjonowania).
- **Uzasadnienie:** Umożliwia jednoznaczne odwołanie się do konkretnej wersji dokumentu prawnego
  (np. w komunikacji z użytkownikami o zmianach), niezależnie od samej daty.
- **Kryteria akceptacji:** Każdy z 3 typów dokumentu ma zdefiniowaną wersję `MAJOR.MINOR` widoczną na
  stronie w każdym z 19 języków, obok daty aktualizacji; wersja jest identyczna między językami tego
  samego typu dokumentu (weryfikacja automatyczna: pole wersji w każdym z 19 plików `<lang>.json`
  danego typu ma tę samą wartość); zasada podnoszenia wersji (co najmniej: `MINOR` przy zmianie
  redakcyjnej/kosmetycznej treści, `MAJOR` przy zmianie zakresu/znaczenia prawnego) jest
  udokumentowana w `docs/authoring-guide.md`.
- **Zależności:** REQ-018, REQ-026 (rozszerza model danych `{ title, blocks[] }` o pole wersji)
- **Uwagi z researchu:** nie dotyczy (decyzja dot. formatu danych/procesu redakcyjnego, nie nowego
  API platformy).

### REQ-030: Usunięcie etykiety tekstowej "Language" z nagłówka (przełącznik języka pozostaje)
- **Status:** Zaakceptowane
- **Źródło:** `docs/dev/reports/2026-09-07-bike-pilot-review.md`, pkt 6: "Usun informacje z
  naglowka o mozliwosci wyboru jezyka. To zajmuje miejsce, a jest widoczny drop-down do tego."
- **Opis:** Na wszystkich 4 stronach bike-pilot (`privacy-policy.html`, `terms-of-use.html`,
  `support.html`, `index.html`) usunięty zostaje widoczny tekst etykiety poprzedzającej przełącznik
  języka (`<span data-language-label>` renderowany z klucza `languageLabel` w `js/language.js`) —
  sam element `<select data-language-select>` pozostaje w pełni funkcjonalny i widoczny, jako
  wystarczająco jednoznaczny bez opisowej etykiety tekstowej. Element `data-language-label` może
  pozostać w DOM wyłącznie jako ukryty wizualnie tekst dostępny dla czytników ekranu (np.
  `aria-label`/tekst zastępujący widoczną etykietę), by nie pogorszyć dostępności elementu `<select>`
  dla użytkowników czytników ekranu.
- **Uzasadnienie:** Oszczędność miejsca w nagłówku; dropdown jest samowystarczalny wizualnie
  (ikona/flaga języka + lista rozwijana), zbędny opisowy tekst nie wnosi wartości.
- **Kryteria akceptacji:** Na wszystkich 4 stronach, w każdym z 19 języków, widoczny (renderowany,
  niewizualnie ukryty) tekst etykiety `languageLabel` nie jest już wyświetlany w nagłówku; element
  `<select data-language-select>` pozostaje funkcjonalny (wybór języka działa jak dotąd, zgodnie z
  REQ-019/020/021); automatyczna kontrola dostępności (axe-core) nie zgłasza nowych naruszeń A/AA
  związanych z brakiem widocznej etykiety pola formularza (np. `label`/`aria-label` wciąż obecny,
  tylko niewidoczny wizualnie).
- **Zależności:** REQ-020
- **Uwagi z researchu:** Web Platform Documentation Researcher: usunięcie widocznego tekstu etykiety
  pola formularza (`<select>`) bez zastąpienia go dostępnym odpowiednikiem (np. wizualnie ukryty
  tekst techniką "visually hidden", nie `display:none`) narusza WCAG 4.1.2 (Name, Role, Value) dla
  użytkowników czytników ekranu — technika zalecana: klasa CSS "sr-only"/`.visually-hidden`
  zachowująca element w drzewie dostępności. Źródło: WAI-ARIA Authoring Practices Guide, wzorzec
  "Visually Hidden" (https://www.w3.org/WAI/tutorials/forms/labels/).

### REQ-031: Powiększenie logo o 150% (1.5× obecnego rozmiaru) na wszystkich stronach bike-pilot
- **Status:** Zaakceptowane
- **Źródło:** `docs/dev/reports/2026-09-07-bike-pilot-review.md`, pkt 7: "Logo powieksz na 150%.";
  doprecyzowanie z użytkownikiem (2026-09-07): 150% = finalny rozmiar 1.5× obecnego (nie +150%/2.5×).
- **Opis:** Każde wystąpienie `content/bike-pilot/img/logo.png` na 4 stronach bike-pilot zostaje
  powiększone do 1.5× obecnego rozmiaru renderowania: `privacy-policy.html`, `terms-of-use.html`,
  `support.html` (obecnie `width="72" height="36"` → `width="108" height="54"`) oraz `index.html`
  (2 wystąpienia, obecnie `width="76" height="38"`/`width="68" height="34"` → odpowiednio `114"/57"`
  i `102"/51"`), z zachowaniem oryginalnych proporcji (2:1) i bez utraty jakości (plik źródłowy musi
  mieć wystarczającą rozdzielczość natywną dla nowego rozmiaru wyświetlania — do zweryfikowania na
  etapie zadania). Dotyczy zarówno atrybutów `width`/`height` znacznika `<img>`, jak i ograniczeń w
  CSS (`formal.css`/`css/index.css`), jeśli nadpisują rozmiar renderowany.
- **Uzasadnienie:** Zwiększenie widoczności marki bez zmiany proporcji ani jakości logo.
- **Kryteria akceptacji:** Renderowany (computed) rozmiar `<img>` logo na każdej z 4 stron jest
  dokładnie 1.5× rozmiaru sprzed zmiany, z zachowanymi proporcjami 2:1; brak wizualnego
  „rozjeżdżania” layoutu nagłówka/stopki po powiększeniu (przegląd wizualny Code Reviewer/Web
  Frontend Software Architect); brak widocznej pikselizacji/rozmycia logo w powiększonym rozmiarze.
- **Zależności:** REQ-018, REQ-023 (formalne), REQ-024 (marketingowa) — dotyczy logo na obu typach
  stron niezależnie od różnicy w projekcie wizualnym.
- **Uwagi z researchu:** nie dotyczy (zmiana rozmiaru istniejącego zasobu, nie nowe API platformy).
