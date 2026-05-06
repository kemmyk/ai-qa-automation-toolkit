// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("Example Domain frontend checks", () => {
  test("page loads", async ({ page }) => {
    const response = await page.goto("/", { waitUntil: "domcontentloaded" });
    if (response === null) {
      throw new Error("Expected page.goto to return a Response");
    }

    expect(response.ok()).toBeTruthy();
    await expect(page.locator("body")).toBeVisible();
  });

  test('title contains "Example Domain"', async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle(/Example Domain/i);
  });

  test("h1 is visible", async ({ page }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    const heading = page.getByRole("heading", { level: 1, name: /Example Domain/i });
    await expect(heading).toBeVisible();
  });
});
