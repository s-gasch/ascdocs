import { describe, it, expect, vi } from "vitest";
import {
  extractDocContent,
  resolveBasePaths,
  resourceExists,
  resolveTemplate,
  composeDocument,
} from "../../content/common/js/render.js";

function makeDoc(bodyHtml) {
  document.body.innerHTML = bodyHtml;
  return document;
}

describe("extractDocContent", () => {
  it("odczytuje treść i tytuł z kontenera doc-content", () => {
    const doc = makeDoc(
      '<template id="doc-content" data-doc-title="Privacy Policy"><h1>Hi</h1></template>'
    );
    const result = extractDocContent(doc);
    expect(result.title).toBe("Privacy Policy");
    expect(result.html).toContain("<h1>Hi</h1>");
  });

  it("rzuca jawny błąd, gdy kontener treści nie istnieje", () => {
    const doc = makeDoc("<p>brak kontenera</p>");
    expect(() => extractDocContent(doc)).toThrowError(/brak wymaganego kontenera/);
  });

  it("rzuca błąd, gdy element o tym id nie jest <template>", () => {
    const doc = makeDoc('<div id="doc-content">źle</div>');
    expect(() => extractDocContent(doc)).toThrowError(/brak wymaganego kontenera/);
  });
});

describe("resolveBasePaths", () => {
  it("wyprowadza commonBase, appBase i appName ze struktury content/<app>/<lang>/<doc>.html", () => {
    const moduleUrl = "https://example.test/content/common/js/render.js";
    const pageUrl = "https://example.test/content/sample-app/en/privacy-policy.html";
    const { commonBase, appBase, appName } = resolveBasePaths(moduleUrl, pageUrl);
    expect(commonBase).toBe("https://example.test/content/common/");
    expect(appBase).toBe("https://example.test/content/sample-app/");
    expect(appName).toBe("sample-app");
  });
});

describe("resourceExists", () => {
  it("zwraca true, gdy fetch zwraca ok", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    await expect(resourceExists(fetchImpl, "https://x/y")).resolves.toBe(true);
  });

  it("zwraca false, gdy fetch zwraca błąd HTTP (ok=false)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    await expect(resourceExists(fetchImpl, "https://x/y")).resolves.toBe(false);
  });

  it("zwraca false (nie rzuca), gdy fetch rzuca błąd sieciowy", async () => {
    const fetchImpl = vi.fn().mockRejectedValue(new Error("network down"));
    await expect(resourceExists(fetchImpl, "https://x/y")).resolves.toBe(false);
  });
});

describe("resolveTemplate", () => {
  const commonBase = "https://example.test/content/common/";
  const appBase = "https://example.test/content/sample-app/";

  it("używa szablonu aplikacji, gdy template.html istnieje (REQ-005)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: true });
    const result = await resolveTemplate(fetchImpl, commonBase, appBase);
    expect(result.source).toBe("app");
    expect(result.templateUrl).toBe(
      "https://example.test/content/sample-app/template/template.html"
    );
  });

  it("używa szablonu bazowego, gdy template.html aplikacji nie istnieje (REQ-006)", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false });
    const result = await resolveTemplate(fetchImpl, commonBase, appBase);
    expect(result.source).toBe("common");
    expect(result.templateUrl).toBe("https://example.test/content/common/templates/base.html");
  });
});

describe("composeDocument", () => {
  const templateHtml =
    '<header><span data-doc-app-name></span></header>' +
    '<main><h1 data-doc-title></h1><div data-doc-slot></div></main>' +
    '<nav><a data-doc-nav="privacy-policy" href="privacy-policy.html">PP</a>' +
    '<a data-doc-nav="support" href="support.html">Support</a></nav>' +
    '<footer><span data-doc-year></span></footer>';

  it("wstawia treść do slotu i wypełnia atrybuty pomocnicze", () => {
    document.body.innerHTML = "";
    const wrapper = composeDocument(
      document,
      templateHtml,
      { html: "<p>Treść</p>", title: "Privacy Policy" },
      { appName: "sample-app", docId: "privacy-policy" }
    );
    expect(wrapper.querySelector("[data-doc-slot]").innerHTML).toBe("<p>Treść</p>");
    expect(wrapper.querySelector("[data-doc-title]").textContent).toBe("Privacy Policy");
    expect(wrapper.querySelector("[data-doc-app-name]").textContent).toBe("sample-app");
    expect(wrapper.querySelector("[data-doc-year]").textContent).toBe(
      String(new Date().getFullYear())
    );
  });

  it("oznacza aktywny link nawigacji odpowiadający bieżącemu dokumentowi", () => {
    const wrapper = composeDocument(
      document,
      templateHtml,
      { html: "<p>Treść</p>", title: "Support" },
      { appName: "sample-app", docId: "support" }
    );
    const activeLink = wrapper.querySelector('[data-doc-nav="support"]');
    const inactiveLink = wrapper.querySelector('[data-doc-nav="privacy-policy"]');
    expect(activeLink.getAttribute("aria-current")).toBe("page");
    expect(inactiveLink.getAttribute("aria-current")).toBeNull();
  });

  it("rzuca jawny błąd, gdy szablon nie zawiera slotu [data-doc-slot]", () => {
    expect(() =>
      composeDocument(
        document,
        "<div>brak slotu</div>",
        { html: "<p>x</p>", title: "t" },
        { appName: "a", docId: "d" }
      )
    ).toThrowError(/wymaganego slotu/);
  });
});
