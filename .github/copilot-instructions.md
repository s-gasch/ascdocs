# Copilot Instructions for ASCDocs

## ⚠️ Workflow — zawsze czytaj przed rozpoczęciem pracy

**Zawsze używaj `~/.copilot/workflow/workflow.md`** do wyznaczenia scenariusza pracy oraz doboru
odpowiednich person (zespołu ról) dla danego zadania w tym repozytorium. Przeczytaj ten plik
w całości przed podjęciem jakiegokolwiek działania — jest jedynym źródłem prawdy o dostępnych
scenariuszach, zasadach doboru/tworzenia person i zasadach globalnych (m.in. rozstrzyganie
niejednoznaczności, lokalizacja artefaktów w `docs/dev/`).

## Status

**Aktualny stan projektu i spis treści `docs/dev/` żyje w [`docs/readme.md`](../docs/readme.md) —
zawsze zaglądaj tam po bieżący status rejestrów wymagań/planu, zamiast polegać na tym pliku.**

Wymagania (REQ-001–REQ-016) i plan pracy (TASK-001–TASK-009) dla pierwszego przyrostu
("Ujednolicenie dokumentów App Store Connect") zostały przygotowane na podstawie
`docs/dev/draft.md` — zob. `docs/dev/requirements/` i `docs/dev/plan/`. Implementacja (Scenariusz 4)
jeszcze się nie rozpoczęła.

## Working here

- Domena projektu: **Web (HTML/CSS/JS statyczne)** — bez logiki serwerowej, bez kroku build; serwer
  hostuje wyłącznie pliki statyczne.
- Nie zakładaj frameworka/bundlera bez uzasadnienia — domyślnie vanilla HTML/CSS/JS (patrz Zasady
  globalne workflow, kontekst domenowy — Domena B).
- Struktura `content/` (wspólne zasoby vs. specyficzne per aplikacja/język) jest zdefiniowana w
  `docs/dev/requirements/appstore-docs.md` (REQ-002) i `docs/dev/plan/appstore-docs.md` (TASK-001).
- Po każdej zmianie w `docs/dev/` zaktualizuj `docs/readme.md`.
