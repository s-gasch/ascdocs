/**
 * Silnik renderujący ASCDocs (TASK-002, REQ-004/005/006/007).
 *
 * Kontrakt pliku wejściowego (zob. docs/authoring-guide.md, TASK-005/REQ-003):
 * - dokładnie jeden element `<template id="doc-content" data-doc-title="...">` w `<body>`,
 *   zawierający właściwą treść dokumentu (fragment HTML);
 * - ten moduł ładowany jako `<script type="module" src="../../common/js/render.js">`.
 *
 * Ścieżki są wyprowadzane wyłącznie ze struktury katalogów z REQ-002 — bez konieczności
 * konfiguracji per plik:
 * - `commonBase`  = katalog `content/common/` (wyprowadzony z `import.meta.url` tego modułu),
 * - `appBase`     = katalog `content/<app-name>/` (wyprowadzony z URL bieżącej strony,
 *                   `content/<app-name>/<lang>/<doc>.html`).
 *
 * Wybór szablonu (REQ-005/REQ-006): jeśli `content/<app-name>/template/template.html` istnieje
 * (sprawdzane przez `fetch`, bezpieczne w środowisku http(s) — zob. REQ-004, Uwagi z researchu),
 * używany jest szablon aplikacji; w przeciwnym razie szablon bazowy `content/common/templates/
 * base.html`. Styl wspólny (`content/common/css/base.css`) jest ładowany zawsze jako pierwsza
 * warstwa; opcjonalny `content/<app-name>/template/override.css` (REQ-007) jest ładowany po nim,
 * niezależnie od tego, który szablon strukturalny został wybrany.
 *
 * Brak zależności do zewnętrznych bibliotek JS (REQ-017) — wyłącznie natywne Web API.
 */

const CONTENT_ELEMENT_ID = "doc-content";
const SLOT_ATTR = "data-doc-slot";
const TITLE_ATTR = "data-doc-title";
const APP_NAME_ATTR = "data-doc-app-name";
const YEAR_ATTR = "data-doc-year";
const NAV_ATTR = "data-doc-nav";

/**
 * Odczytuje treść dokumentu z kontenera `<template id="doc-content">`.
 * Rzuca jawny błąd, jeśli kontener nie istnieje (kontrakt TASK-002: brak cichego fallbacku).
 * @param {Document} doc
 */
export function extractDocContent(doc) {
  const el = doc.getElementById(CONTENT_ELEMENT_ID);
  if (!el || el.tagName !== "TEMPLATE") {
    throw new Error(
      `ASCDocs render: brak wymaganego kontenera treści <template id="${CONTENT_ELEMENT_ID}"> ` +
        `w pliku wejściowym (zob. docs/authoring-guide.md).`
    );
  }
  return {
    html: el.innerHTML,
    title: el.getAttribute(TITLE_ATTR) || doc.title || "",
  };
}

/**
 * Wyprowadza bazowe URL-e (common/app) ze struktury katalogów REQ-002.
 * @param {string} moduleUrl - `import.meta.url` modułu render.js.
 * @param {string} pageUrl - URL bieżącego dokumentu (`location.href`).
 */
export function resolveBasePaths(moduleUrl, pageUrl) {
  // render.js leży w content/common/js/render.js -> commonBase = content/common/
  const commonBase = new URL("../", moduleUrl).href;
  // strona leży w content/<app>/<lang>/<doc>.html -> appBase = content/<app>/
  const appBase = new URL("../", pageUrl).href;
  const appName = appBase.split("/").filter(Boolean).pop();
  return { commonBase, appBase, appName };
}

/**
 * Sprawdza (przez fetch), czy dany zasób istnieje i można go pobrać (status ok).
 * Nigdy nie rzuca — błąd sieciowy jest traktowany jak "nie istnieje" (fallback do bazy).
 * @param {typeof fetch} fetchImpl
 * @param {string} url
 */
export async function resourceExists(fetchImpl, url) {
  try {
    const res = await fetchImpl(url, { method: "GET" });
    return !!(res && res.ok);
  } catch {
    return false;
  }
}

/**
 * Ustala, którego szablonu strukturalnego użyć (REQ-005/REQ-006).
 * @returns {Promise<{ templateUrl: string, source: "app" | "common" }>}
 */
export async function resolveTemplate(fetchImpl, commonBase, appBase) {
  const appTemplateUrl = new URL("template/template.html", appBase).href;
  if (await resourceExists(fetchImpl, appTemplateUrl)) {
    return { templateUrl: appTemplateUrl, source: "app" };
  }
  return {
    templateUrl: new URL("templates/base.html", commonBase).href,
    source: "common",
  };
}

/**
 * Komponuje finalny fragment DOM: wstawia treść dokumentu do slotu szablonu i wypełnia
 * atrybuty pomocnicze (tytuł, nazwa aplikacji, rok, aktywna nawigacja).
 * @param {Document} doc - dokument (do tworzenia elementów, np. `document` lub `happy-dom`).
 * @param {string} templateHtml - surowy HTML szablonu.
 * @param {{ html: string, title: string }} content
 * @param {{ appName: string, docId: string }} meta
 */
export function composeDocument(doc, templateHtml, content, meta) {
  const wrapper = doc.createElement("div");
  wrapper.innerHTML = templateHtml;

  const slot = wrapper.querySelector(`[${SLOT_ATTR}]`);
  if (!slot) {
    throw new Error(
      `ASCDocs render: szablon nie zawiera wymaganego slotu [${SLOT_ATTR}] (zob. TASK-003/004).`
    );
  }
  slot.innerHTML = content.html;

  wrapper.querySelectorAll(`[${TITLE_ATTR}]`).forEach((el) => {
    el.textContent = content.title;
  });
  wrapper.querySelectorAll(`[${APP_NAME_ATTR}]`).forEach((el) => {
    el.textContent = meta.appName;
  });
  wrapper.querySelectorAll(`[${YEAR_ATTR}]`).forEach((el) => {
    el.textContent = String(new Date().getFullYear());
  });
  wrapper.querySelectorAll(`[${NAV_ATTR}]`).forEach((el) => {
    if (el.getAttribute(NAV_ATTR) === meta.docId) {
      el.setAttribute("aria-current", "page");
      el.classList.add("is-active");
    }
  });

  if (content.title) {
    doc.title = content.title;
  }

  return wrapper;
}

function injectStylesheet(doc, href) {
  const link = doc.createElement("link");
  link.rel = "stylesheet";
  link.href = href;
  doc.head.appendChild(link);
}

/**
 * Punkt wejścia wykonywany w przeglądarce: odczytuje treść, ustala szablon/style i renderuje
 * finalny DOM do `document.body`.
 * @param {Window} win
 */
export async function renderDocument(win) {
  const doc = win.document;
  const content = extractDocContent(doc);
  const { commonBase, appBase, appName } = resolveBasePaths(import.meta.url, win.location.href);
  const docId = win.location.pathname.split("/").pop().replace(/\.html?$/, "");

  injectStylesheet(doc, new URL("css/base.css", commonBase).href);

  const overrideCssUrl = new URL("template/override.css", appBase).href;
  if (await resourceExists(win.fetch.bind(win), overrideCssUrl)) {
    injectStylesheet(doc, overrideCssUrl);
  }

  const { templateUrl } = await resolveTemplate(win.fetch.bind(win), commonBase, appBase);
  const templateRes = await win.fetch(templateUrl);
  if (!templateRes.ok) {
    throw new Error(`ASCDocs render: nie udało się pobrać szablonu ${templateUrl}`);
  }
  const templateHtml = await templateRes.text();

  const composed = composeDocument(doc, templateHtml, content, { appName, docId });
  doc.body.innerHTML = "";
  while (composed.firstChild) {
    doc.body.appendChild(composed.firstChild);
  }
}

/* c8 ignore start -- bootstrap wykonywany wyłącznie w przeglądarce, poza zakresem testów jednostkowych */
if (
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  typeof process === "undefined" // środowisko testowe Vitest/happy-dom eksponuje globalny `process`
) {
  const start = () => {
    renderDocument(window).catch((err) => {
      // Jawny błąd zamiast cichego fallbacku (kontrakt TASK-002).
      console.error(err);
      document.body.innerHTML =
        '<p role="alert">Nie udało się załadować dokumentu. Spróbuj odświeżyć stronę.</p>';
    });
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
}
/* c8 ignore stop */
