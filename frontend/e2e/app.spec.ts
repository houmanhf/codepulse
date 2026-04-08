import { test, expect } from "@playwright/test";

const API = "http://localhost:8000/api";
const ts = Date.now();

async function registerViaAPI(
  request: any,
  email: string,
  username: string,
  password: string
) {
  const resp = await request.post(`${API}/auth/register`, {
    data: { email, username, password },
  });
  return (await resp.json()).access_token;
}

async function loginViaLocalStorage(page: any, token: string) {
  await page.evaluate((t: string) => localStorage.setItem("token", t), token);
}

test.describe("Auth flow", () => {
  test("register and redirect to dashboard", async ({ page }) => {
    await page.goto("/register");

    await page.locator('input[type="email"]').fill(`reg-${ts}@test.com`);
    await page.locator('input[type="text"]').fill(`reg${ts}`);
    await page.locator('input[type="password"]').first().fill("testpass123");
    await page.locator('input[type="password"]').nth(1).fill("testpass123");
    await page.getByRole("button", { name: "Create account" }).click();

    // after registration, should see the dashboard with username in nav
    await expect(page.getByText(`reg${ts}`)).toBeVisible({ timeout: 10000 });
  });

  test("login with registered account", async ({ page, request }) => {
    const email = `login-${ts}@test.com`;
    const password = "testpass123";
    await registerViaAPI(request, email, `login${ts}`, password);

    await page.goto("/login");
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole("button", { name: "Sign in" }).click();

    // after login, should see username in nav
    await expect(page.getByText(`login${ts}`)).toBeVisible({ timeout: 10000 });
  });

  test("login with wrong password shows error", async ({ page }) => {
    await page.goto("/login");
    await page.locator('input[type="email"]').fill("nobody@test.com");
    await page.locator('input[type="password"]').fill("wrongpassword");
    await page.getByRole("button", { name: "Sign in" }).click();

    // error message should appear
    await expect(
      page.getByText(/invalid|credentials|wrong|failed/i)
    ).toBeVisible({ timeout: 10000 });
  });

  test("unauthenticated user is redirected to login", async ({ page }) => {
    await page.goto("/snippets/new");
    await expect(page).toHaveURL(/\/login/, { timeout: 5000 });
  });
});

test.describe("Snippet lifecycle", () => {
  let token: string;

  test.beforeAll(async ({ request }) => {
    token = await registerViaAPI(
      request,
      `snip-${ts}@test.com`,
      `snip${ts}`,
      "testpass123"
    );
  });

  test("create a snippet and see it on detail page", async ({ page }) => {
    await page.goto("/login");
    await loginViaLocalStorage(page, token);
    await page.goto("/snippets/new");

    await expect(page.locator('input[type="text"]')).toBeVisible({
      timeout: 5000,
    });
    await page.locator('input[type="text"]').fill("Merge Sort");
    await page.locator("select").selectOption("python");
    await page
      .locator("textarea")
      .first()
      .fill("def merge_sort(arr):\n    if len(arr) <= 1:\n        return arr");
    await page.getByRole("button", { name: "Create Snippet" }).click();

    await expect(page).toHaveURL(/\/snippets\//, { timeout: 10000 });
    await expect(page.getByText("Merge Sort")).toBeVisible({ timeout: 5000 });
  });

  test("snippet appears on dashboard", async ({ page }) => {
    await page.goto("/login");
    await loginViaLocalStorage(page, token);
    await page.goto("/");

    // wait for dashboard to load snippets
    await expect(page.getByText("Merge Sort").first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe("Review and comment flow", () => {
  let ownerToken: string;
  let reviewerToken: string;
  let snippetId: string;

  test.beforeAll(async ({ request }) => {
    ownerToken = await registerViaAPI(
      request,
      `owner-${ts}@test.com`,
      `owner${ts}`,
      "testpass123"
    );
    reviewerToken = await registerViaAPI(
      request,
      `revwr-${ts}@test.com`,
      `revwr${ts}`,
      "testpass123"
    );

    const resp = await request.post(`${API}/snippets`, {
      data: {
        title: "E2E Review Test",
        code: 'console.log("hello");\nconsole.log("world");\nconst x = 42;',
        language: "javascript",
      },
      headers: { Authorization: `Bearer ${ownerToken}` },
    });
    snippetId = (await resp.json()).id;
  });

  test("reviewer can view snippet detail", async ({ page }) => {
    await page.goto("/login");
    await loginViaLocalStorage(page, reviewerToken);
    await page.goto(`/snippets/${snippetId}`);

    await expect(page.getByText("E2E Review Test")).toBeVisible({
      timeout: 10000,
    });
  });

  test("reviewer can submit a review", async ({ page }) => {
    await page.goto("/login");
    await loginViaLocalStorage(page, reviewerToken);
    await page.goto(`/snippets/${snippetId}`);

    await expect(page.getByText("E2E Review Test")).toBeVisible({
      timeout: 10000,
    });

    const approveRadio = page.locator('input[value="approved"]');
    if (await approveRadio.isVisible({ timeout: 3000 })) {
      await approveRadio.click();

      const textarea = page.locator("textarea");
      if (await textarea.isVisible({ timeout: 1000 })) {
        await textarea.fill("Looks good to me!");
      }

      await page.getByRole("button", { name: /submit|review/i }).click();
      await expect(page.getByText(/approved/i)).toBeVisible({ timeout: 5000 });
    }
  });
});
