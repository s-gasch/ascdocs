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
- **Status:** Zaakceptowane (17/17 wymagań ze statusem "Zaakceptowane", 0 otwartych pytań).
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`requirements/appstore-docs.md`](dev/requirements/appstore-docs.md) | REQ-001–REQ-017 | Struktura, renderowanie klienckie, szablony/override, i18n/fallback, macierz przeglądarek, dostępność/wydajność, brak zależności do dodatkowych bibliotek JS. |

### Plan pracy (`docs/dev/plan/`)
- **Status:** Utworzony, oczekuje na potwierdzenie użytkownika przed rozpoczęciem implementacji
  (Scenariusz 4).
- **Grupy:**
  | Grupa (plik) | Zakres | Opis |
  |--------------|--------|------|
  | [`plan/appstore-docs.md`](dev/plan/appstore-docs.md) | TASK-001–TASK-009 | Scaffolding struktury, silnik renderujący, szablon bazowy, mechanizm override, spec plików wejściowych, fallback językowy, walidacja cross-browser/a11y/performance, przewodnik autorski + bazowe pliki `sample-app`, rozszerzenie `sample-app` do pełnej referencyjnej aplikacji QA. |
- **Log decyzji/eskalacji:** 5 wpisów w `plan/index.md` (fallback językowy, macierz przeglądarek,
  mechanizm techniczny fallbacku, brak zależności do dodatkowych bibliotek JS, scalenie aplikacji
  przykładowej z aplikacją referencyjną `sample-app`).

### Log implementacji (`docs/dev/log.md`)
- Nie utworzony jeszcze — powstanie przy rozpoczęciu Scenariusza 4 (Implementation).

## Audyty / raporty (`docs/dev/audits/`, `docs/dev/reports/`)
- Brak na tym etapie.

## Ostatnia aktualizacja
2026-08-10 — rozszerzono TASK-008 o przygotowanie bazowych plików aplikacji przykładowej
`content/sample-app/` (en/ + template/), do których odwołuje się `docs/authoring-guide.md`; TASK-009
rozszerza tę samą aplikację zamiast tworzyć osobną (decyzja użytkownika — brak duplikacji).
