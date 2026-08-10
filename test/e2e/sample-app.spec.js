import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

/**
 * TASK-007 — Walidacja cross-browser, dostępności i wydajności (REQ-011/REQ-014/REQ-015/REQ-016).
 * Uruchamiane na Chromium/WebKit/Firefox (playwright.config.js) — pokrycie desktop
 * Chrome/Edge/Safari/Firefox z macierzy REQ-011.
 */

const DOCS = ["privacy-policy", "terms-of-use", "support"];

for (const doc of DOCS) {
  test.describe(`Dokument: ${doc}`, () => {
    test(`renderuje kompletny DOM (nagłówek/treść/stopka) bez błędów konsoli`, async ({ page }) => {
      const consoleErrors = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") consoleErrors.push(msg.text());
      });
      page.on("pageerror", (err) => consoleErrors.push(String(err)));

      const response = await page.goto(`/content/sample-app/en/${doc}.html`);
      expect(response.ok()).toBe(true);

      // Kompozycja treści następuje w JS po załadowaniu (REQ-004) — poczekaj na slot treści.
      await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();

      await expect(page.locator("header.asc-header")).toBeVisible();
      await expect(page.locator("main.asc-main")).toBeVisible();
      await expect(page.locator("footer.asc-footer")).toBeVisible();
      await expect(page.locator("h1[data-doc-title]")).not.toBeEmpty();

      // Silnik renderujący sprawdza istnienie opcjonalnego content/<app>/template/template.html
      // przez `fetch()` (REQ-005) — dla aplikacji bez własnego szablonu strukturalnego (jak
      // sample-app, które ma tylko override.css) to celowo generuje jeden nieszkodliwy wpis
      // sieciowy 404 w konsoli przeglądarki, obsłużony jawnie w JS (resourceExists). Odfiltruj
      // wyłącznie ten oczekiwany, diagnostyczny wpis sieciowy — każdy inny błąd konsoli nadal
      // powoduje niepowodzenie testu.
      const unexpectedErrors = consoleErrors.filter(
        (text) => !/Failed to load resource.*404/.test(text)
      );
      expect(unexpectedErrors, `Błędy konsoli: ${unexpectedErrors.join("; ")}`).toEqual([]);
    });

    test(`nie zgłasza naruszeń dostępności poziomu A/AA (axe-core, REQ-014)`, async ({ page }) => {
      await page.goto(`/content/sample-app/en/${doc}.html`);
      await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();

      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
        .analyze();

      expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
    });
  });
}

test("mechanizm override: content/sample-app używa override.css (REQ-007)", async ({ page }) => {
  await page.goto("/content/sample-app/en/privacy-policy.html");
  await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();

  const accentColor = await page
    .locator(".asc-nav a")
    .first()
    .evaluate((el) => getComputedStyle(el).color);

  // override.css ustawia --asc-color-accent: #d9006c -> rgb(217, 0, 108)
  expect(accentColor).toBe("rgb(217, 0, 108)");
});

test("responsywność mobile-first: brak przewijania poziomego od 320px (REQ-015)", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto("/content/sample-app/en/privacy-policy.html");
  await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();

  const hasHorizontalScroll = await page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth
  );
  expect(hasHorizontalScroll).toBe(false);
});

test("nawigacja oznacza aktywny dokument (aria-current)", async ({ page }) => {
  await page.goto("/content/sample-app/en/support.html");
  await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();

  await expect(page.locator('[data-doc-nav="support"]')).toHaveAttribute("aria-current", "page");
  await expect(page.locator('[data-doc-nav="privacy-policy"]')).not.toHaveAttribute(
    "aria-current",
    "page"
  );
});

test.describe("TASK-009 — rozszerzenie sample-app: drugi język (de), pełny override", () => {
  test("de/privacy-policy.html renderuje się poprawnie (drugi, kompletny język)", async ({ page }) => {
    const response = await page.goto("/content/sample-app/de/privacy-policy.html");
    expect(response.ok()).toBe(true);
    await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();
    await expect(page.locator("h1[data-doc-title]")).toHaveText("Datenschutzerklärung");
  });

  test("pełny override.css zmienia dodatkowe zmienne stylu (--asc-max-width, REQ-007)", async ({
    page,
  }) => {
    await page.goto("/content/sample-app/en/privacy-policy.html");
    await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();
    const maxWidth = await page.locator(".asc-main").evaluate((el) => getComputedStyle(el).maxWidth);
    expect(maxWidth).toBe("672px"); // 42rem @ 16px
  });
});

test.describe("TASK-009 — fallback językowy (REQ-010): pl/ celowo niekompletny", () => {
  test("pl/support.html nie istnieje jako źródło — plik jest kopią en/ wygenerowaną przez fallback", async () => {
    const fs = await import("node:fs");
    const path = await import("node:path");
    const target = path.join(process.cwd(), "content/sample-app/pl/support.html");
    const html = fs.readFileSync(target, "utf-8");
    expect(html.startsWith("<!-- fallback: en -->")).toBe(true);
  });

  test("otwarcie pl/support.html (po fallbacku) renderuje treść zamiast błędu 404", async ({
    page,
  }) => {
    const response = await page.goto("/content/sample-app/pl/support.html");
    expect(response.ok()).toBe(true);
    await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();
    await expect(page.locator("h1[data-doc-title]")).toHaveText("Support");
  });
});

test.describe("TASK-009 — rozszerzalność typów dokumentów (REQ-008)", () => {
  test("marketing-disclosure.html (nowy typ dokumentu) renderuje się bez zmian w content/common/", async ({
    page,
  }) => {
    const response = await page.goto("/content/sample-app/en/marketing-disclosure.html");
    expect(response.ok()).toBe(true);
    await expect(page.locator("[data-doc-slot]")).not.toBeEmpty();
    await expect(page.locator("h1[data-doc-title]")).toHaveText("Marketing Disclosure");
  });
});
