#!/usr/bin/env node
require("dotenv").config();
const path = require("path");
const { spawnSync } = require("child_process");

const root = path.join(__dirname, "..");
const newmanCli = require.resolve("newman/bin/newman.js");
const verbose = process.argv.includes("--verbose");

const args = [
  newmanCli,
  "run",
  path.join(root, "postman", "collection.json"),
  "-e",
  path.join(root, "postman", "environment.json"),
  "--reporters",
  "cli",
];
if (verbose) args.push("--verbose");

const r = spawnSync(process.execPath, args, { stdio: "inherit", cwd: root });
process.exit(r.status === null ? 1 : r.status);
