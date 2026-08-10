import test from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import os from "node:os";
import { planFallback, applyFallback, FALLBACK_COMMENT } from "../../scripts/fallback-languages.js";

function makeTempContentDir() {
  return mkdtempSync(path.join(os.tmpdir(), "ascdocs-fallback-"));
}

function writeDoc(contentDir, app, lang, doc, body = "<p>content</p>") {
  const dir = path.join(contentDir, app, lang);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, doc), body, "utf-8");
}

test("planFallback: brak akcji, gdy wszystkie języki mają wszystkie dokumenty", () => {
  const contentDir = makeTempContentDir();
  try {
    writeDoc(contentDir, "app1", "en", "privacy-policy.html");
    writeDoc(contentDir, "app1", "de", "privacy-policy.html");
    const { actions, errors } = planFallback(contentDir);
    assert.deepEqual(actions, []);
    assert.deepEqual(errors, []);
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});

test("planFallback: planuje kopię dla brakującego dokumentu językowego (REQ-010)", () => {
  const contentDir = makeTempContentDir();
  try {
    writeDoc(contentDir, "app1", "en", "privacy-policy.html");
    writeDoc(contentDir, "app1", "en", "support.html");
    writeDoc(contentDir, "app1", "pl", "privacy-policy.html");
    // pl/support.html celowo brakuje

    const { actions, errors } = planFallback(contentDir);
    assert.deepEqual(errors, []);
    assert.equal(actions.length, 1);
    assert.equal(actions[0].app, "app1");
    assert.equal(actions[0].lang, "pl");
    assert.equal(actions[0].doc, "support.html");
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});

test("planFallback: zgłasza błąd jawny, gdy aplikacja nie ma katalogu en/ (REQ-009)", () => {
  const contentDir = makeTempContentDir();
  try {
    writeDoc(contentDir, "app1", "de", "privacy-policy.html");
    const { actions, errors } = planFallback(contentDir);
    assert.equal(actions.length, 0);
    assert.equal(errors.length, 1);
    assert.match(errors[0], /nie posiada wymaganego katalogu en\//);
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});

test("planFallback: pomija content/<app>/template/ przy wykrywaniu języków", () => {
  const contentDir = makeTempContentDir();
  try {
    writeDoc(contentDir, "app1", "en", "privacy-policy.html");
    mkdirSync(path.join(contentDir, "app1", "template"), { recursive: true });
    writeFileSync(path.join(contentDir, "app1", "template", "template.html"), "<div></div>");

    const { actions, errors } = planFallback(contentDir);
    assert.deepEqual(actions, []);
    assert.deepEqual(errors, []);
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});

test("applyFallback: kopiuje plik z adnotacją <!-- fallback: en --> (REQ-010)", () => {
  const contentDir = makeTempContentDir();
  try {
    writeDoc(contentDir, "app1", "en", "support.html", "<p>Support EN</p>");
    writeDoc(contentDir, "app1", "pl", "privacy-policy.html");

    const { actions } = planFallback(contentDir);
    applyFallback(actions);

    const target = path.join(contentDir, "app1", "pl", "support.html");
    const written = readFileSync(target, "utf-8");
    assert.match(written, new RegExp(`^${FALLBACK_COMMENT.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`));
    assert.match(written, /Support EN/);
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});

test("applyFallback: nie tworzy kopii dla plików, które już istnieją (nietknięte)", () => {
  const contentDir = makeTempContentDir();
  try {
    writeDoc(contentDir, "app1", "en", "support.html", "<p>Support EN</p>");
    writeDoc(contentDir, "app1", "pl", "support.html", "<p>Support PL oryginalny</p>");

    const { actions } = planFallback(contentDir);
    assert.equal(actions.length, 0);

    const target = path.join(contentDir, "app1", "pl", "support.html");
    assert.equal(readFileSync(target, "utf-8"), "<p>Support PL oryginalny</p>");
  } finally {
    rmSync(contentDir, { recursive: true, force: true });
  }
});
