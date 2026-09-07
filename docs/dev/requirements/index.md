# Rejestr wymagań — ASCDocs

> Struktura zgodna z `~/.copilot/workflow/workflow.md`, Zasady globalne pkt 3 i 5. Ten plik zawiera
> wyłącznie changelog i spis grup — pełne wpisy `REQ-XXX` znajdują się w plikach grup.

## Changelog

| Data | Zmiana |
|------|--------|
| 2026-08-10 | Utworzenie rejestru na podstawie `docs/dev/draft.md` (Scenariusz 2 — Requirements). Dodano grupę `appstore-docs` (REQ-001–REQ-016). |
| 2026-08-10 | Dodano REQ-017 (brak zależności do dodatkowych bibliotek JS w kodzie produkcyjnym) na jawne żądanie użytkownika — grupa `appstore-docs`. |
| 2026-09-07 | Utworzenie grupy `bike-pilot` (REQ-018–REQ-025) na podstawie `docs/dev/requirements/ideas.md` (Scenariusz 2 — Requirements), sformalizowanej jako pilotaż nowej architektury (szablon+JSON per język, wykrywanie/przełącznik/zapamiętanie języka, cookie consent, strona marketingowa) dla aplikacji bike-pilot, dodanej **obok** istniejącej struktury `content/bike-pilot/<lang>/*.html` bez jej modyfikacji. |
| 2026-09-07 | Dodano REQ-026 (grupa `bike-pilot`) doprecyzowujące REQ-018: pliki `formal/<typ>/<lang>.json` mają zawierać ustrukturyzowaną treść (model bloków/runs), nie surowy HTML — na jawne żądanie użytkownika, po tym jak implementacja TASK-011/TASK-018 wygenerowała JSON z osadzonym polem `html`. |

## Domena projektu

**Domena B — Web (HTML/CSS/JS statyczne).** Ustalone na podstawie `docs/dev/draft.md` pkt 2, 3, 9, 17
(projekt to wyłącznie statyczne pliki HTML/CSS/JS/obrazy/wideo, hostowane jako pliki statyczne, bez
logiki po stronie serwera).

## Macierz wspieranych przeglądarek (wymagana dla domeny web)

Ustalona z użytkownikiem (2026-08-10): **nowoczesne przeglądarki evergreen** — ostatnie 2 wersje
Chrome, Edge, Firefox, Safari (desktop) oraz aktualne mobile Safari (iOS) i Chrome (Android). **Brak
wymogu wsparcia IE/przeglądarek legacy.** Zob. REQ-011.

## Spis grup wymagań

| Grupa (plik) | Zakres REQ-XXX | Opis |
|--------------|----------------|------|
| [`requirements/appstore-docs.md`](appstore-docs.md) | REQ-001–REQ-017 | Ujednolicona struktura i mechanizm renderowania dokumentów App Store Connect (Privacy Policy, Terms of Use, Support, inne) dla wielu aplikacji i języków, w oparciu wyłącznie o statyczne pliki HTML/CSS/JS, bez zależności do dodatkowych bibliotek JS. |
| [`requirements/bike-pilot.md`](bike-pilot.md) | REQ-018–REQ-026 | Nowa, równoległa struktura plików dla aplikacji bike-pilot (jeden szablon HTML per typ dokumentu + treść z JSON per język zamiast pliku per język), wykrywanie/przełącznik/trwałe zapamiętanie języka (cookie), klauzula zgody na cookies, strona marketingowa — pilotaż ograniczony do `content/bike-pilot/`, bez zmian w `content/common/` ani w istniejącej strukturze `content/bike-pilot/<lang>/*.html`; REQ-026 doprecyzowuje, że treść formalna w JSON jest ustrukturyzowana (bez HTML). |

## Otwarte pytania

Brak otwartych, nierozstrzygniętych pytań — wszystkie zidentyfikowane niejednoznaczności zostały
rozstrzygnięte z użytkownikiem (zob. `appstore-docs.md`, sekcja źródeł ustaleń w REQ-010 i REQ-011;
`bike-pilot.md`, nota wprowadzająca z ustaleniami z 2026-09-07).
