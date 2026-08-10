import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { extractDocContent } from "../../content/common/js/render.js";

const FIXTURE_PATH = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "fixtures",
  "marketing-disclosure.html"
);

/**
 * TASK-005 — Specyfikacja plików wejściowych i rozszerzalność typów dokumentów (REQ-003/REQ-008).
 *
 * Weryfikuje, że dowolny nowy typ dokumentu (tu: "marketing-disclosure", spoza podstawowych trzech
 * z REQ-003) zgodny z minimalną specyfikacją pliku wejściowego (doctype + <html lang> + <head> z
 * odwołaniem do modułu renderującego + dokładnie jeden <template id="doc-content"> w <body>) jest
 * poprawnie odczytywany przez silnik renderujący, bez potrzeby jakiejkolwiek zmiany w
 * `content/common/` — samo dodanie zgodnego pliku `.html` wystarcza (kryterium akceptacji TASK-005).
 */
describe("Specyfikacja plików wejściowych — rozszerzalność typów dokumentów (TASK-005)", () => {
  it("nowy, nietypowy dokument zgodny ze specyfikacją jest poprawnie odczytywany", () => {
    const html = readFileSync(FIXTURE_PATH, "utf-8");
    // Usuwamy <script type="module"> przed parsowaniem, aby happy-dom nie próbował go
    // wykonać/pobrać sieciowo — ten test weryfikuje wyłącznie ekstrakcję treści.
    const htmlWithoutScript = html.replace(/<script[^>]*type="module"[^>]*><\/script>/, "");
    const parsed = new DOMParser().parseFromString(htmlWithoutScript, "text/html");
    const { html: contentHtml, title } = extractDocContent(parsed);

    expect(title).toBe("Marketing Disclosure");
    expect(contentHtml).toContain("Sponsored placements");
  });

  it("plik wejściowy odwołuje się do wspólnego modułu renderującego bez duplikowania jego kodu", () => {
    const html = readFileSync(FIXTURE_PATH, "utf-8");
    expect(html).toMatch(/<script[^>]*type="module"[^>]*src="[^"]*common\/js\/render\.js"/);
  });
});
