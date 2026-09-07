# Rejestr wymagań — grupa: bike-pilot

> Część `docs/dev/requirements/index.md` — patrz tam: changelog, domena projektu, macierz
> przeglądarek, spis grup.

Źródło tej grupy: `docs/dev/requirements/ideas.md` (pomysły/kierunki rozwoju, nie wymagania same w
sobie), sformalizowane dla aplikacji **bike-pilot** jako pilotaż nowej architektury (Scenariusz 2 —
Requirements). Ustalenia z użytkownikiem (2026-09-07), rozstrzygające niejednoznaczności `ideas.md`:
1. **Koegzystencja:** nowa struktura plików jest **dodawana obok** istniejącej
   `content/bike-pilot/<lang>/{privacy-policy,terms-of-use,support}.html` (REQ-002/REQ-003) — stare
   pliki pozostają nienaruszone, niepodpięte pod nowy silnik, nadal działają pod dotychczasowymi URL.
2. **Zakres wdrożenia:** tylko `content/bike-pilot/` (pilotaż); `content/common/` pozostaje
   niezmienione w tym przyroście — nowy silnik JS jest lokalny dla bike-pilot.
3. **Prototyp marketingowy** `content/bike-pilot/en/merketing/` pozostaje bez zmian i nieużywany;
   nowa strona marketingowa (`content/bike-pilot/index.html`) budowana jest od zera wg `ideas.md`.
4. **Języki docelowe:** wszystkie 19 obecnych języków bike-pilot: `ar, cs, da, de, en, es, fr, it, ja,
   ko, nb, nl, pl, pt-PT, ru, sv, tr, uk, zh-Hans`.
5. **Zakres cookie consent:** obejmuje wszystkie strony bike-pilot (formalne + marketingową), bo
   każda z nich może zapisywać wybór języka w cookie.

### REQ-018: Nowa, równoległa struktura plików `content/bike-pilot/` (bez zmian w istniejącej)
- **Status:** Zaakceptowane
- **Źródło:** "Istniejaca struktura plikow musi pozostac niezmieniona."; "Nowa struktura plikow dla
  kazdej aplikacji: content/<app-name>/terms-of-use.html ... privacy-policy.html ... support.html ...
  index.html ... css/{formal.css,support.css} ... js/{formal.js,support.js} ...
  formal/{terms-of-use,privacy-policy,support}/<lang>.json ... img ... media ... content/<lang>.json"
- **Opis:** W `content/bike-pilot/` powstaje nowa struktura, dodana **obok** istniejącej
  `content/bike-pilot/<lang>/*.html`, bez modyfikowania, przenoszenia ani usuwania jakiegokolwiek
  istniejącego pliku:
  - `content/bike-pilot/{privacy-policy,terms-of-use,support}.html` — po jednym wspólnym szablonie na
    typ dokumentu (nie per język), ładującym treść z JSON (zob. REQ-019/REQ-020).
  - `content/bike-pilot/index.html` — strona marketingowa (zob. REQ-024/REQ-025).
  - `content/bike-pilot/css/{formal.css,support.css}` i `content/bike-pilot/js/{formal.js,support.js}`
    — style/skrypty wspólne dla dokumentów formalnych, `support.css`/`support.js` jako rozszerzenie
    specyficzne dla `support.html`.
  - `content/bike-pilot/formal/{terms-of-use,privacy-policy,support}/<lang>.json` — treść per język
    dla każdego typu dokumentu formalnego (19 języków, patrz nota 4 powyżej).
  - `content/bike-pilot/img/`, `content/bike-pilot/media/` — zasoby (z dopuszczalnymi
    podkatalogami), niezależne od zasobu marketingowego istniejącego w `en/merketing/assets/`.
  - `content/bike-pilot/content/<lang>.json` — treść marketingowa per język.
- **Uzasadnienie:** Wprowadzenie architektury JSON+szablon (jeden plik HTML na typ dokumentu, nie na
  parę typ×język) bez ryzyka regresji na dotychczasowych, już wykorzystywanych przez App Store
  Connect adresach URL istniejącej struktury.
- **Kryteria akceptacji:** Żaden z istniejących plików `content/bike-pilot/<lang>/*.html` (19 języków)
  nie został zmieniony (identyczna suma kontrolna przed/po); wszystkie nowe ścieżki z listy powyżej
  istnieją i są niezależne strukturalnie od `<lang>/`.
- **Zależności:** brak (współistnieje z REQ-002, REQ-003 bez ich modyfikacji)
- **Uwagi z researchu:** nie dotyczy (decyzja architektoniczna/organizacyjna, nie API platformy).

### REQ-019: Wykrywanie języka użytkownika na stronach formalnych i marketingowej
- **Status:** Zaakceptowane
- **Źródło:** "Wszystkie glowne pliki html majaw wykrywac jezyk, w ktorym powinny byc wyswietane."
- **Opis:** Każdy z plików `privacy-policy.html`, `terms-of-use.html`, `support.html`, `index.html` w
  `content/bike-pilot/` wykrywa po stronie klienta preferowany język użytkownika i renderuje treść w
  tym języku, jeśli jest wspierany (lista 19 języków, nota 4). Jeśli wykryty język nie jest wspierany
  — fallback do `en`.
- **Uzasadnienie:** Automatyczne dopasowanie języka bez konieczności ręcznego wyboru przy pierwszej
  wizycie.
- **Kryteria akceptacji:** Otwarcie dowolnej z 4 stron z przeglądarką ustawioną na jeden z 19
  wspieranych języków wyświetla treść w tym języku; z językiem niewspieranym (np. `fi`) wyświetla
  treść w `en`, bez błędów konsoli.
- **Zależności:** REQ-018
- **Uwagi z researchu:** Web Platform Documentation Researcher: wykrywanie języka przeglądarki po
  stronie klienta odbywa się przez `navigator.language`/`navigator.languages` (Web API, wspierane we
  wszystkich przeglądarkach macierzy REQ-011); dopasowanie do wspieranej listy powinno uwzględniać
  dopasowanie samego kodu języka bazowego (np. `pt-BR` → brak `pt-PT` dokładnie, ale `pt` jako prefiks
  może wymagać jawnej reguły) — do doprecyzowania na poziomie zadania implementacyjnego. Źródło:
  MDN — `Navigator.language`/`Navigator.languages`
  (https://developer.mozilla.org/docs/Web/API/Navigator/language).

### REQ-020: Przełącznik języka na inny obsługiwany
- **Status:** Zaakceptowane
- **Źródło:** "Pozwol na zmiane jezyka na inny, obslugiwany."
- **Opis:** Każda z 4 stron udostępnia widoczny element UI (np. lista rozwijana) pozwalający wybrać
  jeden z 19 wspieranych języków niezależnie od wykrytego domyślnie; wybór natychmiast przełącza
  wyświetlaną treść bez przeładowania całej nawigacji poza treścią dokumentu.
- **Uzasadnienie:** Użytkownik może chcieć czytać dokument w innym języku niż wykryty automatycznie.
- **Kryteria akceptacji:** Wybranie języka z przełącznika na dowolnej z 4 stron zmienia wyświetlaną
  treść na treść z odpowiedniego `<lang>.json` bez przeładowania strony (lub z przeładowaniem, o ile
  finalny stan jest poprawny — decyzja implementacyjna do udokumentowania w TASK), bez błędów konsoli.
- **Zależności:** REQ-018, REQ-019
- **Uwagi z researchu:** nie dotyczy (element UI, nie nowe API platformy).

### REQ-021: Trwałe zapamiętanie wyboru języka
- **Status:** Zaakceptowane
- **Źródło:** "Wybor innego jezyka powinien byc trwale zapamietany (cookies/webstorage)"
- **Opis:** Wybór języka dokonany przez przełącznik (REQ-020) jest zapisywany w **cookie** (a nie
  wyłącznie w Web Storage) — wybór mechanizmu cookie jest celowy: uzasadnia i włącza wymóg klauzuli
  informacyjnej o cookies (REQ-022). Przy kolejnej wizycie dowolnej z 4 stron zapisany wybór ma
  pierwszeństwo przed automatyczną detekcją (REQ-019).
- **Uzasadnienie:** Spójne, przewidywalne doświadczenie przy powrocie użytkownika na stronę.
- **Kryteria akceptacji:** Po wybraniu języka X i ponownym otwarciu dowolnej z 4 stron (nowa sesja
  przeglądarki, ten sam profil) treść wyświetla się w języku X, niezależnie od `navigator.language`.
  Wyczyszczenie cookies przywraca zachowanie z REQ-019.
- **Zależności:** REQ-019, REQ-020, REQ-022
- **Uwagi z researchu:** Web Platform Documentation Researcher: zapis odbywa się przez
  `document.cookie` (Web API), z atrybutami `Max-Age`/`Expires`, `SameSite=Lax`, `Path=/` — bez
  potrzeby dodatkowej biblioteki. Źródło: MDN — `Document.cookie`
  (https://developer.mozilla.org/docs/Web/API/Document/cookie). Zapis cookie preferencji językowej
  nie może nastąpić przed uzyskaniem zgody z REQ-022 (patrz kryteria akceptacji REQ-022).

### REQ-022: Klauzula informacyjna o cookies (zgoda jednorazowa) na wszystkich stronach
- **Status:** Zaakceptowane
- **Źródło:** "Jesli uzywamy cookies, to mysi byc wyswietlona klauzula informacyjna do zatwierdzenia
  (jednokrotnie)"; ustalenie z użytkownikiem (2026-09-07): dotyczy wszystkich stron bike-pilot
  (formalnych i marketingowej), nie tylko marketingowej.
- **Opis:** Każda z 4 stron (`privacy-policy.html`, `terms-of-use.html`, `support.html`,
  `index.html`) wyświetla przy pierwszej wizycie baner/klauzulę informującą o użyciu cookie do
  zapamiętania wyboru języka, z możliwością zatwierdzenia. Zgoda jest zapamiętywana (raz zatwierdzona,
  baner nie pojawia się ponownie na żadnej z 4 stron w ramach tej samej przeglądarki). Przed
  zatwierdzeniem zgody cookie preferencji językowej (REQ-021) nie jest zapisywane — strona może nadal
  działać na bazie detekcji (REQ-019), tylko bez trwałego zapamiętania wyboru.
- **Uzasadnienie:** Zgodność z ogólną zasadą informowania o użyciu cookies przed ich zapisaniem.
- **Kryteria akceptacji:** Pierwsza wizyta na dowolnej z 4 stron pokazuje baner; zatwierdzenie na
  jednej stronie powoduje brak banera na pozostałych 3 przy kolejnych wizytach; przed zatwierdzeniem
  zmiana języka (REQ-020) nie zapisuje cookie (weryfikowalne przez brak wpisu w `document.cookie`).
- **Zależności:** REQ-021
- **Uwagi z researchu:** nie dotyczy (wymóg informacyjny/UX, nie nowe API platformy).

### REQ-023: Minimalistyczny, spójny wygląd stron formalnych z dyskretnym logo
- **Status:** Zaakceptowane
- **Źródło:** "Strony formalne maja byc minimalistyczne, jasno i wyraznie prezentowac tresc dla
  uzytkownika. Dopuszcza sie male dyskretne logo aplikacji. Style i kolorystyka spojne."
- **Opis:** `privacy-policy.html`, `terms-of-use.html`, `support.html` współdzielą `css/formal.css`
  (plus `support.css` jako rozszerzenie tylko dla `support.html`) zapewniający spójną, minimalistyczną
  kolorystykę/typografię, czytelną hierarchię treści oraz opcjonalne, małe, dyskretne logo aplikacji
  bike-pilot (nie dominujące nad treścią).
- **Uzasadnienie:** Dokumenty prawne/wsparcia mają priorytetowo prezentować treść, nie estetykę
  marketingową.
- **Kryteria akceptacji:** Przegląd wizualny (Code Reviewer/Web Frontend Software Architect)
  potwierdza spójność stylu między 3 stronami formalnymi i obecność co najwyżej jednego, małego
  elementu logo na stronę.
- **Zależności:** REQ-018
- **Uwagi z researchu:** nie dotyczy.

### REQ-024: Strona marketingowa przyciągająca użytkownika, z odrębnym projektem per aplikacja
- **Status:** Zaakceptowane
- **Źródło:** "Strona marketingowa ma byc zaprojektowana tak, aby przyciagala uzytkownika."; "Kazda
  aplikacja moze miec inny projekt."
- **Opis:** `content/bike-pilot/index.html` jest stroną informacyjno-marketingową o odrębnym stylu od
  stron formalnych (własny `css`/`js`, poza `formal.css`/`formal.js`), zaprojektowaną pod kątem
  atrakcyjności wizualnej i konwersji, niezależnie od stylu przyjętego dla innych aplikacji w
  projekcie (mechanizm nadpisania stylu per aplikacja jest już objęty REQ-005/REQ-008 — to wymaganie
  potwierdza jego zastosowanie także do strony marketingowej bike-pilot, nie duplikuje go).
- **Uzasadnienie:** Strona marketingowa pełni inną funkcję niż dokumenty formalne — wymaga swobody
  projektowej.
- **Kryteria akceptacji:** `index.html` renderuje się poprawnie z własnym zestawem CSS/JS,
  niezależnie od `formal.css`/`formal.js`; brak wizualnego "przeciekania" stylu formalnego na stronę
  marketingową i odwrotnie.
- **Zależności:** REQ-018
- **Uwagi z researchu:** nie dotyczy.

### REQ-025: Strona marketingowa wykrywa i pozwala zmienić język
- **Status:** Zaakceptowane
- **Źródło:** "Strona marketingowa rowniez powinna byc wyswietlana w domyslnym jezyku z mozliwoscia
  zmiany."
- **Opis:** `index.html` podlega tym samym zasadom wykrywania (REQ-019), przełączania (REQ-020) i
  zapamiętywania (REQ-021) języka co strony formalne, ładując treść z
  `content/bike-pilot/content/<lang>.json`.
- **Uzasadnienie:** Spójne zachowanie i18n na wszystkich stronach bike-pilot.
- **Kryteria akceptacji:** Kryteria akceptacji REQ-019/REQ-020/REQ-021 są spełnione również dla
  `index.html`.
- **Zależności:** REQ-018, REQ-019, REQ-020, REQ-021
- **Uwagi z researchu:** nie dotyczy (patrz uwagi w REQ-019/REQ-021).

### REQ-026: Pliki `formal/<typ>/<lang>.json` zawierają treść strukturalną, nie znaczniki HTML
- **Status:** Zaakceptowane
- **Źródło:** "chcialem, aby pliki HTML (formal) byly szablonami, ktore wczutyja wpliki json z
  trescia. Plik json nie ma zawierac komplentego HTML, tylko tresc w konktretnym jezyku. Znajdz
  wspolne elementy w plikach formalnych i przygotuj pod to pliki json, ktore nie zawieraja HTML."
- **Opis:** Doprecyzowanie/uszczegółowienie REQ-018 dla plików treści dokumentów formalnych
  (`content/bike-pilot/formal/{privacy-policy,terms-of-use,support}/<lang>.json`): plik JSON danego
  języka **nie zawiera znaczników HTML** (żadnego pola z surowym ciągiem `html`/tagami), wyłącznie
  ustrukturyzowaną treść tekstową opisaną poniższym, wspólnym modelem — wyprowadzonym z analizy
  elementów wspólnych dla wszystkich 3 typów dokumentów formalnych w istniejących 19×3 plikach
  źródłowych `content/bike-pilot/<lang>/*.html` (analiza: `p`, `h2`, `h3`, `ul`, `ol`, `li`, `table`/
  `thead`/`tbody`/`tr`/`th`/`td`, `strong`, `em`, `code`, `a`, `br` — brak innych znaczników
  strukturalnych w treści dokumentów). Znaczniki HTML finalnie prezentowane użytkownikowi są
  wyłącznie odpowiedzialnością szablonu (`privacy-policy.html`/`terms-of-use.html`/`support.html` +
  `js/formal.js`), który buduje semantyczny DOM z tego modelu — treść per język pozostaje czystym
  tekstem/danymi, bez znaczników.

  **Model danych** (dokument = tablica bloków w kolejności występowania w oryginale, jeden do
  jednego z sekwencją elementów wewnątrz `<template id="doc-content">` źródłowego pliku):
  ```jsonc
  {
    "title": "Privacy Policy",
    "blocks": [
      { "type": "heading", "level": 2, "text": "Summary" },       // z <h2>/<h3> (level: 2 lub 3)
      { "type": "paragraph", "runs": [ { "text": "..." } ] },      // z <p>
      { "type": "list", "ordered": false,                          // z <ul>/<ol>
        "items": [ [ { "text": "..." } ], [ { "text": "..." } ] ] },
      { "type": "table",                                           // z <table>
        "headers": ["Data / Permission", "Purpose", "Where it is stored"],
        "rows": [ [ [ { "text": "Location (GPS)", "bold": true } ], [ { "text": "..." } ] ] ] }
    ]
  }
  ```
  Tekst sformatowany wewnątrz akapitu/komórki/pozycji listy (`runs`) to tablica segmentów
  `{ "text": "...", "bold"?: true, "italic"?: true, "code"?: true, "href"?: "...", "break"?: true }`
  odpowiadających kolejno `strong`, `em`, `code`, `a[href]`, `br` — dokładnie zestawowi znaczników
  inline zaobserwowanych w istniejącej treści (np. `<em>Last updated: ...</em>`, blok kontaktowy z
  `<strong>Email:</strong> <a href="mailto:...">...</a>`, wielolinijkowy adres z `<br />`).
- **Uzasadnienie:** Rozdzielenie treści od znaczników: (1) eliminuje ryzyko wstrzyknięcia
  nieprawidłowego/niebezpiecznego HTML przy tłumaczeniu/edycji treści per język, (2) upraszcza
  tłumaczenie (tłumacz edytuje wyłącznie pola `text`, nie musi rozumieć/zachowywać składni HTML),
  (3) czyni treść przenośną — ten sam model danych mógłby zasilić inny szablon/prezentację bez
  zmiany plików językowych.
- **Kryteria akceptacji:** Żaden plik `formal/<typ>/<lang>.json` (57 plików, 19 języków × 3 typy) nie
  zawiera ciągu znaków `<` będącego częścią znacznika HTML (walidacja automatyczna); wyrenderowana
  przez `js/formal.js` treść każdego z 57 plików jest tekstowo równoważna (ten sam widoczny tekst,
  ta sama struktura nagłówków/list/tabel/odnośników) treści renderowanej przed tą zmianą (regresja
  wizualna/tekstowa wobec stanu z TASK-011/TASK-018).
- **Zależności:** REQ-018 (doprecyzowuje format treści zdefiniowany tam ogólnie jako "treść per
  język"); nie dotyczy `content/<lang>.json` strony marketingowej (REQ-024/REQ-025) — ograniczone
  wyłącznie do treści dokumentów formalnych.
- **Uwagi z researchu:** nie dotyczy (decyzja dot. formatu danych, nie nowego API platformy).
