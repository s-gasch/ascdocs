# Rejestr wymagań — ASCDocs

> Struktura zgodna z `~/.copilot/workflow/workflow.md`, Zasady globalne pkt 3 i 5. Ten plik zawiera
> wyłącznie changelog i spis grup — pełne wpisy `REQ-XXX` znajdują się w plikach grup.

## Changelog

| Data | Zmiana |
|------|--------|
| 2026-08-10 | Utworzenie rejestru na podstawie `docs/dev/draft.md` (Scenariusz 2 — Requirements). Dodano grupę `appstore-docs` (REQ-001–REQ-016). |
| 2026-08-10 | Dodano REQ-017 (brak zależności do dodatkowych bibliotek JS w kodzie produkcyjnym) na jawne żądanie użytkownika — grupa `appstore-docs`. |

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

## Otwarte pytania

Brak otwartych, nierozstrzygniętych pytań — wszystkie zidentyfikowane niejednoznaczności zostały
rozstrzygnięte z użytkownikiem (zob. `appstore-docs.md`, sekcja źródeł ustaleń w REQ-010 i REQ-011).
