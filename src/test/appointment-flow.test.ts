import { test, expect } from "../../playwright-fixture";

// ─── Credentials ───────────────────────────────────────────────────────────────
const USER_EMAIL = "ecellaga21@gmail.com";   // a real user who has a pet
const USER_PASS  = "ecellaga21@gmail.com";   // update if different

const ADMIN_EMAIL = "admin@gmail.com";
const ADMIN_PASS  = "admin@gmail.com";
// ───────────────────────────────────────────────────────────────────────────────

test.describe("Appointment Flow: Book → Admin Confirm", () => {

  test("1. User logs in and books an appointment", async ({ page }) => {
    // Go to login
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: /login|sign in/i })).toBeVisible({ timeout: 10000 }).catch(() => {});

    // Fill login form
    await page.getByLabel(/email/i).fill(USER_EMAIL);
    await page.getByLabel(/password/i).fill(USER_PASS);
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Wait for redirect to home
    await page.waitForURL("**/home", { timeout: 15000 });
    await expect(page).toHaveURL(/home/);

    // Navigate to Appointments
    await page.goto("/appointments");
    await expect(page.getByText(/appointments/i)).toBeVisible();

    // Click Book button
    await page.getByRole("button", { name: /book/i }).click();
    await page.waitForURL("**/appointments/new", { timeout: 10000 });

    // Select first pet
    const petSelect = page.locator("button[role='combobox']").first();
    await petSelect.click();
    await page.locator("[role='option']").first().click();

    // Fill date & time
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const dateStr = today.toISOString().split("T")[0];
    await page.locator("input[type='date']").fill(dateStr);
    await page.locator("input[type='time']").fill("10:00");

    // Fill reason
    await page.locator("textarea").fill("Annual checkup - E2E Test");

    // Submit
    await page.getByRole("button", { name: /book appointment/i }).click();

    // Should redirect back to appointments
    await page.waitForURL("**/appointments", { timeout: 15000 });
    await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 10000 });

    console.log("✅ Appointment booked successfully!");
  });

  test("2. Admin logs in and confirms the appointment", async ({ page }) => {
    // Go to login
    await page.goto("/login");

    // Fill admin credentials
    await page.getByLabel(/email/i).fill(ADMIN_EMAIL);
    await page.getByLabel(/password/i).fill(ADMIN_PASS);
    await page.getByRole("button", { name: /sign in|login/i }).click();

    // Wait for home
    await page.waitForURL("**/home", { timeout: 15000 });

    // Go to Admin Panel
    await page.goto("/admin");
    await expect(page.getByText(/admin panel/i)).toBeVisible({ timeout: 10000 });

    // Click Appointments tab
    await page.getByRole("tab", { name: /appointments/i }).click();
    await expect(page.getByText(/pending/i)).toBeVisible({ timeout: 10000 });

    // Click Confirm button on the first pending appointment
    const confirmBtn = page.getByRole("button", { name: /confirm/i }).first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();

    // Wait for status to change to Confirmed
    await expect(page.getByText(/confirmed/i)).toBeVisible({ timeout: 10000 });

    console.log("✅ Admin confirmed the appointment successfully!");
  });

});
