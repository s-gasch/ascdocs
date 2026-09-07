import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { Window } from "happy-dom";
import { renderDocumentContent, validateDocumentModel } from "../../content/bike-pilot/js/formal.js";
import { getUiStrings } from "../../content/bike-pilot/js/language.js";

const ROOT = process.cwd();
const LEGACY_FIXTURE = path.join(ROOT, "test", "fixtures", "bike-pilot-legacy-hashes.json");
const GOLDEN_FIXTURE = path.join(ROOT, "test", "fixtures", "bike-pilot-formal-golden.json");
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

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

// Mirrors how the source `<template>` markup yields "visible text": block-level siblings (blocks,
// list items, table rows/cells) are separated by a space (as pretty-printed HTML naturally is),
// while inline runs within a single paragraph/heading/list-item/table-cell are concatenated as-is
// (their own text already carries any necessary whitespace, matching the extraction script).
function extractInlineText(node) {
  if (node.nodeType === node.TEXT_NODE) {
    return node.textContent;
  }
  if (node.nodeType !== node.ELEMENT_NODE) {
    return "";
  }
  if (node.tagName === "BR") {
    return " ";
  }
  return Array.from(node.childNodes).map(extractInlineText).join("");
}

function extractBlockText(element) {
  switch (element.tagName) {
    case "UL":
    case "OL":
      return Array.from(element.children).map((item) => extractInlineText(item)).join(" ");
    case "TABLE": {
      const headerCells = Array.from(element.querySelectorAll("thead th")).map((cell) => extractInlineText(cell));
      const rows = Array.from(element.querySelectorAll("tbody tr")).map((row) =>
        Array.from(row.children).map((cell) => extractInlineText(cell)).join(" ")
      );
      return [headerCells.join(" "), ...rows].join(" ");
    }
    default:
      return extractInlineText(element);
  }
}

function extractVisibleText(contentRoot) {
  return Array.from(contentRoot.children).map(extractBlockText).join(" ");
}

test("TASK-019: legacy bike-pilot HTML files keep their original hashes", () => {
  const fixture = JSON.parse(fs.readFileSync(LEGACY_FIXTURE, "utf8"));

  for (const [relativePath, expectedHash] of Object.entries(fixture)) {
    const filePath = path.join(ROOT, relativePath);
    const actualHash = crypto.createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
    assert.equal(actualHash, expectedHash, relativePath);
  }
});

test("TASK-020/TASK-022: extracted formal JSON conforms to the blocks/runs schema and has no HTML", () => {
  for (const language of LANGUAGES) {
    for (const docType of DOCS) {
      const jsonPath = path.join(BIKE_PILOT_ROOT, "formal", docType, `${language}.json`);
      const raw = fs.readFileSync(jsonPath, "utf8");
      const payload = JSON.parse(raw);

      assert.doesNotThrow(() => validateDocumentModel(payload), jsonPath);
      assert.equal(Object.prototype.hasOwnProperty.call(payload, "html"), false, `${jsonPath} must not have 'html'`);
      assert.equal(/<[a-z][\s\S]*>/i.test(raw), false, `${jsonPath} must not contain HTML markup`);
    }
  }
});

test("TASK-022: rendered blocks/runs text matches the golden text captured before regeneration", () => {
  const golden = JSON.parse(fs.readFileSync(GOLDEN_FIXTURE, "utf8"));

  for (const language of LANGUAGES) {
    for (const docType of DOCS) {
      const jsonPath = path.join(BIKE_PILOT_ROOT, "formal", docType, `${language}.json`);
      const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));

      const window = new Window();
      const contentRoot = window.document.createElement("main");
      renderDocumentContent(window.document, contentRoot, payload);

      const goldenEntry = golden[`${docType}/${language}`];
      assert.ok(goldenEntry, `Missing golden fixture entry for ${docType}/${language}`);
      assert.equal(payload.title, goldenEntry.title, `${jsonPath}: title mismatch`);
      assert.equal(normalizeText(extractVisibleText(contentRoot)), goldenEntry.text, `${jsonPath}: text mismatch`);
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

test("TASK-024: navigation labels (js/language.js) match the formal document 'title' for every language/doc pair", () => {
  const NAV_KEY_BY_DOC = {
    "privacy-policy": "navPrivacy",
    "terms-of-use": "navTerms",
    support: "navSupport",
  };

  for (const language of LANGUAGES) {
    const ui = getUiStrings(language);
    for (const docType of DOCS) {
      const jsonPath = path.join(BIKE_PILOT_ROOT, "formal", docType, `${language}.json`);
      const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      const navKey = NAV_KEY_BY_DOC[docType];
      assert.equal(
        ui[navKey],
        payload.title,
        `${language}.${navKey} ("${ui[navKey]}") must match ${jsonPath} title ("${payload.title}")`
      );
    }
  }
});

test("TASK-025: every formal document declares a 'MAJOR.MINOR' version, identical across all 19 languages per doc type", () => {
  for (const docType of DOCS) {
    const versions = new Set();
    for (const language of LANGUAGES) {
      const jsonPath = path.join(BIKE_PILOT_ROOT, "formal", docType, `${language}.json`);
      const payload = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      assert.match(payload.version, /^\d+\.\d+$/, `${jsonPath}: version must be in 'MAJOR.MINOR' format`);
      versions.add(payload.version);
    }
    assert.equal(versions.size, 1, `${docType}: version must be identical across all 19 languages, found ${[...versions]}`);
  }
});
