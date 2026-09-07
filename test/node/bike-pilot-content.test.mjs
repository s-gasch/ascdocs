import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const ROOT = process.cwd();
const LEGACY_FIXTURE = path.join(ROOT, "test", "fixtures", "bike-pilot-legacy-hashes.json");
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
const DOCS = ["privacy-policy", "terms-of-use", "support"];
const TEMPLATE_PATTERN =
  /<template\s+id=["']doc-content["'][^>]*data-doc-title=["']([^"']+)["'][^>]*>([\s\S]*?)<\/template>/i;

test("TASK-019: legacy bike-pilot HTML files keep their original hashes", () => {
  const fixture = JSON.parse(fs.readFileSync(LEGACY_FIXTURE, "utf8"));

  for (const [relativePath, expectedHash] of Object.entries(fixture)) {
    const filePath = path.join(ROOT, relativePath);
    const actualHash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
    assert.equal(actualHash, expectedHash, relativePath);
  }
});

test("TASK-018: extracted formal JSON mirrors the existing HTML templates", () => {
  for (const language of LANGUAGES) {
    for (const docType of DOCS) {
      const htmlPath = path.join(BIKE_PILOT_ROOT, language, `${docType}.html`);
      const jsonPath = path.join(BIKE_PILOT_ROOT, "formal", docType, `${language}.json`);

      const source = fs.readFileSync(htmlPath, "utf8");
      const match = source.match(TEMPLATE_PATTERN);
      assert.ok(match, `Missing template in ${htmlPath}`);

      const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      assert.equal(payload.title, match[1].trim(), jsonPath);
      assert.equal(payload.html, match[2].trim(), jsonPath);
    }
  }
});

test("TASK-018: marketing JSON payloads exist and contain required keys for all languages", () => {
  for (const language of LANGUAGES) {
    const jsonPath = path.join(BIKE_PILOT_ROOT, "content", `${language}.json`);
    const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

    assert.equal(typeof payload.meta.title, "string", `${language}: meta.title`);
    assert.equal(typeof payload.meta.description, "string", `${language}: meta.description`);
    assert.equal(payload.hero.benefits.length, 4, `${language}: hero.benefits`);
    assert.equal(payload.templates.items.length, 6, `${language}: templates.items`);
    assert.equal(payload.features.items.length, 6, `${language}: features.items`);
    assert.equal(typeof payload.cta.button, "string", `${language}: cta.button`);
  }
});
