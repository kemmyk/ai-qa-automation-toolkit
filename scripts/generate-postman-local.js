#!/usr/bin/env node
"use strict";

/**
 * Generate a Postman collection from openapi/spec.json locally
 * using openapi-to-postmanv2.
 *
 * Usage:
 *   node scripts/generate-postman-local.js
 */

const fs = require("fs");
const path = require("path");
const Converter = require("openapi-to-postmanv2");

const ROOT = path.join(__dirname, "..");
const SPEC_PATH = path.join(ROOT, "openapi", "spec.json");
const DEFAULT_OUTPUT_PATH = path.join(ROOT, "postman", "openapi.generated.json");

function getOutputPath() {
  const cliIdx = process.argv.indexOf("--output");
  if (cliIdx !== -1 && process.argv[cliIdx + 1]) {
    return path.resolve(ROOT, process.argv[cliIdx + 1]);
  }
  if (process.env.POSTMAN_LOCAL_OUTPUT) {
    return path.resolve(ROOT, process.env.POSTMAN_LOCAL_OUTPUT);
  }
  return DEFAULT_OUTPUT_PATH;
}

function main() {
  if (!fs.existsSync(SPEC_PATH)) {
    console.error("Missing spec:", SPEC_PATH);
    process.exit(1);
  }

  const specRaw = fs.readFileSync(SPEC_PATH, "utf8");
  JSON.parse(specRaw); // Fail fast for invalid JSON.

  const input = { type: "string", data: specRaw };
  const options = { schemaFaker: true, requestParametersResolution: "Example" };

  Converter.convert(input, options, (err, result) => {
    if (err) {
      console.error("Conversion error:", err);
      process.exit(1);
    }

    if (!result || !result.output || !result.output[0] || !result.output[0].data) {
      console.error("Conversion produced no collection:", JSON.stringify(result, null, 2));
      process.exit(1);
    }

    const collection = result.output[0].data;
    if (collection && collection.info && !collection.info.schema) {
      collection.info.schema = "https://schema.getpostman.com/json/collection/v2.1.0/collection.json";
    }

    const outputPath = getOutputPath();
    fs.mkdirSync(path.dirname(outputPath), { recursive: true });
    fs.writeFileSync(outputPath, `${JSON.stringify(collection, null, 2)}\n`, "utf8");
    console.log(`Success: Postman collection created at ${outputPath}`);
  });
}

main();
