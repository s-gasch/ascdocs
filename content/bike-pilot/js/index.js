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
 * TASK-017 — niezależna strona marketingowa bike-pilot, reużywająca moduł i18n.
 */

export async function fetchMarketingContent(fetchImpl, baseUrl, language) {
  const resolvedLanguage = resolveSupportedLanguage(language) || DEFAULT_LANGUAGE;
  const requestUrl = new URL(`content/${resolvedLanguage}.json`, baseUrl).href;
  const response = await fetchImpl(requestUrl);

  if (!response.ok) {
    if (resolvedLanguage !== DEFAULT_LANGUAGE) {
      return fetchMarketingContent(fetchImpl, baseUrl, DEFAULT_LANGUAGE);
    }
    throw new Error(`Bike Pilot marketing render: fetch failed for ${requestUrl}`);
  }

  return response.json();
}

function renderSectionCards(items, className) {
  return items
    .map(
      (item) => `
        <article class="${className}">
          <div class="${className}__icon" aria-hidden="true">${item.icon}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        </article>
      `
    )
    .join("");
}

function renderTemplateCards(items) {
  return items
    .map(
      (item) => `
        <article class="bp-template-card">
          <div class="bp-template-card__visual bp-template-card__visual--${item.visual}">
            <span>${item.label}</span>
          </div>
          <h3>${item.title}</h3>
        </article>
      `
    )
    .join("");
}

export function renderMarketingContent(doc, payload) {
  const root = doc.querySelector("[data-marketing-content]");
  if (!root) {
    throw new Error("Bike Pilot marketing render: missing [data-marketing-content] container.");
  }

  root.innerHTML = `
    <section class="bp-hero" id="screens">
      <div class="bp-hero__content">
        <p class="bp-hero__eyebrow">${payload.hero.eyebrow}</p>
        <h1>${payload.hero.title[0]} <span>${payload.hero.title[1]}</span> ${payload.hero.title[2]}</h1>
        <p class="bp-hero__copy">${payload.hero.copy}</p>
        <div class="bp-hero__actions">
          <a class="bp-button bp-button--primary" href="#download">${payload.hero.primaryCta}</a>
          <a class="bp-button bp-button--secondary" href="#features">${payload.hero.secondaryCta}</a>
        </div>
        <div class="bp-benefit-grid">
          ${payload.hero.benefits
            .map(
              (item) => `
                <article class="bp-benefit-card">
                  <div class="bp-benefit-card__icon" aria-hidden="true">${item.icon}</div>
                  <h2>${item.title}</h2>
                  <p>${item.copy}</p>
                </article>
              `
            )
            .join("")}
        </div>
      </div>
      <div class="bp-hero__stage" aria-hidden="true">
        <div class="bp-phone bp-phone--left"><span>${payload.hero.mockLabels.left}</span></div>
        <div class="bp-phone bp-phone--center">
          <div class="bp-phone__badge">${payload.hero.mockLabels.centerTop}</div>
          <strong>${payload.hero.mockLabels.centerTitle}</strong>
          <small>${payload.hero.mockLabels.centerBottom}</small>
        </div>
        <div class="bp-phone bp-phone--right"><span>${payload.hero.mockLabels.right}</span></div>
      </div>
    </section>

    <section class="bp-section" id="templates">
      <div class="bp-section__heading">
        <p>${payload.templates.eyebrow}</p>
        <h2>${payload.templates.title}</h2>
        <p class="bp-section__description">${payload.templates.description}</p>
      </div>
      <div class="bp-template-grid">${renderTemplateCards(payload.templates.items)}</div>
    </section>

    <section class="bp-section" id="features">
      <div class="bp-section__heading">
        <p>${payload.features.eyebrow}</p>
        <h2>${payload.features.title}</h2>
        <p class="bp-section__description">${payload.features.description}</p>
      </div>
      <div class="bp-feature-grid">${renderSectionCards(payload.features.items, "bp-feature-card")}</div>
    </section>

    <section class="bp-cta" id="download">
      <div class="bp-cta__visual" aria-hidden="true">
        <div class="bp-cta__pulse"></div>
        <div class="bp-cta__device">${payload.cta.visualLabel}</div>
      </div>
      <div class="bp-cta__content">
        <p>${payload.cta.eyebrow}</p>
        <h2>${payload.cta.title}</h2>
        <p>${payload.cta.copy}</p>
        <a class="bp-button bp-button--primary" href="./support.html">${payload.cta.button}</a>
      </div>
    </section>
  `;

  doc.title = payload.meta.title;
  const metaDescription = doc.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", payload.meta.description);
  }

  doc.querySelectorAll("[data-site-link='features']").forEach((element) => {
    element.textContent = payload.navigation.features;
  });
  doc.querySelectorAll("[data-site-link='templates']").forEach((element) => {
    element.textContent = payload.navigation.templates;
  });
  doc.querySelectorAll("[data-site-link='screens']").forEach((element) => {
    element.textContent = payload.navigation.screens;
  });
  doc.querySelectorAll("[data-site-link='download']").forEach((element) => {
    element.textContent = payload.navigation.download;
  });
  doc.querySelectorAll("[data-site-link='about']").forEach((element) => {
    element.textContent = payload.navigation.about;
  });
  doc.querySelectorAll("[data-footer-tagline]").forEach((element) => {
    element.textContent = payload.footer.tagline;
  });
  doc.querySelectorAll("[data-footer-product-heading]").forEach((element) => {
    element.textContent = payload.footer.productHeading;
  });
  doc.querySelectorAll("[data-footer-support-heading]").forEach((element) => {
    element.textContent = payload.footer.supportHeading;
  });
  doc.querySelectorAll("[data-footer-contact]").forEach((element) => {
    element.textContent = payload.footer.contactLabel;
  });
}

function renderMarketingLoading(doc, language) {
  const ui = getUiStrings(language);
  const root = doc.querySelector("[data-marketing-content]");
  if (root) {
    root.innerHTML = `<section class="bp-loading" role="status">${ui.loading}</section>`;
  }
}

function renderMarketingError(doc, language) {
  const ui = getUiStrings(language);
  const root = doc.querySelector("[data-marketing-content]");
  if (root) {
    root.innerHTML = `
      <section class="bp-loading" role="alert">
        <h1>${ui.errorTitle}</h1>
        <p>${ui.errorHint}</p>
      </section>
    `;
  }
}

export async function bootstrapMarketingPage(win = window) {
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
    renderMarketingLoading(doc, nextLanguage);

    try {
      const payload = await fetchMarketingContent(win.fetch.bind(win), baseUrl, nextLanguage);
      renderMarketingContent(doc, payload);
      if (persist && hasConsent(doc)) {
        setLanguageCookie(nextLanguage, doc);
      }
    } catch (error) {
      console.error(error);
      renderMarketingError(doc, nextLanguage);
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
  document.body?.dataset.pageKind === "marketing"
) {
  const start = () => {
    bootstrapMarketingPage(window).catch((error) => {
      console.error(error);
      renderMarketingError(document, DEFAULT_LANGUAGE);
    });
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
}
/* c8 ignore stop */
