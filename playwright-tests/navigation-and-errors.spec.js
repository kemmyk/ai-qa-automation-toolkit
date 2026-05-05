// @ts-check
const { test, expect } = require("@playwright/test");

/** @param {string | undefined} base */
function isExampleDomain(base) {
  return Boolean(base && base.includes("example.com"));
}

test.describe("Navigation", () => {
  test("navigates to base URL (root path)", async ({ page, baseURL }) => {
    await page.goto("/");
    const expected = new URL("/", baseURL || undefined).href;
    expect(page.url()).toBe(expected);
    await expect(page.locator("body")).toBeVisible();
  });

  test("page has a non-empty title and visible document", async ({ page, baseURL }) => {
    await page.goto("/");
    const title = (await page.title()).trim();
    expect(title.length).toBeGreaterThan(0);

    if (isExampleDomain(baseURL)) {
      await expect(page).toHaveTitle(/Example Domain/i);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toContainText(/Example Domain/i);
    } else {
      await expect(page.locator("html")).toBeAttached();
    }
  });
});

test.describe("Invalid routes", () => {
  test("non-existent path returns 404 when host serves strict 404s", async ({ page, baseURL }) => {
    const path = `/playwright-missing-${Date.now()}`;
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    if (response === null) {
      throw new Error("Expected page.goto to return a Response");
    }

    if (isExampleDomain(baseURL)) {
      expect(response.status()).toBe(404);
      await expect(page).toHaveTitle(/Example Domain/i);
    } else {
      expect([200, 301, 302, 401, 403, 404]).toContain(response.status());
    }
  });

  test("deep invalid nested path still produces a navigable document", async ({ page }) => {
    const path = `/a/b/c/playwright-invalid-${Date.now()}`;
    const response = await page.goto(path, { waitUntil: "domcontentloaded" });
    if (response === null) {
      throw new Error("Expected page.goto to return a Response");
    }
    await expect(page.locator("html")).toBeAttached();
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Error handling", () => {
  test("pageerror is emitted when the page throws at runtime", async ({ page }) => {
    await page.goto("/");

    const errorPromise = page.waitForEvent("pageerror");
    await page.evaluate(() => {
      setTimeout(() => {
        throw new Error("Playwright injected page error");
      }, 0);
    });

    const err = await errorPromise;
    expect(err.message).toMatch(/Playwright injected page error/);
  });

  test("aborted navigation surfaces as a failed goto", async ({ page }) => {
    await page.route("**/playwright-aborted-route", (route) => {
      route.abort("failed");
    });

    await expect(page.goto("/playwright-aborted-route", { timeout: 15000 })).rejects.toThrow();
  });

  test("HTTP 500 response is visible to the page", async ({ page }) => {
    await page.route("**/playwright-simulated-500", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "text/plain",
        body: "Simulated server error",
      });
    });

    const response = await page.goto("/playwright-simulated-500", { waitUntil: "domcontentloaded" });
    if (response === null) {
      throw new Error("Expected page.goto to return a Response");
    }
    expect(response.status()).toBe(500);
    await expect(page.getByText("Simulated server error")).toBeVisible();
  });
});
