import {
  DEFAULT_LANGUAGE,
  detectInitialLanguage,
  getUiStrings,
  populateLanguageSelect,
  renderConsentBanner,
  resolveSupportedLanguage,
  setDocumentLanguage,
  setLanguageCookie,
  updateSharedLabels,
  hasConsent,
} from "./language.js";

/**
 * TASK-011/TASK-013/TASK-020/TASK-021 — renderowanie treści formalnej bike-pilot.
 *
 * Model danych dokumentu (REQ-026, TASK-020) — `formal/<typ>/<lang>.json`:
 *   { title: string, blocks: Block[] }
 * gdzie `Block` to jeden z:
 *   { type: "heading", level: 2 | 3, text: string }
 *   { type: "paragraph", runs: Run[] }
 *   { type: "list", ordered: boolean, items: Run[][] }            // items[i] = runs jednej pozycji <li>
 *   { type: "table", headers: string[], rows: Run[][][] }          // rows[i][j] = runs jednej komórki <td>
 * a `Run` to segment tekstu sformatowanego wewnątrz akapitu/pozycji listy/komórki tabeli:
 *   { text: string, bold?: true, italic?: true, code?: true, href?: string, break?: true }
 * odpowiadający kolejno zwykłemu tekstowi, `<strong>`, `<em>`, `<code>`, `<a href>`, `<br>`.
 * `break: true` reprezentuje samodzielny `<br>` i nie wymaga pola `text`. Dokument nie zawiera
 * żadnego pola z surowym znacznikiem HTML (REQ-026) — treść jest budowana w DOM wyłącznie przez
 * `document.createElement`/`textContent` (patrz `renderDocumentContent` poniżej), bez `innerHTML`
 * ani parsowania HTML w runtime.
 */

const BLOCK_TYPES = new Set(["heading", "paragraph", "list", "table"]);
const RUN_KEYS = new Set(["text", "bold", "italic", "code", "href", "break"]);

function fail(message) {
  throw new Error(`Bike Pilot formal render: ${message}`);
}

function validateRuns(runs, label) {
  if (!Array.isArray(runs)) {
    fail(`${label} must be an array of runs.`);
  }
  runs.forEach((run, index) => {
    if (!run || typeof run !== "object" || Array.isArray(run)) {
      fail(`${label}[${index}] must be an object.`);
    }
    Object.keys(run).forEach((key) => {
      if (!RUN_KEYS.has(key)) {
        fail(`${label}[${index}] has unknown key '${key}'.`);
      }
    });
    if (!run.break && typeof run.text !== "string") {
      fail(`${label}[${index}] requires a 'text' string unless 'break' is set.`);
    }
  });
}

function validateBlock(block, index) {
  const label = `blocks[${index}]`;
  if (!block || typeof block !== "object" || !BLOCK_TYPES.has(block.type)) {
    fail(`${label} has an unknown or missing 'type'.`);
  }

  switch (block.type) {
    case "heading":
      if (block.level !== 2 && block.level !== 3) {
        fail(`${label} (heading) requires 'level' to be 2 or 3.`);
      }
      if (typeof block.text !== "string") {
        fail(`${label} (heading) requires a 'text' string.`);
      }
      break;
    case "paragraph":
      validateRuns(block.runs, `${label}.runs`);
      break;
    case "list":
      if (typeof block.ordered !== "boolean") {
        fail(`${label} (list) requires a boolean 'ordered'.`);
      }
      if (!Array.isArray(block.items)) {
        fail(`${label} (list) requires an 'items' array.`);
      }
      block.items.forEach((item, itemIndex) => validateRuns(item, `${label}.items[${itemIndex}]`));
      break;
    case "table":
      if (!Array.isArray(block.headers) || !block.headers.every((header) => typeof header === "string")) {
        fail(`${label} (table) requires a 'headers' array of strings.`);
      }
      if (!Array.isArray(block.rows)) {
        fail(`${label} (table) requires a 'rows' array.`);
      }
      block.rows.forEach((row, rowIndex) => {
        if (!Array.isArray(row)) {
          fail(`${label}.rows[${rowIndex}] must be an array of cells.`);
        }
        row.forEach((cell, cellIndex) => validateRuns(cell, `${label}.rows[${rowIndex}][${cellIndex}]`));
      });
      break;
    default:
      break;
  }
}

/**
 * Waliduje model dokumentu formalnego (TASK-020). Zgłasza jawny błąd (fail-fast) przy nieznanym
 * `type`/kluczu `runs` lub brakującym wymaganym polu, zamiast cichego fallbacku.
 */
export function validateDocumentModel(payload) {
  if (!payload || typeof payload !== "object") {
    fail("document payload must be an object.");
  }
  if (typeof payload.title !== "string" || !payload.title) {
    fail("document payload is missing a required 'title' string.");
  }
  if (!Array.isArray(payload.blocks)) {
    fail("document payload is missing a required 'blocks' array.");
  }
  payload.blocks.forEach((block, index) => validateBlock(block, index));
  return payload;
}

function renderRunsInto(doc, container, runs = []) {
  runs.forEach((run) => {
    if (run.break) {
      container.appendChild(doc.createElement("br"));
      return;
    }

    let node = doc.createTextNode(run.text);
    if (run.code) {
      const code = doc.createElement("code");
      code.appendChild(node);
      node = code;
    }
    if (run.italic) {
      const em = doc.createElement("em");
      em.appendChild(node);
      node = em;
    }
    if (run.bold) {
      const strong = doc.createElement("strong");
      strong.appendChild(node);
      node = strong;
    }
    if (run.href) {
      const link = doc.createElement("a");
      link.setAttribute("href", run.href);
      link.appendChild(node);
      node = link;
    }
    container.appendChild(node);
  });
}

function renderBlock(doc, block) {
  switch (block.type) {
    case "heading": {
      const heading = doc.createElement(block.level === 3 ? "h3" : "h2");
      heading.textContent = block.text;
      return heading;
    }
    case "paragraph": {
      const paragraph = doc.createElement("p");
      renderRunsInto(doc, paragraph, block.runs);
      return paragraph;
    }
    case "list": {
      const list = doc.createElement(block.ordered ? "ol" : "ul");
      block.items.forEach((item) => {
        const listItem = doc.createElement("li");
        renderRunsInto(doc, listItem, item);
        list.appendChild(listItem);
      });
      return list;
    }
    case "table": {
      const table = doc.createElement("table");
      const thead = doc.createElement("thead");
      const headerRow = doc.createElement("tr");
      block.headers.forEach((headerText) => {
        const cell = doc.createElement("th");
        cell.textContent = headerText;
        headerRow.appendChild(cell);
      });
      thead.appendChild(headerRow);
      table.appendChild(thead);

      const tbody = doc.createElement("tbody");
      block.rows.forEach((row) => {
        const rowElement = doc.createElement("tr");
        row.forEach((cellRuns) => {
          const cell = doc.createElement("td");
          renderRunsInto(doc, cell, cellRuns);
          rowElement.appendChild(cell);
        });
        tbody.appendChild(rowElement);
      });
      table.appendChild(tbody);
      return table;
    }
    default:
      return fail(`unsupported block type '${block.type}'.`);
  }
}

/**
 * Buduje w `contentRoot` programowo DOM dokumentu formalnego z modelu `blocks[]`/`runs[]`
 * (TASK-021) — bez żadnego przypisania do `innerHTML` dla treści dokumentu.
 */
export function renderDocumentContent(doc, contentRoot, payload) {
  validateDocumentModel(payload);
  contentRoot.textContent = "";
  payload.blocks.forEach((block) => {
    contentRoot.appendChild(renderBlock(doc, block));
  });
  return contentRoot;
}

export async function fetchDocumentData(fetchImpl, baseUrl, docType, language) {
  const resolvedLanguage = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
  const requestUrl = new URL(`formal/${docType}/${resolvedLanguage}.json`, baseUrl).href;
  const response = await fetchImpl(requestUrl);

  if (!response.ok) {
    if (resolvedLanguage !== DEFAULT_LANGUAGE) {
      return fetchDocumentData(fetchImpl, baseUrl, docType, DEFAULT_LANGUAGE);
    }
    throw new Error(`Bike Pilot formal render: fetch failed for ${requestUrl}`);
  }

  return response.json();
}

export function injectDocumentContent(doc, payload) {
  const contentRoot = doc.querySelector("[data-doc-content]");
  if (!contentRoot) {
    throw new Error("Bike Pilot formal render: missing [data-doc-content] container.");
  }

  renderDocumentContent(doc, contentRoot, payload);
  const title = payload.title;
  doc.querySelectorAll("[data-doc-title]").forEach((element) => {
    element.textContent = title;
  });
  doc.title = `${title} — Bike Pilot`;
}

function renderFormalNavigation(doc) {
  const currentDoc = doc.body.dataset.docType;
  doc.querySelectorAll("[data-doc-link]").forEach((link) => {
    const isActive = link.getAttribute("data-doc-link") === currentDoc;
    if (isActive) {
      link.setAttribute("aria-current", "page");
      link.classList.add("is-active");
    } else {
      link.removeAttribute("aria-current");
      link.classList.remove("is-active");
    }
  });
}

export function renderLoadingState(doc, language) {
  const ui = getUiStrings(language);
  const contentRoot = doc.querySelector("[data-doc-content]");
  if (contentRoot) {
    contentRoot.innerHTML = `<p class="bp-feedback" role="status">${ui.loading}</p>`;
  }
}

export function renderErrorState(doc, language) {
  const ui = getUiStrings(language);
  const contentRoot = doc.querySelector("[data-doc-content]");
  if (contentRoot) {
    contentRoot.innerHTML = `
      <section class="bp-feedback" role="alert">
        <h2>${ui.errorTitle}</h2>
        <p>${ui.errorHint}</p>
      </section>
    `;
  }
}

export async function bootstrapFormalPage(win = window) {
  const doc = win.document;
  const baseUrl = new URL("../", import.meta.url);
  const select = doc.querySelector("[data-language-select]");
  const docType = doc.body.dataset.docType;
  const state = {
    activeLanguage: resolveSupportedLanguage(detectInitialLanguage({ doc, nav: win.navigator })) || DEFAULT_LANGUAGE,
  };

  if (!docType) {
    throw new Error("Bike Pilot formal render: missing body[data-doc-type].");
  }

  const loadLanguage = async (language, { persist = true } = {}) => {
    const nextLanguage = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
    state.activeLanguage = nextLanguage;
    setDocumentLanguage(doc, nextLanguage);
    updateSharedLabels(doc, nextLanguage);
    populateLanguageSelect(select, nextLanguage);
    renderFormalNavigation(doc);
    renderConsentBanner({
      doc,
      language: nextLanguage,
      onAccept: () => setLanguageCookie(state.activeLanguage, doc),
    });
    renderLoadingState(doc, nextLanguage);

    try {
      const payload = await fetchDocumentData(win.fetch.bind(win), baseUrl, docType, nextLanguage);
      injectDocumentContent(doc, payload);
      if (persist && hasConsent(doc)) {
        setLanguageCookie(nextLanguage, doc);
      }
    } catch (error) {
      console.error(error);
      renderErrorState(doc, nextLanguage);
    }
  };

  select?.addEventListener("change", (event) => {
    loadLanguage(event.target.value, { persist: true });
  });

  await loadLanguage(state.activeLanguage, { persist: false });
  return { loadLanguage, state };
}

/* c8 ignore start */
if (
  typeof window !== "undefined" &&
  typeof document !== "undefined" &&
  typeof process === "undefined" &&
  document.body?.dataset.pageKind === "formal"
) {
  const start = () => {
    bootstrapFormalPage(window).catch((error) => {
      console.error(error);
      renderErrorState(document, DEFAULT_LANGUAGE);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
/* c8 ignore stop */
