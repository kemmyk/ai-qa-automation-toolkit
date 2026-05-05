# API discovery — `api-pentest.balador.io`

This document describes how we probe the host, which URLs are exercised by the Postman collection, what we observed from the public internet, and what we conclude about API availability.

## Purpose

**API discovery** means learning what an HTTP host actually exposes before writing functional tests or assuming paths (for example `/todos` or `/api/v1`). We treat the host as a black box: we issue safe `GET` requests to well-known entry points and record status codes, latency, and response bodies.

## Discovery process

1. **Choose a base URL**  
   Configure `baseUrl` (for example in `postman/environment.json`). The default used in this project is `https://api-pentest.balador.io`.

2. **Hit canonical paths**  
   Unauthenticated `GET` requests are sent to the site root and to common API and documentation paths. No credentials, payloads, or destructive methods are used.

3. **Record outcomes**  
   For each response we note:
   - HTTP status (and whether it is in an acceptable range for “something answered”)
   - Time to first byte / total time (sanity check for timeouts or slow edges)
   - Body presence and shape (HTML vs JSON is inferred from content; we do not assume a JSON API)

4. **Automate in Postman / Newman**  
   The collection `postman/generated.json` encodes the same probes with tests that:
   - Accept status **200, 401, 403, or 404** (no success assumption)
   - Require response time **under 2000 ms**
   - Require a **non-empty** body (typical nginx and error pages still return HTML)

5. **Interpret**  
   A **200** on `/` with default **nginx** HTML usually means the virtual host is up but **no application** is mounted at `/`. **404** on `/api`, `/docs`, etc. means those paths are **not served** on this host as deployed today.

## Tested endpoints (Postman collection)

The **Discovery** folder in `postman/generated.json` runs these requests (all `GET`, all relative to `{{baseUrl}}`):

| Request name     | Path             |
|------------------|------------------|
| API Discovery    | `/`              |
| GET /api         | `/api`           |
| GET /v1          | `/v1`            |
| GET /api/v1      | `/api/v1`        |
| GET /swagger     | `/swagger`       |
| GET /docs        | `/docs`          |
| GET /openapi.json| `/openapi.json` |

With `baseUrl = https://api-pentest.balador.io`, full URLs are `https://api-pentest.balador.io/` plus each path above.

## Results (nginx + 404 responses)

From **public, unauthenticated** checks against this host (browser/fetch and `curl`-style probes aligned with the collection):

- **`GET /`** — **HTTP 200**. Body is the **default nginx welcome page** (HTML), indicating the web server is running but no custom application homepage is configured at the root.
- **`GET /api`**, **`/v1`**, **`/api/v1`**, **`/swagger`**, **`/docs`**, **`/openapi.json`** — **HTTP 404** (or equivalent “not found” behavior). Responses are typically **small HTML or text error pages** from the front proxy or nginx, not OpenAPI JSON and not a versioned REST root.

Responses are generally **non-empty** (HTML error pages or the nginx default page), which matches the collection’s “body not empty” check. The stack sits behind **Cloudflare** in front of nginx; that is visible from response headers in live probes.

## Conclusion: API not publicly accessible

Based on discovery:

- There is **no evidence** of a **public, documented REST API** at the usual paths (`/api`, `/v1`, `/openapi.json`, etc.) on `https://api-pentest.balador.io` without extra context (VPN, internal DNS, API keys, or a different base path).
- The only clearly **live** surface on the public URL is the **default nginx page** on `/`, which is **not** an application API.
- Therefore, for an **external** tester with **no credentials and no private network**, the **API is not publicly accessible** in the sense of “callable product API at standard paths.”

If the real service is internal-only, behind auth, or uses a non-standard prefix, you must obtain **official base path + auth** from the team operating the host, then extend the Postman collection with those routes and tighten assertions (for example strict `200` + JSON schema) once the contract is known.

## How to run the discovery collection

```bash
newman run postman/generated.json -e postman/environment.json
```

Ensure `postman/environment.json` defines `baseUrl` for the host you intend to probe. Open Postman Console (or Newman stdout) to see **logged response bodies** per request.
