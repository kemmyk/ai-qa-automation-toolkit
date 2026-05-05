#!/usr/bin/env node
/**
 * Reads openapi/openapi.yaml and prints structured prompts you can paste into an LLM
 * to draft test cases, Playwright flows, and Newman assertions.
 */
const fs = require("fs");
const path = require("path");
let yaml;
try {
  yaml = require("js-yaml");
} catch {
  console.error("Install dependencies: npm install (requires js-yaml)");
  process.exit(1);
}

require("dotenv").config();

const root = path.join(__dirname, "..");
const specPath = path.join(root, "openapi", "openapi.yaml");
const outDir = path.join(root, "llm-generator", "output");

function buildPrompt(spec) {
  const title = spec.info?.title || "API";
  const version = spec.info?.version || "";
  const paths = spec.paths || {};
  const endpoints = Object.entries(paths).flatMap(([p, methods]) =>
    Object.entries(methods)
      .filter(([m]) => typeof methods[m] === "object" && m !== "parameters")
      .map(([method, op]) => ({
        method: method.toUpperCase(),
        path: p,
        summary: op.summary || op.operationId || "",
      }))
  );

  return [
    `You are a senior QA engineer. API: ${title} ${version}`.trim(),
    "",
    "Tasks:",
    "1. Propose positive, negative, and edge-case tests per endpoint.",
    "2. Suggest Playwright E2E checks if a web UI exists for this API.",
    "3. Suggest Newman tests (status codes, JSON schema snippets, key fields).",
    "",
    "Endpoints:",
    ...endpoints.map((e) => `- ${e.method} ${e.path}${e.summary ? ` — ${e.summary}` : ""}`),
    "",
    `Optional context: BASE_URL from env is ${process.env.BASE_URL || "(not set)"}.`,
  ].join("\n");
}

function main() {
  if (!fs.existsSync(specPath)) {
    console.error("Missing:", specPath);
    process.exit(1);
  }
  const raw = fs.readFileSync(specPath, "utf8");
  const spec = yaml.load(raw);
  const prompt = buildPrompt(spec);

  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "qa-prompt.md");
  fs.writeFileSync(outFile, `# LLM QA prompt\n\n${prompt}\n`, "utf8");

  console.log(prompt);
  console.log("\n---");
  console.log("Saved:", outFile);
}

main();
