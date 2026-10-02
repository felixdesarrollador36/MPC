import { test, expect } from '@playwright/test';

const BASE = 'https://xenpaid.com';

test.describe('XenPaid — smoke público', () => {
  test('home carga y muestra propuesta principal', async ({ page }) => {
    await page.goto(BASE);

    await expect(page).toHaveTitle(/XenPaid/);
    await expect(
      page.getByRole('heading', { name: /Get rewarded for being part of a growing community/i }),
    ).toBeVisible();
    await expect(page.getByRole('link', { name: 'Create free account' }).first()).toBeVisible();
  });

  test('secciones How it works y FAQ existen y son enlazables', async ({ page }) => {
    await page.goto(`${BASE}/#how`);
    await expect(page.getByRole('heading', { name: /Start in four steps/i })).toBeVisible();

    await page.goto(`${BASE}/#faq`);
    await expect(page.getByRole('heading', { name: /Questions, answered/i })).toBeVisible();

    await page.goto(BASE);
    await expect(page.getByRole('link', { name: 'How it works' }).first()).toHaveAttribute('href', '/#how');
    await expect(page.getByRole('link', { name: 'FAQ' }).first()).toHaveAttribute('href', '/#faq');
  });

  test('páginas corporativas responden correctamente', async ({ page }) => {
    const pages = [
      { path: '/about', title: /About us — XenPaid/, heading: /About XenPaid/i },
      { path: '/contact', title: /Contact — XenPaid/, heading: /Contact us/i },
      { path: '/terms', title: /XenPaid/, heading: /.+/ },
      { path: '/privacy', title: /XenPaid/, heading: /.+/ },
      { path: '/token', title: /XenPaid/, heading: /.+/ },
    ];

    for (const { path, title, heading } of pages) {
      await page.goto(`${BASE}${path}`);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole('heading').first()).toContainText(heading);
    }
  });

  test.describe('rutas legacy (defecto conocido: 404)', () => {
    for (const path of ['/how-it-works', '/faq', '/signup']) {
      test(`${path} devuelve 404 hoy`, async ({ page }) => {
        const response = await page.goto(`${BASE}${path}`);
        expect(response?.status()).toBe(404);
        await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
      });
    }
  });
});

test.describe('XenPaid — login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
  });

  test('formulario de login visible', async ({ page }) => {
    await expect(page.getByPlaceholder('Username or User ID')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
  });

  test('enlaces de recuperación y registro', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Forgot User ID?' })).toHaveAttribute('href', '/forgot-id');
    await expect(page.getByRole('link', { name: 'Forgot Password?' })).toHaveAttribute('href', '/forgot');
    await expect(page.getByRole('link', { name: 'Create Account' })).toHaveAttribute('href', '/register');
  });

  test('credenciales inválidas no acceden al dashboard', async ({ page }) => {
    await page.getByPlaceholder('Username or User ID').fill('invalid_user_qa');
    await page.getByPlaceholder('Enter your password').fill('WrongPass123!');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
  });
});

test.describe('XenPaid — registro', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`);
  });

  test('campos obligatorios del formulario', async ({ page }) => {
    await expect(page.getByPlaceholder("Sponsor's username or ID")).toBeVisible();
    await expect(page.getByPlaceholder('Your full name')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. rahul99 (login & referral link)')).toBeVisible();
    await expect(page.getByPlaceholder('you@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. +84912345678')).toBeVisible();
    await expect(page.getByPlaceholder('Min 6 characters')).toBeVisible();
    await expect(page.getByPlaceholder('Repeat your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('honeypot anti-spam no es accesible al usuario', async ({ page }) => {
    const honeypot = page.locator('input[name="website"]');
    await expect(honeypot).toHaveCount(1);
    await expect(honeypot).toHaveAttribute('aria-hidden', 'true');
    await expect(honeypot).toHaveAttribute('tabindex', '-1');
  });

  test('selector de idioma y enlace a login', async ({ page }) => {
    await expect(page.getByRole('button', { name: /English/i })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/login');
  });
});

test.describe('XenPaid — recuperación de cuenta', () => {
  test('forgot password muestra campos esperados', async ({ page }) => {
    await page.goto(`${BASE}/forgot`);

    await expect(page.getByPlaceholder('BA1234567')).toBeVisible();
    await expect(page.getByPlaceholder('you@email.com')).toBeVisible();
    await expect(page.getByPlaceholder(/10 digit mobile number/i)).toBeVisible();
    await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible();
  });

  test('forgot user id muestra campo móvil', async ({ page }) => {
    await page.goto(`${BASE}/forgot-id`);

    await expect(page.getByPlaceholder('e.g. 0912345678')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Find User ID' })).toBeVisible();
  });
});
