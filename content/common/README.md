# `content/common/`

Zasoby wspólne dla wszystkich aplikacji (TASK-001, REQ-002/REQ-006). Struktura produkcyjna — brak
kroku build; te pliki są serwowane bezpośrednio przez hosting statyczny.

- `css/` — bazowy arkusz stylów (`base.css`) ładowany jako pierwsza warstwa stylu dla każdej
  aplikacji, chyba że dostarczy ona własny override (`content/<app-name>/template/override.css`,
  zob. TASK-004/REQ-007).
- `js/` — silnik renderujący (`render.js`, ES module) odpowiedzialny za kompozycję strony w
  przeglądarce (TASK-002/REQ-004): odczyt treści z pliku wejściowego, wybór szablonu (bazowy vs.
  override aplikacji) i złożenie finalnego DOM.
- `templates/` — bazowy szablon HTML (`base.html`) używany domyślnie przez każdą aplikację, która
  nie dostarcza własnego `content/<app-name>/template/template.html` (TASK-003/REQ-006).

Pełny przewodnik autorski (jak dodać aplikację/język/dokument/override) — zob.
`docs/authoring-guide.md` (TASK-008).
