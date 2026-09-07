import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  bootstrapFormalPage,
  fetchDocumentData,
  injectDocumentContent,
  renderDocumentContent,
  validateDocumentModel,
} from "../../content/bike-pilot/js/formal.js";

function response(ok, payload) {
  return {
    ok,
    json: async () => payload,
  };
}

const paragraphDoc = {
  title: "Support",
  version: "1.0",
  blocks: [{ type: "paragraph", runs: [{ text: "Hello" }] }],
};

describe("fetchDocumentData", () => {
  it("loads the requested language JSON payload", async () => {
    const payload = { title: "Polityka", blocks: [{ type: "paragraph", runs: [{ text: "Treść" }] }] };
    const fetchImpl = vi.fn().mockResolvedValue(response(true, payload));

    await expect(
      fetchDocumentData(fetchImpl, "https://example.test/content/bike-pilot/", "privacy-policy", "pl")
    ).resolves.toEqual(payload);

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://example.test/content/bike-pilot/formal/privacy-policy/pl.json"
    );
  });

  it("falls back to English when a language JSON file is missing", async () => {
    const fallbackPayload = { title: "Privacy Policy", blocks: [{ type: "paragraph", runs: [{ text: "Fallback" }] }] };
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false })
      .mockResolvedValueOnce(response(true, fallbackPayload));

    await expect(
      fetchDocumentData(fetchImpl, "https://example.test/content/bike-pilot/", "privacy-policy", "pl")
    ).resolves.toEqual(fallbackPayload);

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

describe("validateDocumentModel (TASK-020)", () => {
  it("accepts a well-formed document covering every block/run type", () => {
    const doc = {
      title: "Sample",
      version: "1.0",
      blocks: [
        { type: "heading", level: 2, text: "Intro" },
        { type: "heading", level: 3, text: "Sub" },
        {
          type: "paragraph",
          runs: [
            { text: "Plain " },
            { text: "bold", bold: true },
            { text: " italic", italic: true },
            { text: " code", code: true },
            { text: "link", href: "https://example.test" },
            { break: true },
            { text: "after break" },
          ],
        },
        { type: "list", ordered: false, items: [[{ text: "one" }], [{ text: "two" }]] },
        {
          type: "table",
          headers: ["A", "B"],
          rows: [[[{ text: "a1" }], [{ text: "b1", bold: true }]]],
        },
      ],
    };

    expect(() => validateDocumentModel(doc)).not.toThrow();
  });

  it("rejects a document with a missing title", () => {
    expect(() => validateDocumentModel({ blocks: [] })).toThrow(/title/);
  });

  it("rejects a document with a missing version", () => {
    expect(() => validateDocumentModel({ title: "X", blocks: [] })).toThrow(/version/);
  });

  it("rejects a document with an invalid version format", () => {
    expect(() => validateDocumentModel({ title: "X", version: "1", blocks: [] })).toThrow(/version/);
    expect(() => validateDocumentModel({ title: "X", version: "v1.0", blocks: [] })).toThrow(/version/);
  });

  it("rejects a document with a missing blocks array", () => {
    expect(() => validateDocumentModel({ title: "X", version: "1.0" })).toThrow(/blocks/);
  });

  it("rejects a block with an unknown type", () => {
    expect(() => validateDocumentModel({ title: "X", version: "1.0", blocks: [{ type: "quote" }] })).toThrow(/type/);
  });

  it("rejects a heading with an invalid level", () => {
    expect(() =>
      validateDocumentModel({ title: "X", version: "1.0", blocks: [{ type: "heading", level: 4, text: "Y" }] })
    ).toThrow(/level/);
  });

  it("rejects a paragraph whose runs is not an array", () => {
    expect(() =>
      validateDocumentModel({ title: "X", version: "1.0", blocks: [{ type: "paragraph", runs: "oops" }] })
    ).toThrow(/runs/);
  });

  it("rejects a run with an unknown key", () => {
    expect(() =>
      validateDocumentModel({
        title: "X",
        version: "1.0",
        blocks: [{ type: "paragraph", runs: [{ text: "a", unknown: true }] }],
      })
    ).toThrow(/unknown key/);
  });

  it("rejects a run without text and without break", () => {
    expect(() =>
      validateDocumentModel({ title: "X", version: "1.0", blocks: [{ type: "paragraph", runs: [{ bold: true }] }] })
    ).toThrow(/requires a 'text' string/);
  });

  it("rejects a list without a boolean 'ordered'", () => {
    expect(() =>
      validateDocumentModel({ title: "X", version: "1.0", blocks: [{ type: "list", items: [] }] })
    ).toThrow(/ordered/);
  });

  it("rejects a table with non-string headers", () => {
    expect(() =>
      validateDocumentModel({ title: "X", version: "1.0", blocks: [{ type: "table", headers: [1], rows: [] }] })
    ).toThrow(/headers/);
  });
});

describe("renderDocumentContent (TASK-021)", () => {
  it("renders headings, paragraphs, lists and tables as DOM without using innerHTML for content", () => {
    document.body.innerHTML = `<main data-doc-content></main>`;
    const contentRoot = document.querySelector("[data-doc-content]");

    renderDocumentContent(document, contentRoot, {
      title: "Doc",
      version: "1.0",
      blocks: [
        { type: "heading", level: 2, text: "Section" },
        {
          type: "paragraph",
          runs: [
            { text: "Contact " },
            { text: "Email:", bold: true },
            { break: true },
            { text: "user@example.test", href: "mailto:user@example.test" },
          ],
        },
        { type: "list", ordered: true, items: [[{ text: "First" }], [{ text: "Second" }]] },
        {
          type: "table",
          headers: ["Col A", "Col B"],
          rows: [[[{ text: "1" }], [{ text: "2", italic: true }]]],
        },
      ],
    });

    expect(contentRoot.querySelector("h2").textContent).toBe("Section");
    const paragraph = contentRoot.querySelector("p");
    expect(paragraph.querySelector("strong").textContent).toBe("Email:");
    expect(paragraph.querySelector("br")).not.toBeNull();
    const link = paragraph.querySelector("a");
    expect(link.getAttribute("href")).toBe("mailto:user@example.test");
    expect(link.textContent).toBe("user@example.test");

    const list = contentRoot.querySelector("ol");
    expect(Array.from(list.querySelectorAll("li")).map((li) => li.textContent)).toEqual(["First", "Second"]);

    const table = contentRoot.querySelector("table");
    expect(Array.from(table.querySelectorAll("thead th")).map((th) => th.textContent)).toEqual(["Col A", "Col B"]);
    expect(table.querySelector("tbody td em").textContent).toBe("2");
  });

  it("throws for an invalid document instead of silently rendering nothing", () => {
    document.body.innerHTML = `<main data-doc-content></main>`;
    const contentRoot = document.querySelector("[data-doc-content]");

    expect(() => renderDocumentContent(document, contentRoot, { title: "Doc", version: "1.0", blocks: [{ type: "bogus" }] })).toThrow();
  });
});

describe("injectDocumentContent (TASK-025 version rendering)", () => {
  it("writes title, renders block content, sets document title and renders version label", () => {
    document.body.innerHTML = `
      <section>
        <h1 data-doc-title>Old title</h1>
        <main data-doc-content></main>
        <p data-doc-version></p>
      </section>
    `;

    injectDocumentContent(document, paragraphDoc, "en");

    expect(document.querySelector("[data-doc-title]").textContent).toBe("Support");
    expect(document.querySelector("[data-doc-content] p").textContent).toBe("Hello");
    expect(document.title).toBe("Support — Bike Pilot");
    expect(document.querySelector("[data-doc-version]").textContent).toBe("Version 1.0");
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
        <label><span class="sr-only" data-language-label>Language</span><select data-language-select></select></label>
        <p data-formal-kicker></p>
        <p data-formal-summary></p>
        <h1 data-doc-title></h1>
        <main data-doc-content></main>
        <p data-doc-version></p>
        <div data-consent-root></div>
      </div>
    `;
  });

  it("renders the detected language and reloads content on selector change without reloading the page", async () => {
    const fetchImpl = vi.fn((url) => {
      if (String(url).endsWith("/de.json")) {
        return Promise.resolve(
          response(true, {
            title: "Datenschutzerklärung",
            version: "1.0",
            blocks: [{ type: "paragraph", runs: [{ text: "DE" }] }],
          })
        );
      }
      if (String(url).endsWith("/pl.json")) {
        return Promise.resolve(
          response(true, {
            title: "Polityka prywatności",
            version: "1.0",
            blocks: [{ type: "paragraph", runs: [{ text: "PL" }] }],
          })
        );
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
    expect(document.querySelector("[data-doc-content] p").textContent).toBe("DE");
    expect(document.querySelector("[data-doc-version]").textContent).toBe("Version 1.0");

    await controller.loadLanguage("pl", { persist: false });
    expect(document.querySelector("[data-doc-title]").textContent).toBe("Polityka prywatności");
    expect(document.querySelector("[data-doc-content] p").textContent).toBe("PL");
    expect(document.querySelector("[data-doc-version]").textContent).toBe("Wersja 1.0");
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
});
