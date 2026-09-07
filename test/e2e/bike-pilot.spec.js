import fs from "node:fs";
import path from "node:path";
import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROOT = process.cwd();
const BIKE_PILOT_ROOT = path.join(ROOT, "content", "bike-pilot");
const LANGUAGES = [
  "ar",
  "cs",
  "da",
  "de",
  "en",
  "es",
  "fr",
  "it",
  "ja",
  "ko",
  "nb",
  "nl",
  "pl",
  "pt-PT",
  "ru",
  "sv",
  "tr",
  "uk",
  "zh-Hans",
];
const FORMAL_DOCS = ["privacy-policy", "terms-of-use", "support"];
const PAGE_PATHS = [
  "/content/bike-pilot/privacy-policy.html",
  "/content/bike-pilot/terms-of-use.html",
  "/content/bike-pilot/support.html",
  "/content/bike-pilot/index.html",
];
const LOCALE_OVERRIDES = {
  ar: "ar-EG",
  cs: "cs-CZ",
  da: "da-DK",
  de: "de-DE",
  en: "en-US",
  es: "es-ES",
  fr: "fr-FR",
  it: "it-IT",
  ja: "ja-JP",
  ko: "ko-KR",
  nb: "nb-NO",
  nl: "nl-NL",
  pl: "pl-PL",
  "pt-PT": "pt-PT",
  ru: "ru-RU",
  sv: "sv-SE",
  tr: "tr-TR",
  uk: "uk-UA",
  "zh-Hans": "zh-CN",
};

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(BIKE_PILOT_ROOT, relativePath), "utf8"));
}

const formalPayloads = Object.fromEntries(
  FORMAL_DOCS.flatMap((docType) =>
    LANGUAGES.map((language) => [
      `${docType}:${language}`,
      readJson(path.join("formal", docType, `${language}.json`)),
    ])
  )
);
const marketingPayloads = Object.fromEntries(
  LANGUAGES.map((language) => [language, readJson(path.join("content", `${language}.json`))])
);

async function newPageWithLocale(browser, language) {
  const context = await browser.newContext({ locale: LOCALE_OVERRIDES[language] || "en-US" });
  const page = await context.newPage();
  const consoleErrors = [];
  page.on("console", (message) => {
    if (message.type() === "error") {
      consoleErrors.push(message.text());
    }
  });
  page.on("pageerror", (error) => consoleErrors.push(String(error)));
  return { context, page, consoleErrors };
}

function expectNoConsoleErrors(consoleErrors) {
  expect(consoleErrors, `Console errors: ${consoleErrors.join("; ")}`).toEqual([]);
}

async function expectFormalLanguage(page, docType, language) {
  const payload = formalPayloads[`${docType}:${language}`];
  await expect(page.locator("[data-language-select]")).toHaveValue(language);
  await expect(page.locator("h1[data-doc-title]")).toHaveText(payload.title);
  await expect(page.locator("[data-doc-content]"), `${docType}:${language}`).not.toBeEmpty();
}

test.describe("TASK-019 — bike-pilot formal pages render every supported language", () => {
  for (const docType of FORMAL_DOCS) {
    for (const language of LANGUAGES) {
      test(`${docType} renders ${language} without reloading the page`, async ({ browser }) => {
        const { context, page, consoleErrors } = await newPageWithLocale(browser, language);
        try {
          const response = await page.goto(`/content/bike-pilot/${docType}.html`);
          expect(response?.ok()).toBe(true);
          await expectFormalLanguage(page, docType, language);
          await expect(page.locator("[data-consent-root] .bp-consent__button")).toBeVisible();
          expectNoConsoleErrors(consoleErrors);
        } finally {
          await context.close();
        }
      });
    }
  }

  for (const language of LANGUAGES) {
    test(`marketing page renders ${language}`, async ({ browser }) => {
      const { context, page, consoleErrors } = await newPageWithLocale(browser, language);
      try {
        const response = await page.goto("/content/bike-pilot/index.html");
        expect(response?.ok()).toBe(true);
        const payload = marketingPayloads[language];
        await expect(page.locator("[data-language-select]")).toHaveValue(language);
        await expect(page).toHaveTitle(payload.meta.title);
        await expect(page.locator("#screens h1")).toContainText(payload.hero.title[1]);
        await expect(page.locator("[data-consent-root] .bp-consent__button")).toBeVisible();
        expectNoConsoleErrors(consoleErrors);
      } finally {
        await context.close();
      }
    });
  }
});

test("language switcher updates formal content without a full page reload", async ({ page }) => {
  const response = await page.goto("/content/bike-pilot/privacy-policy.html");
  expect(response?.ok()).toBe(true);
  await expect(page.locator("h1[data-doc-title]")).toHaveText(formalPayloads["privacy-policy:en"].title);

  await page.selectOption("[data-language-select]", "pl");
  await expect(page.locator("h1[data-doc-title]")).toHaveText(
    formalPayloads["privacy-policy:pl"].title
  );
  const navigationEntries = await page.evaluate(() => performance.getEntriesByType("navigation").length);
  expect(navigationEntries).toBe(1);
});

test("cookie consent blocks language persistence before acceptance and shares consent across pages", async ({ page }) => {
  await page.goto("/content/bike-pilot/index.html");
  await expect(page.locator("[data-consent-root] .bp-consent__button")).toBeVisible();

  await page.selectOption("[data-language-select]", "de");
  await expect(page.locator("[data-language-select]")).toHaveValue("de");
  expect(await page.evaluate(() => document.cookie)).not.toContain("bp_lang=");

  await page.click("[data-consent-accept]");
  await expect(page.locator("[data-consent-root] .bp-consent__button")).toHaveCount(0);
  const cookiesAfterConsent = await page.evaluate(() => document.cookie);
  expect(cookiesAfterConsent).toContain("bp_consent=1");
  expect(cookiesAfterConsent).toContain("bp_lang=de");

  await page.goto("/content/bike-pilot/support.html");
  await expect(page.locator("[data-consent-root] .bp-consent__button")).toHaveCount(0);
  await expect(page.locator("[data-language-select]")).toHaveValue("de");
});

test("cookie banner appears on each page before consent", async ({ browser }) => {
  for (const pagePath of PAGE_PATHS) {
    const { context, page } = await newPageWithLocale(browser, "en");
    try {
      await page.goto(pagePath);
      await expect(page.locator("[data-consent-root] .bp-consent__button")).toBeVisible();
    } finally {
      await context.close();
    }
  }
});

test.describe("axe-core: no A/AA violations on the new bike-pilot pages", () => {
  for (const pagePath of PAGE_PATHS) {
    test(`${pagePath} has no accessibility violations`, async ({ page }) => {
      await page.goto(pagePath);
      if (pagePath.endsWith("index.html")) {
        await expect(page.locator("#screens h1")).toBeVisible();
      } else {
        await expect(page.locator("h1[data-doc-title]")).not.toBeEmpty();
      }

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  }
});
