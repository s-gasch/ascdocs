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
 * TASK-011/TASK-013 — renderowanie JSON → HTML dla dokumentów formalnych bike-pilot.
 */

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

  const title = payload?.title || "Bike Pilot";
  contentRoot.innerHTML = payload?.html || "";
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
