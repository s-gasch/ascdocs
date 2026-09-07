# Przewodnik autorski — ASCDocs

> Ten dokument opisuje, krok po kroku, jak przygotowywać i utrzymywać treść w projekcie ASCDocs
> (REQ-012/REQ-013, TASK-008). Nie wymaga znajomości mechanizmu renderującego JS — wystarczy
> podstawowy HTML. Wszystkie przykłady odwołują się do realnych plików aplikacji referencyjnej
> `content/sample-app/`.

## Spis treści

1. [Jak dodać nową aplikację](#1-jak-dodać-nową-aplikację)
2. [Jak dodać/zaktualizować język istniejącej aplikacji](#2-jak-dodaćzaktualizować-język-istniejącej-aplikacji)
3. [Jak dodać nowy typ dokumentu](#3-jak-dodać-nowy-typ-dokumentu)
4. [Jak nadpisać styl/szablon aplikacji](#4-jak-nadpisać-stylszablon-aplikacji)
5. [Fallback językowy — jak działa i kiedy go uruchomić](#5-fallback-językowy--jak-działa-i-kiedy-go-uruchomić)
6. [Minimalny szablon pliku wejściowego](#6-minimalny-szablon-pliku-wejściowego)
7. [Wersjonowanie dokumentów formalnych bike-pilot](#7-wersjonowanie-dokumentów-formalnych-bike-pilot)

---

## 1. Jak dodać nową aplikację

1. Utwórz katalog `content/<app-name>/` (np. `content/moja-aplikacja/`) — nazwa katalogu jest
   identyfikatorem aplikacji.
2. Wewnątrz utwórz katalog `en/` z co najmniej trzema plikami: `privacy-policy.html`,
   `terms-of-use.html`, `support.html` (REQ-009 — `en/` jest zawsze wymagany jako źródło).
3. Skopiuj każdy plik z [szablonu wejściowego](#6-minimalny-szablon-pliku-wejściowego) poniżej i
   uzupełnij właściwą treścią.
4. Nie modyfikuj `content/common/` — nowa aplikacja automatycznie korzysta ze wspólnego szablonu
   bazowego (REQ-006), dopóki nie dostarczysz własnego (zob. punkt 4).

Przykład: `content/sample-app/en/privacy-policy.html`, `terms-of-use.html`, `support.html`.

## 2. Jak dodać/zaktualizować język istniejącej aplikacji

1. Utwórz katalog `content/<app-name>/<lang>/` (np. `content/sample-app/de/`), gdzie `<lang>` to
   kod języka (np. `de`, `pl`, `fr`).
2. Skopiuj pliki `.html` z `content/<app-name>/en/` do nowego katalogu i przetłumacz treść wewnątrz
   `<template id="doc-content">` — nie zmieniaj reszty struktury pliku.
3. Jeśli katalog językowy nie zawiera jeszcze wszystkich trzech dokumentów, brakujące zostaną
   automatycznie uzupełnione kopią z `en/` przy publikacji — zob. [punkt 5](#5-fallback-językowy--jak-działa-i-kiedy-go-uruchomić).

## 3. Jak dodać nowy typ dokumentu

1. Utwórz nowy plik `.html` w `content/<app-name>/<lang>/`, np.
   `content/sample-app/en/marketing-disclosure.html`, zgodny z [szablonem wejściowym](#6-minimalny-szablon-pliku-wejściowego).
2. Nie wymaga to żadnej zmiany w `content/common/` ani w plikach innych aplikacji (REQ-008) — samo
   dodanie zgodnego pliku wystarczy, by dokument renderował się poprawnie.
3. Jeśli chcesz, by nowy dokument pojawił się w nawigacji szablonu, dodaj do niego link z atrybutem
   `data-doc-nav="<nazwa-pliku-bez-rozszerzenia>"` w `content/<app-name>/template/template.html`
   (jeśli aplikacja ma własny szablon strukturalny) — w przeciwnym razie dokument jest nadal
   w pełni dostępny pod swoim bezpośrednim URL, tylko bez linku w nawigacji bazowej.

## 4. Jak nadpisać styl/szablon aplikacji

Nadpisanie stylu (REQ-007) i nadpisanie struktury szablonu (REQ-005) są niezależne — możesz użyć
jednego, obu albo żadnego.

### 4a. Nadpisanie tylko stylu (najczęstszy przypadek)

1. Utwórz `content/<app-name>/template/override.css`.
2. Nadpisz wyłącznie zmienne CSS zdefiniowane w `content/common/css/base.css` (np.
   `--asc-color-accent`, `--asc-font-heading`) — nie kopiuj całego arkusza stylów.
3. Plik jest wykrywany i ładowany automatycznie (zawsze *po* stylu wspólnym) — bez dodatkowej
   konfiguracji.

Przykład: `content/sample-app/template/override.css` zmienia wyłącznie kolor akcentu i krój
nagłówków.

### 4b. Nadpisanie struktury szablonu (rzadszy przypadek)

1. Utwórz `content/<app-name>/template/template.html`.
2. Zachowaj ten sam kontrakt co szablon bazowy (`content/common/templates/base.html`): dokładnie
   jeden element z atrybutem `data-doc-slot` (gdzie wstawiana jest treść dokumentu); opcjonalnie
   `data-doc-title`, `data-doc-app-name`, `data-doc-year`, oraz linki `data-doc-nav="<doc-id>"`.
3. Silnik renderujący automatycznie wykrywa i używa tego szablonu zamiast bazowego dla wszystkich
   dokumentów tej aplikacji.

## 5. Fallback językowy — jak działa i kiedy go uruchomić

- Reguła: `content/<app-name>/en/` jest zawsze źródłem prawdy (REQ-009). Jeśli inny język (np. `pl/`)
  nie zawiera jeszcze wszystkich dokumentów, użytkownik i tak musi zobaczyć treść — a nie błąd 404
  (REQ-010).
- Mechanizm: skrypt `scripts/fallback-languages.js` (uruchamiany lokalnie/w CI, **nigdy** na
  serwerze produkcyjnym — to narzędzie deweloperskie, zob. REQ-001/REQ-017) skanuje `content/`,
  wykrywa brakujące pliki językowe i kopiuje je z `en/`, oznaczając komentarzem HTML
  `<!-- fallback: en -->`.
- **Kiedy uruchomić:** zawsze przed publikacją zmian treści (dodanie/aktualizacja tłumaczeń,
  dodanie nowej aplikacji) — jako ostatni krok przed wdrożeniem na hosting statyczny.
- **Jak uruchomić:**
  ```sh
  npm run fallback:languages
  ```
- Jeśli aplikacja nie ma nawet katalogu `en/`, skrypt zwraca błąd i przerywa publikację (zamiast
  ryzykować brak treści dla użytkownika) — dodaj `en/` przed ponowną próbą.

## 6. Minimalny szablon pliku wejściowego

Skopiuj poniższy szablon jako punkt wyjścia dla nowego dokumentu (dostosuj ścieżkę `src` do modułu
renderującego, jeśli plik nie znajduje się w `content/<app-name>/<lang>/`, oraz tytuł/treść):

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Nazwa dokumentu — Nazwa aplikacji</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" href="data:," />
    <script type="module" src="../../common/js/render.js"></script>
  </head>
  <body>
    <template id="doc-content" data-doc-title="Nazwa dokumentu">
      <p>Twoja treść tutaj — dozwolony dowolny semantyczny HTML (nagłówki h2+, listy, linki,
        obrazy z tekstem alternatywnym).</p>
    </template>
  </body>
</html>
```

**Wymagania kontraktu (REQ-003/TASK-005):**
- dokładnie jeden element `<template id="doc-content">` w `<body>` — jego brak lub duplikat jest
  jawnym błędem zgłaszanym w konsoli przeglądarki, a nie cichym pominięciem;
- atrybut `data-doc-title` na tym elemencie ustawia tytuł widoczny na stronie (nagłówek H1) oraz
  `<title>` dokumentu;
- ścieżka do `render.js` musi być poprawna względem lokalizacji pliku (dla
  `content/<app-name>/<lang>/*.html` zawsze `../../common/js/render.js`).

## 7. Wersjonowanie dokumentów formalnych bike-pilot

> Dotyczy wyłącznie pilotażu `content/bike-pilot/` (REQ-029, TASK-025) — trzech typów dokumentów
> formalnych: `formal/privacy-policy/<lang>.json`, `formal/terms-of-use/<lang>.json`,
> `formal/support/<lang>.json`.

- Każdy z 3 typów dokumentu formalnego ma pole `"version"` na poziomie dokumentu (obok `title` i
  `blocks`), w formacie semantycznym `"MAJOR.MINOR"` (np. `"1.0"`).
- Wersja jest **wspólna dla wszystkich 19 języków** tego samego typu dokumentu — to ten sam
  dokument prawny przetłumaczony na 19 języków, a nie 19 niezależnych dokumentów. Zmieniając treść
  jednego języka, zaktualizuj pole `version` identycznie we wszystkich 19 plikach tego typu.
- **Polityka podnoszenia wersji:**
  - **`MINOR`** (np. `1.0` → `1.1`) — zmiana redakcyjna/kosmetyczna treści (poprawki stylistyczne,
    literówki, drobne doprecyzowania bez zmiany zakresu/znaczenia prawnego).
  - **`MAJOR`** (np. `1.1` → `2.0`) — zmiana zakresu lub znaczenia prawnego treści (nowe
    uprawnienia/obowiązki, zmiana zakresu przetwarzanych danych, istotna zmiana warunków).
- Walidator `validateDocumentModel` (`content/bike-pilot/js/formal.js`) odrzuca dokument bez pola
  `version` lub w niepoprawnym formacie (fail-fast, zgodnie z konwencją TASK-020).
- Renderer (`js/formal.js`) wyświetla wersję obok istniejącej daty ostatniej aktualizacji (etykieta
  `versionLabel` tłumaczona per język w `js/language.js`, analogicznie do innych etykiet
  współdzielonych).
