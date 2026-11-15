import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { initialState } from "../../src/features/prototype/model";
import { STORAGE_KEY } from "../../src/features/prototype/storage";
import {
  PUNKT_LABS_COMPANY_ID,
  PUNKT_LABS_RECRUITER_ID,
  trialFixture,
} from "../../src/features/prototype/fact-card-trial";

async function chooseEwa(page: Page) {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Ewa Malinowska", exact: true }).click();
  await expect(page).toHaveURL(/#\/app\/kandydaci$/);
}
async function pick(page: Page, names: string[]) {
  for (const name of names)
    await page.getByRole("checkbox", { name: `Wybierz na rozmowę (${name})`, exact: true }).check();
}
async function noHorizontalOverflow(page: Page) {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
}
const historicalLabels = /Kontynuacja po rozmowie|Odrzucenie po rozmowie|hiring managera/;

test("Punkt Labs recruiter compares view A and view B from selection to result", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await chooseEwa(page);
  await expect(page.getByRole("heading", { name: "Kandydaci", level: 1 })).toBeVisible();
  await expect(page.getByText(trialFixture.task, { exact: true })).toBeVisible();
  const names = page.locator(".trial-candidate-name");
  await expect(names).toHaveText(trialFixture.candidates.map((c) => c.name));
  await expect(page.locator(".match-score")).toHaveCount(10);
  await expect(page.locator(".fact-card")).toHaveCount(0);
  await expect(page.locator("main")).not.toContainText(historicalLabels);

  const invite = page.getByRole("button", { name: "Zaproś na rozmowę", exact: true });
  await expect(invite).toBeDisabled();
  await pick(page, ["Piotr Lis", "Paweł Dąbek", "Łukasz Szpak"]);
  await expect(page.getByRole("status").filter({ hasText: "Wybrano" })).toContainText(
    "Wybrano 3 z 3",
  );
  await expect(
    page.getByRole("checkbox", { name: "Wybierz na rozmowę (Kamil Wróbel)", exact: true }),
  ).toBeDisabled();
  await page.reload();
  await expect(invite).toBeEnabled();
  await invite.click();

  await expect(page).toHaveURL(/#\/app\/kandydaci\/wynik\?widok=a$/);
  await expect(page.getByRole("heading", { level: 2 }).first()).toHaveText(
    "Z 3 osób wybranych przez Ciebie firma po pierwszej rozmowie poszła dalej z 0.",
  );
  await expect(page.getByText("Odrzucenie po rozmowie")).toHaveCount(3);
  await expect(page.getByText("W tej rekrutacji continue dostały 3 z 10 osób.")).toBeVisible();
  await expect(page.getByText("Losowy wybór 3 osób trafiłby średnio 0,9.")).toBeVisible();
  await expect(
    page.getByText(
      "To decyzja hiring managera tej firmy z VI-VII 2026, a nie ocena kandydata ani wynik AI.",
    ),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "Widok A i widok B" })).toHaveCount(0);
  await page.screenshot({ path: "artifacts/fact-card-result-a-desktop.png", fullPage: true });

  await page.getByRole("link", { name: "Spróbuj drugiego widoku", exact: true }).click();
  await expect(page).toHaveURL(/widok=b$/);
  await expect(page.getByRole("link", { name: "B Karta faktów" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  for (const note of trialFixture.listNotes) await expect(page.getByText(note)).toBeVisible();
  await expect(page.locator(".fact-card")).toHaveCount(10);
  await expect(page.getByText("przygotowane ręcznie", { exact: true })).toHaveCount(10);
  await expect(page.getByText("dodane w trakcie rekrutacji", { exact: true })).toHaveCount(2);
  await expect(page.locator("main")).not.toContainText(historicalLabels);
  await expect(page.locator(".trial-candidate-name")).toHaveText(
    trialFixture.candidates.map((c) => c.name),
  );
  await expect(page.getByRole("status").filter({ hasText: "Wybrano" })).toContainText(
    "Wybrano 0 z 3",
  );
  let results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: "artifacts/fact-card-list-b-desktop.png", fullPage: true });

  await page.getByRole("link", { name: "Zobacz zgłoszenie: Jakub Kruk", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Jakub Kruk", level: 1 })).toBeVisible();
  await expect(page.getByRole("region", { name: "Karta faktów: Jakub Kruk" })).toBeVisible();
  await page.getByRole("tab", { name: "Preferencje", exact: true }).click();
  await expect(page.getByText(trialFixture.candidates[3].preferences)).toBeVisible();
  await expect(page.locator("main")).not.toContainText(historicalLabels);
  await page.getByRole("checkbox", { name: "Wybierz na rozmowę (Jakub Kruk)" }).check();
  await page.getByRole("link", { name: "Wróć do listy kandydatów", exact: true }).click();
  await expect(page).toHaveURL(/widok=b$/);
  await pick(page, ["Bartosz Czajka", "Mateusz Gil"]);
  await invite.click();

  await expect(page).toHaveURL(/wynik\?widok=b$/);
  await expect(page.locator(".trial-result-headline")).toContainText("poszła dalej z 3.");
  await expect(page.getByRole("heading", { name: "Widok A i widok B" })).toBeVisible();
  await expect(page.locator(".trial-compare-card")).toHaveCount(2);
  await expect(page.locator(".trial-compare-card").first()).toContainText("0 z 3");
  await expect(page.locator(".trial-compare-card").last()).toContainText("3 z 3");
  await expect(page.getByRole("link", { name: "Spróbuj drugiego widoku" })).toHaveCount(0);
  results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).analyze();
  expect(results.violations).toEqual([]);
  await page.screenshot({ path: "artifacts/fact-card-compare-desktop.png", fullPage: true });

  const stored = await page.evaluate((key) => localStorage.getItem(key)!, STORAGE_KEY);
  expect(stored).not.toContain("historical");
  expect(stored).not.toContain("postInterviewDecision");

  await page.setViewportSize({ width: 390, height: 844 });
  await noHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/fact-card-compare-mobile.png", fullPage: true });
  await page.goto("/#/app/kandydaci?widok=b");
  await expect(page.getByText("W tym widoku zaproszenia zostały już wysłane.")).toBeVisible();
  await noHorizontalOverflow(page);
  await page.screenshot({ path: "artifacts/fact-card-list-b-mobile.png", fullPage: true });
  await page.goto("/#/app/kandydaci/K06?widok=b");
  await noHorizontalOverflow(page);
  const tabs = await page
    .locator(".record-tab")
    .evaluateAll((items) => items.map((item) => item.getBoundingClientRect().right <= innerWidth));
  expect(tabs).toEqual([true, true, true, true]);
  await page.goto("/#/app/kandydaci/wynik?widok=a");

  await page.getByRole("button", { name: "Zacznij od nowa", exact: true }).click();
  await page.getByRole("button", { name: "Anuluj", exact: true }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
  await expect(page.locator(".trial-result-headline")).toBeVisible();
  await page.getByRole("button", { name: "Zacznij od nowa", exact: true }).click();
  await page.getByRole("alertdialog").getByRole("button", { name: "Zacznij od nowa" }).click();
  await expect(page).toHaveURL(/#\/app\/kandydaci\?widok=a$/);
  await expect(page.getByRole("status").filter({ hasText: "Wybrano" })).toContainText(
    "Wybrano 0 z 3",
  );
  await page.goto("/#/app/kandydaci/wynik?widok=b");
  await expect(page).toHaveURL(/#\/app\/kandydaci\?widok=b$/);
  expect(errors).toEqual([]);
});

test("version 1 saves keep their data and gain the Punkt Labs recruiter", async ({ page }) => {
  const current = initialState();
  const legacy = {
    ...current,
    factCardTrial: undefined,
    version: 1,
    activePersonId: "candidate-anna",
    companies: current.companies.filter((x) => x.id !== PUNKT_LABS_COMPANY_ID),
    jobs: current.jobs.filter((x) => x.companyId !== PUNKT_LABS_COMPANY_ID),
    people: current.people.filter((x) => x.id !== PUNKT_LABS_RECRUITER_ID),
  };
  legacy.people[0].bio = "Profil sprzed aktualizacji";
  await page.goto("/");
  await page.evaluate(({ key, raw }) => localStorage.setItem(key, raw), {
    key: STORAGE_KEY,
    raw: JSON.stringify(legacy),
  });
  await page.reload();
  await page.goto("/#/app/profil");
  await expect(page.getByRole("textbox", { name: "O mnie", exact: true })).toHaveValue(
    "Profil sprzed aktualizacji",
  );
  await chooseEwa(page);
  expect(
    await page.evaluate((key) => JSON.parse(localStorage.getItem(key)!).version, STORAGE_KEY),
  ).toBe(2);
  await pick(page, ["Kamil Wróbel"]);
  await page.goto("/#/app/oferty");
  await expect(page.getByText(trialFixture.job.title)).toBeVisible();
  await expect(page.getByText(/Wygasła/)).toBeVisible();
  await page.goto("/#/oferty");
  await expect(page.getByText(trialFixture.job.title)).toHaveCount(0);
});

test("other employers keep their own candidate list and cannot open the Punkt Labs result", async ({
  page,
}) => {
  await page.goto("/#/auth/sign-in");
  await page.getByRole("button", { name: "Wejdź jako Karolina Wiśniewska", exact: true }).click();
  await page.goto("/#/app/kandydaci");
  await expect(page.getByRole("link", { name: "Marek Nowak", exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Zaproś na rozmowę" })).toHaveCount(0);
  await page.goto("/#/app/kandydaci/wynik?widok=a");
  await expect(page.getByRole("heading", { name: "Nie znaleziono strony" })).toBeVisible();
  await page.goto("/#/app/kandydaci/K01");
  await expect(page.getByRole("heading", { name: "Nie znaleziono strony" })).toBeVisible();
});
