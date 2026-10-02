import { test, expect } from '@playwright/test';

test('login Mente Tester', async ({ page }) => {
  await page.goto('https://mentetester.com/login');

  const email = process.env.MENTETESTER_EMAIL ?? 'estudiante@mentetester.com';
  const password = process.env.MENTETESTER_PASSWORD;
  test.skip(!password, 'Define MENTETESTER_PASSWORD en .env para ejecutar este test');

  await page.getByTestId('mt-input-login-email').fill(email);
  await page.getByTestId('mt-input-login-password').fill(password);
  await page.getByRole('button', { name: 'Entrar' }).click();

  await expect(page).toHaveURL('https://mentetester.com/', { timeout: 15000 });
  await expect(page).toHaveTitle(/Inicio · Mente Tester/);
});
