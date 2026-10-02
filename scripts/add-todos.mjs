import { chromium } from 'playwright';

const todos = ['Comprar comida', 'Estudiar Playwright', 'Aprender MCP'];

const browser = await chromium.launch({ headless: false });
const page = await browser.newPage();
await page.goto('https://demo.playwright.dev/todomvc');

const input = page.getByPlaceholder('What needs to be done?');
for (const text of todos) {
  await input.fill(text);
  await input.press('Enter');
}

await page.waitForTimeout(2000);
await browser.close();
