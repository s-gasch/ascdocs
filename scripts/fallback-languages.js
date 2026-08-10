#!/usr/bin/env node
/**
 * Skrypt fallbacku językowego (TASK-006, REQ-009/REQ-010).
 *
 * Narzędzie deweloperskie/publikacyjne (Node.js), uruchamiane lokalnie lub w CI *przed*
 * wdrożeniem na hosting statyczny — nigdy jako runtime na serwerze produkcyjnym (REQ-001,
 * REQ-017: narzędzia dev/testowe nie trafiają do przeglądarki użytkownika końcowego).
 *
 * Dla każdej aplikacji w `content/<app-name>/`:
 * - wymaga istnienia katalogu `en/` (REQ-009) — jego brak jest błędem jawnym zatrzymującym
 *   publikację;
 * - dla każdego języka występującego w co najmniej jednej aplikacji i każdego dokumentu
 *   obecnego w `en/`, ale brakującego w danym `<lang>/` — kopiuje plik z `en/` do brakującej
 *   lokalizacji, oznaczając go komentarzem HTML `<!-- fallback: en -->` (REQ-010).
 */
import { readdirSync, statSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FALLBACK_COMMENT = "<!-- fallback: en -->";

function isDirectory(dirPath) {
  try {
    return statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}

function listSubdirectories(dirPath, exclude = []) {
  if (!isDirectory(dirPath)) return [];
  return readdirSync(dirPath, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !exclude.includes(entry.name))
    .map((entry) => entry.name);
}

/**
 * Buduje plan działań fallbacku bez modyfikowania dysku (czysta funkcja — testowalna
 * jednostkowo).
 * @param {string} contentDir - ścieżka do katalogu `content/`.
 * @returns {{ actions: Array<{app: string, lang: string, doc: string, source: string, target: string}>, errors: string[] }}
 */
export function planFallback(contentDir) {
  const apps = listSubdirectories(contentDir, ["common"]);
  const allLangs = new Set();
  const appLangs = {};

  for (const app of apps) {
    const langs = listSubdirectories(path.join(contentDir, app), ["template"]);
    appLangs[app] = langs;
    langs.forEach((lang) => allLangs.add(lang));
  }

  const actions = [];
  const errors = [];

  for (const app of apps) {
    const appDir = path.join(contentDir, app);
    const enDir = path.join(appDir, "en");
    if (!isDirectory(enDir)) {
      errors.push(
        `Aplikacja "${app}" nie posiada wymaganego katalogu en/ (REQ-009) — publikacja przerwana.`
      );
      continue;
    }

    const enDocs = readdirSync(enDir).filter((file) => file.endsWith(".html"));
    for (const lang of allLangs) {
      if (lang === "en") continue;
      const langDir = path.join(appDir, lang);
      for (const doc of enDocs) {
        const target = path.join(langDir, doc);
        if (!existsSync(target)) {
          actions.push({ app, lang, doc, source: path.join(enDir, doc), target });
        }
      }
    }
  }

  return { actions, errors };
}

/**
 * Wykonuje plan działań na dysku: tworzy brakujące katalogi i kopiuje pliki `en/` z adnotacją
 * fallbacku.
 * @param {ReturnType<typeof planFallback>["actions"]} actions
 */
export function applyFallback(actions) {
  for (const action of actions) {
    mkdirSync(path.dirname(action.target), { recursive: true });
    const original = readFileSync(action.source, "utf-8");
    writeFileSync(action.target, `${FALLBACK_COMMENT}\n${original}`, "utf-8");
  }
  return actions;
}

function main() {
  const contentDir = path.join(process.cwd(), "content");
  const { actions, errors } = planFallback(contentDir);

  if (errors.length > 0) {
    errors.forEach((error) => console.error(`Błąd: ${error}`));
    process.exitCode = 1;
    return;
  }

  applyFallback(actions);

  if (actions.length === 0) {
    console.log("Brak brakujących tłumaczeń — fallback nie jest wymagany.");
  } else {
    actions.forEach((action) =>
      console.log(`Fallback: ${action.app}/${action.lang}/${action.doc} <- en/${action.doc}`)
    );
  }
}

const isDirectRun = process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1];
if (isDirectRun) {
  main();
}
