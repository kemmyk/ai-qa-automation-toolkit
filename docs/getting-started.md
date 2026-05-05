# AI QA Automation Toolkit

## Layout

| Folder | Purpose |
|--------|---------|
| `openapi/` | Source OpenAPI spec; drives Postman generation |
| `llm-generator/` | Scripts and templates to turn the spec into LLM prompts for test ideas |
| `postman/` | Newman collection (`collection.json`) and environment |
| `playwright-tests/` | E2E tests |
| `docs/` | Project documentation |

## Setup

```bash
cd /path/to/this/project
npm install
npx playwright install chromium
cp .env.example .env
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run test:e2e` | Run Playwright tests |
| `npm run test:e2e:ui` | Playwright UI mode |
| `npm run test:newman` | Run Newman against `postman/collection.json` |
| `npm run generate:postman` | Regenerate Postman collection from `openapi/openapi.yaml` |
| `npm run generate:qa-prompts` | Write `llm-generator/output/qa-prompt.md` and print the prompt |

Generate the collection before the first Newman run if `postman/collection.json` is missing:

```bash
npm run generate:postman
npm run test:newman
```

## Environment

- `BASE_URL` — used by Playwright (`playwright.config.js`) and referenced in LLM prompts.
- Postman requests use `{{baseUrl}}` from `postman/environment.json`.
- `npm run test:newman` loads `.env` via `scripts/run-newman.js` (you can extend that script to map `process.env` into Newman globals if needed).

After `npm install`, Playwright downloads Chromium via the `postinstall` script. Air-gapped installs can use `npm install --ignore-scripts` and then `npx playwright install chromium`.
