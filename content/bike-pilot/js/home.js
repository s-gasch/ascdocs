import {
  DEFAULT_LANGUAGE,
  detectInitialLanguage,
  resolveSupportedLanguage,
  setDocumentLanguage,
  populateLanguageSelect,
  updateSharedLabels,
  setLanguageCookie,
  hasConsent,
  renderConsentBanner,
} from "./language.js";

// Renders home page copy (data-i18n / data-i18n-attr hooks) from www/index/<lang>.json.

function getPath(data, path) {
  return path.split(".").reduce((value, key) => (value == null ? undefined : value[key]), data);
}

function applyTranslations(doc, data) {
  doc.querySelectorAll("[data-i18n]").forEach((element) => {
    const value = getPath(data, element.getAttribute("data-i18n"));
    if (typeof value === "string") {
      element.textContent = value;
    }
  });

  doc.querySelectorAll("[data-i18n-attr]").forEach((element) => {
    const [attr, path] = element.getAttribute("data-i18n-attr").split(":");
    const value = getPath(data, path);
    if (typeof value === "string") {
      element.setAttribute(attr, value);
    }
  });

  if (typeof data.title === "string") {
    doc.title = data.title;
  }
  if (typeof data.description === "string") {
    doc.querySelector('meta[name="description"]')?.setAttribute("content", data.description);
  }
}

async function fetchHomeData(fetchImpl, baseUrl, language) {
  const resolvedLanguage = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
  const requestUrl = new URL(`www/index/${resolvedLanguage}.json`, baseUrl).href;
  const response = await fetchImpl(requestUrl);

  if (!response.ok) {
    if (resolvedLanguage !== DEFAULT_LANGUAGE) {
      return fetchHomeData(fetchImpl, baseUrl, DEFAULT_LANGUAGE);
    }
    throw new Error(`Bike Pilot home render: fetch failed for ${requestUrl}`);
  }

  return response.json();
}

export async function bootstrapHomePage(win = window) {
  const doc = win.document;
  const baseUrl = new URL("../", import.meta.url);
  const select = doc.querySelector("[data-language-select]");
  const state = {
    activeLanguage: resolveSupportedLanguage(detectInitialLanguage({ doc, nav: win.navigator })) || DEFAULT_LANGUAGE,
  };

  const loadLanguage = async (language, { persist = true } = {}) => {
    const nextLanguage = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
    state.activeLanguage = nextLanguage;
    setDocumentLanguage(doc, nextLanguage);
    updateSharedLabels(doc, nextLanguage);
    populateLanguageSelect(select, nextLanguage);
    renderConsentBanner({
      doc,
      language: nextLanguage,
      onAccept: () => setLanguageCookie(state.activeLanguage, doc),
    });

    try {
      const data = await fetchHomeData(win.fetch.bind(win), baseUrl, nextLanguage);
      applyTranslations(doc, data);
      if (persist && hasConsent(doc)) {
        setLanguageCookie(nextLanguage, doc);
      }
    } catch (error) {
      console.error(error);
    }
  };

  select?.addEventListener("change", (event) => {
    loadLanguage(event.target.value, { persist: true });
  });

  await loadLanguage(state.activeLanguage, { persist: false });
  return { loadLanguage, state };
}

/* c8 ignore start */
if (typeof window !== "undefined" && typeof document !== "undefined" && typeof process === "undefined") {
  const start = () => {
    bootstrapHomePage(window).catch((error) => console.error(error));
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
/* c8 ignore stop */
