import { beforeEach, describe, expect, it } from "vitest";
import {
  CONSENT_COOKIE_NAME,
  DEFAULT_LANGUAGE,
  LANGUAGE_COOKIE_NAME,
  detectInitialLanguage,
  detectNavigatorLanguage,
  getLanguageCookie,
  grantConsent,
  hasConsent,
  resolveSupportedLanguage,
  setDocumentLanguage,
  setLanguageCookie,
} from "../../content/bike-pilot/js/language.js";

function createCookieDocument() {
  let visibleCookie = "";
  const writes = [];
  return {
    writes,
    get cookie() {
      return visibleCookie;
    },
    set cookie(value) {
      writes.push(value);
      const [pair] = value.split(";");
      const [name, cookieValue = ""] = pair.split("=");
      const entries = visibleCookie
        ? visibleCookie.split(/;\s*/).filter(Boolean).filter((item) => !item.startsWith(`${name}=`))
        : [];
      entries.push(`${name}=${cookieValue}`);
      visibleCookie = entries.join("; ");
    },
  };
}

describe("resolveSupportedLanguage", () => {
  it("matches supported tags exactly", () => {
    expect(resolveSupportedLanguage("pt-PT")).toBe("pt-PT");
    expect(resolveSupportedLanguage("ZH-hans")).toBe("zh-Hans");
  });

  it("matches supported tags by prefix when the region differs", () => {
    expect(resolveSupportedLanguage("pt-BR")).toBe("pt-PT");
    expect(resolveSupportedLanguage("zh-CN")).toBe("zh-Hans");
  });

  it("returns null for unsupported languages", () => {
    expect(resolveSupportedLanguage("fi-FI")).toBeNull();
  });
});

describe("detectNavigatorLanguage", () => {
  it("checks navigator.languages in order before falling back", () => {
    expect(
      detectNavigatorLanguage({
        languages: ["fi-FI", "de-DE", "en-GB"],
        language: "fi-FI",
      })
    ).toBe("de");
  });

  it("falls back to English when nothing matches", () => {
    expect(detectNavigatorLanguage({ languages: ["fi-FI"], language: "fi-FI" })).toBe(
      DEFAULT_LANGUAGE
    );
  });
});

describe("cookie helpers", () => {
  beforeEach(() => {
    document.documentElement.lang = "en";
    document.documentElement.dir = "ltr";
  });

  it("prefers a stored language cookie over navigator preferences", () => {
    const doc = createCookieDocument();
    grantConsent(doc);
    setLanguageCookie("de", doc);

    expect(
      detectInitialLanguage({
        doc,
        nav: { languages: ["pl-PL"], language: "pl-PL" },
      })
    ).toBe("de");
  });

  it("does not store the language cookie before consent", () => {
    const doc = createCookieDocument();
    expect(setLanguageCookie("pl", doc)).toBe(false);
    expect(doc.cookie).not.toContain(LANGUAGE_COOKIE_NAME);
  });

  it("stores consent and language cookies with persistent attributes", () => {
    const doc = createCookieDocument();

    grantConsent(doc);
    const stored = setLanguageCookie("de", doc);

    expect(stored).toBe(true);
    expect(hasConsent(doc)).toBe(true);
    expect(getLanguageCookie(doc)).toBe("de");
    expect(doc.writes[0]).toContain(`${CONSENT_COOKIE_NAME}=1`);
    expect(doc.writes[1]).toContain(`${LANGUAGE_COOKIE_NAME}=de`);
    expect(doc.writes[1]).toContain("Max-Age=31536000");
    expect(doc.writes[1]).toContain("Path=/");
    expect(doc.writes[1]).toContain("SameSite=Lax");
  });
});

describe("setDocumentLanguage", () => {
  it("applies lang and direction for RTL locales", () => {
    setDocumentLanguage(document, "ar");
    expect(document.documentElement.lang).toBe("ar");
    expect(document.documentElement.dir).toBe("rtl");
  });
});
