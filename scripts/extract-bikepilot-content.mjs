#!/usr/bin/env node
/**
 * TASK-018/TASK-022 — jednorazowa ekstrakcja treści `content/bike-pilot/<lang>/*.html` do JSON,
 * bez modyfikowania plików źródłowych (REQ-018/REQ-019/REQ-025). Od TASK-022 (REQ-026) treść jest
 * mapowana na strukturalny model `blocks[]`/`runs[]` (zob. nagłówek `content/bike-pilot/js/
 * formal.js`) zamiast surowego pola `html`.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Window } from "happy-dom";

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

function extractTemplateMarkup(html, inputPath) {
  const match = html.match(TEMPLATE_PATTERN);
  if (!match) {
    throw new Error(`Missing <template id=\"doc-content\"> in ${inputPath}`);
  }

  return {
    title: match[1].trim(),
    markup: match[2].trim(),
  };
}

function collectRuns(node, flags, runs) {
  if (node.nodeType === node.TEXT_NODE) {
    const text = node.textContent.replace(/\s+/g, " ");
    if (text !== "") {
      runs.push({ ...flags, text });
    }
    return;
  }

  if (node.nodeType !== node.ELEMENT_NODE) {
    return;
  }

  if (node.tagName === "BR") {
    runs.push({ break: true });
    return;
  }

  const nextFlags = { ...flags };
  if (node.tagName === "STRONG" || node.tagName === "B") {
    nextFlags.bold = true;
  }
  if (node.tagName === "EM" || node.tagName === "I") {
    nextFlags.italic = true;
  }
  if (node.tagName === "CODE") {
    nextFlags.code = true;
  }
  if (node.tagName === "A") {
    nextFlags.href = node.getAttribute("href") || "";
  }

  Array.from(node.childNodes).forEach((child) => collectRuns(child, nextFlags, runs));
}

function trimRunsBoundaries(runs) {
  if (runs.length === 0) {
    return runs;
  }
  const trimmed = runs.map((run) => ({ ...run }));
  const first = trimmed[0];
  if (typeof first.text === "string") {
    first.text = first.text.replace(/^\s+/, "");
  }
  const last = trimmed[trimmed.length - 1];
  if (typeof last.text === "string") {
    last.text = last.text.replace(/\s+$/, "");
  }
  return trimmed.filter((run) => run.break || run.text !== "");
}

function runsFromInline(node) {
  const runs = [];
  Array.from(node.childNodes).forEach((child) => collectRuns(child, {}, runs));
  return trimRunsBoundaries(runs);
}

function blockFromElement(element) {
  switch (element.tagName) {
    case "H2":
      return { type: "heading", level: 2, text: element.textContent.replace(/\s+/g, " ").trim() };
    case "H3":
      return { type: "heading", level: 3, text: element.textContent.replace(/\s+/g, " ").trim() };
    case "P":
      return { type: "paragraph", runs: runsFromInline(element) };
    case "UL":
    case "OL":
      return {
        type: "list",
        ordered: element.tagName === "OL",
        items: Array.from(element.children)
          .filter((child) => child.tagName === "LI")
          .map((item) => runsFromInline(item)),
      };
    case "TABLE": {
      const headerCells = Array.from(element.querySelectorAll("thead th"));
      const headers = headerCells.map((cell) => cell.textContent.replace(/\s+/g, " ").trim());
      const bodyRows = Array.from(element.querySelectorAll("tbody tr"));
      const rows = bodyRows.map((row) =>
        Array.from(row.children)
          .filter((cell) => cell.tagName === "TD" || cell.tagName === "TH")
          .map((cell) => runsFromInline(cell))
      );
      return { type: "table", headers, rows };
    }
    default:
      throw new Error(`Unsupported top-level element <${element.tagName.toLowerCase()}> in doc-content template.`);
  }
}

function markupToBlocks(markup) {
  const window = new Window();
  const container = window.document.createElement("div");
  container.innerHTML = markup;
  return Array.from(container.children).map((element) => blockFromElement(element));
}

async function extractFormalJson() {
  for (const docType of DOCS) {
    const outputDir = path.join(BIKE_PILOT_ROOT, "formal", docType);
    await mkdir(outputDir, { recursive: true });

    for (const language of LANGUAGES) {
      const inputPath = path.join(BIKE_PILOT_ROOT, language, `${docType}.html`);
      const outputPath = path.join(outputDir, `${language}.json`);
      const source = await readFile(inputPath, "utf8");
      const { title, markup } = extractTemplateMarkup(source, inputPath);
      const blocks = markupToBlocks(markup);
      const payload = { title, blocks };
      await writeFile(outputPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
    }
  }
}

await extractFormalJson();
console.log("Bike Pilot formal JSON extracted.");
