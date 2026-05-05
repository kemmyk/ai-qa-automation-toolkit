#!/usr/bin/env node
/**
 * Converts openapi/openapi.yaml to postman/collection.json using openapi-to-postmanv2.
 */
const fs = require("fs");
const path = require("path");
const Converter = require("openapi-to-postmanv2");

const root = path.join(__dirname, "..");
const specPath = path.join(root, "openapi", "openapi.yaml");
const outPath = path.join(root, "postman", "collection.json");

function main() {
  if (!fs.existsSync(specPath)) {
    console.error("Missing spec:", specPath);
    process.exit(1);
  }

  const specString = fs.readFileSync(specPath, "utf8");
  const input = { type: "string", data: specString };

  Converter.convert(input, { schemaFaker: true, requestParametersResolution: "Example" }, (err, result) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    if (!result.result || !result.result[0]) {
      console.error("Conversion produced no collection:", JSON.stringify(result, null, 2));
      process.exit(1);
    }
    const collection = result.result[0];
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(collection, null, 2), "utf8");
    console.log("Wrote", outPath);
  });
}

main();
