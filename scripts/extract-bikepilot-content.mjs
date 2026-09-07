#!/usr/bin/env node
/**
 * TASK-018 — jednorazowa ekstrakcja treści `content/bike-pilot/<lang>/*.html` do JSON,
 * bez modyfikowania plików źródłowych (REQ-018/REQ-019/REQ-025).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
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

function extractTemplate(html, inputPath) {
  const match = html.match(TEMPLATE_PATTERN);
  if (!match) {
    throw new Error(`Missing <template id=\"doc-content\"> in ${inputPath}`);
  }

  return {
    title: match[1].trim(),
    html: match[2].trim(),
  };
}

async function extractFormalJson() {
  for (const docType of DOCS) {
    const outputDir = path.join(BIKE_PILOT_ROOT, "formal", docType);
    await mkdir(outputDir, { recursive: true });

    for (const language of LANGUAGES) {
      const inputPath = path.join(BIKE_PILOT_ROOT, language, `${docType}.html`);
      const outputPath = path.join(outputDir, `${language}.json`);
      const source = await readFile(inputPath, "utf8");
      const payload = extractTemplate(source, inputPath);
      await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    }
  }
}

await extractFormalJson();
console.log("Bike Pilot formal JSON extracted.");
