import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bootstrapFormalPage,
  fetchDocumentData,
  injectDocumentContent,
} from "../../content/bike-pilot/js/formal.js";

function response(ok, payload) {
  return {
    ok,
    json: async () => payload,
  };
}

describe("fetchDocumentData", () => {
  it("loads the requested language JSON payload", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(response(true, { title: "Polityka", html: "<p>Treść</p>" }));

    await expect(
      fetchDocumentData(fetchImpl, "https://example.test/content/bike-pilot/", "privacy-policy", "pl")
    ).resolves.toEqual({ title: "Polityka", html: "<p>Treść</p>" });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.test/content/bike-pilot/formal/privacy-policy/pl.json"
    );
  });

  it("falls back to English when a language JSON file is missing", async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(response(true, { title: "Privacy Policy", html: "<p>Fallback</p>" }));

    await expect(
      fetchDocumentData(fetchImpl, "https://example.test/content/bike-pilot/", "privacy-policy", "pl")
    ).resolves.toEqual({ title: "Privacy Policy", html: "<p>Fallback</p>" });

    expect(fetchImpl).toHaveBeenNthCalledWith(
      1,
      "https://example.test/content/bike-pilot/formal/privacy-policy/pl.json"
    );
    expect(fetchImpl).toHaveBeenNthCalledWith(
      2,
      "https://example.test/content/bike-pilot/formal/privacy-policy/en.json"
    );
  });
});

describe("injectDocumentContent", () => {
  it("writes title, inner HTML and document title", () => {
    document.body.innerHTML = `
      <section>
        <h1 data-doc-title>Old title</h1>
        <main data-doc-content></main>
      </section>
    `;

    injectDocumentContent(document, { title: "Support", html: "<p>Hello</p>" });

    expect(document.querySelector("[data-doc-title]").textContent).toBe("Support");
    expect(document.querySelector("[data-doc-content]").innerHTML).toBe("<p>Hello</p>");
    expect(document.title).toBe("Support — Bike Pilot");
  });
});

describe("bootstrapFormalPage", () => {
  beforeEach(() => {
    document.body.dataset.pageKind = "formal";
    document.body.dataset.docType = "privacy-policy";
    document.body.innerHTML = `
      <div>
        <nav>
          <a href="./privacy-policy.html" data-doc-link="privacy-policy" data-nav-privacy>Privacy Policy</a>
          <a href="./terms-of-use.html" data-doc-link="terms-of-use" data-nav-terms>Terms of Use</a>
        </nav>
        <label><span data-language-label>Language</span><select data-language-select></select></label>
        <p data-formal-kicker></p>
        <p data-formal-summary></p>
        <h1 data-doc-title></h1>
        <main data-doc-content></main>
        <div data-consent-root></div>
      </div>
    `;
  });

  it("renders the detected language and reloads content on selector change without reloading the page", async () => {
    const fetchImpl = vi.fn((url) => {
      if (String(url).endsWith("/de.json")) {
        return Promise.resolve(response(true, { title: "Datenschutzerklärung", html: "<p>DE</p>" }));
      }
      if (String(url).endsWith("/pl.json")) {
        return Promise.resolve(response(true, { title: "Polityka prywatności", html: "<p>PL</p>" }));
      }
      return Promise.resolve({ ok: false, json: async () => ({}) });
    });

    const win = {
      document,
      navigator: { languages: ["de-DE"], language: "de-DE" },
      fetch: fetchImpl,
    };

    const controller = await bootstrapFormalPage(win);
    expect(document.querySelector("[data-language-select]").value).toBe("de");
    expect(document.querySelector("[data-doc-title]").textContent).toBe("Datenschutzerklärung");
    expect(document.querySelector("[data-doc-content]").innerHTML).toBe("<p>DE</p>");

    await controller.loadLanguage("pl", { persist: false });
    expect(document.querySelector("[data-doc-title]").textContent).toBe("Polityka prywatności");
    expect(document.querySelector("[data-doc-content]").innerHTML).toBe("<p>PL</p>");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
