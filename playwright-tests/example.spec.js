// @ts-check
const { test, expect } = require("@playwright/test");

test.describe("smoke", () => {
  test("home page responds", async ({ page, baseURL }) => {
    const url = baseURL || "https://example.com";
    await page.goto(url);
    await expect(page).toHaveTitle(/Example Domain/i);
  });
});
