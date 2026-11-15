import { test, expect } from "@playwright/test";
import { STORAGE_KEY } from "../../src/features/prototype/storage";

// Force an unexpected render error: the job list formats publication dates while rendering.
const breakDateFormatting = () => {
  // `format` is an accessor on the prototype, so plain assignment would be ignored.
  Object.defineProperty(Intl.DateTimeFormat.prototype, "format", {
    configurable: true,
    get() {
      throw new Error("Simulated render failure");
    },
  });
};

test("unexpected render error shows a recovery screen and keeps the saved scenario", async ({
  page,
}) => {
  await page.goto("/#/oferty");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  const saved = await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY);

  await page.addInitScript(breakDateFormatting);
  await page.reload();

  const alert = page.getByRole("alert");
  await expect(alert.getByRole("heading", { name: "Coś poszło nie tak" })).toBeVisible();
  await expect(alert.getByRole("button", { name: "Odśwież stronę" })).toBeVisible();
  await expect(alert.getByRole("link", { name: "Wróć na stronę główną" })).toBeVisible();
  expect(await page.evaluate((key) => localStorage.getItem(key), STORAGE_KEY)).toBe(saved);

  if (saved) {
    const download = page.waitForEvent("download");
    await alert.getByRole("button", { name: "Pobierz kopię danych" }).click();
    expect((await download).suggestedFilename()).toBe("doroboty-kopia-po-bledzie.json");
  }

  await alert.getByRole("button", { name: "Odśwież stronę" }).focus();
  await expect(alert.getByRole("button", { name: "Odśwież stronę" })).toBeFocused();
});

test("error screen fits a narrow screen without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(breakDateFormatting);
  await page.goto("/#/oferty");
  await expect(page.getByRole("heading", { name: "Coś poszło nie tak" })).toBeVisible();
  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBeLessThanOrEqual(0);
});
