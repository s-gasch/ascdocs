import "./formal.js";

/**
 * TASK-016 — punkt rozszerzeń strony support. Aktualnie cała logika runtime jest współdzielona
 * przez formal.js; ten moduł pozostaje dedykowany dla potencjalnych rozszerzeń support.html.
 */
document.body?.classList.add("bp-support-runtime");
