# API reference

Human-readable reference should stay in sync with `openapi/openapi.yaml`.

- **Source of truth:** `openapi/openapi.yaml`
- **Executable API tests:** `npm run generate:postman` then `npm run test:newman`
- **LLM-friendly summary:** `npm run generate:qa-prompts` → `llm-generator/output/qa-prompt.md`

When the spec changes, regenerate the Postman collection so Newman and any imported Postman workspace stay aligned.
