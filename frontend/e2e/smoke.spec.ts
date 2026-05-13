import { expect, test } from "@playwright/test";

test("landing, catalogue et connexion", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  await page.goto("/catalogue");
  await expect(page.getByRole("heading", { name: /Parcourir les ouvrages/i })).toBeVisible();

  await page.goto("/connexion");
  await page.getByLabel("Email ou identifiant").fill("etudiant@dit.local");
  await page.getByLabel("Mot de passe").fill("dit123");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL(/\/espace/);
});
