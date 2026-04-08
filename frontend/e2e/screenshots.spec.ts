import { test } from "@playwright/test";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUT = path.resolve(__dirname, "../../docs/images");
const USER = { email: "alice@codepulse.dev", password: "password123" };

test.use({ viewport: { width: 1280, height: 800 }, colorScheme: "dark" });

test("capture screenshots for README", async ({ page }) => {
  // Login page
  await page.goto("/login");
  await page.waitForSelector('button:has-text("Sign in")');
  await page.screenshot({ path: `${OUT}/login.png`, fullPage: true });

  // Log in
  await page.fill('input[type="email"]', USER.email);
  await page.fill('input[type="password"]', USER.password);
  await page.click('button:has-text("Sign in")');
  await page.waitForURL("**/");

  // Dashboard
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/dashboard.png`, fullPage: true });

  // Click into first snippet
  const firstCard = page.locator("a[href*='/snippets/']").first();
  await firstCard.click();
  await page.waitForURL("**/snippets/**");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}/snippet-detail.png`, fullPage: true });

  // New snippet page
  await page.goto("/snippets/new");
  await page.waitForSelector('button:has-text("Create Snippet")');
  await page.screenshot({ path: `${OUT}/new-snippet.png`, fullPage: true });

  // Register page (logout first by clearing token)
  await page.evaluate(() => localStorage.removeItem("token"));
  await page.goto("/register");
  await page.waitForSelector('button:has-text("Create account")');
  await page.screenshot({ path: `${OUT}/register.png`, fullPage: true });
});