import { chromium } from 'playwright';
import { writeFileSync } from 'fs';

const base = 'https://xenpaid.com';
const browser = await chromium.launch();
const page = await browser.newPage();

const report = { pages: [] };

async function snapshot(path, name) {
  const url = path.startsWith('http') ? path : `${base}${path}`;
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(1500);

    const forms = await page.locator('form').evaluateAll((forms) =>
      forms.map((f, i) => ({
        index: i,
        action: f.getAttribute('action'),
        method: f.getAttribute('method'),
        id: f.id,
        name: f.getAttribute('name'),
      })),
    );

    const inputs = await page.locator('input, textarea, select').evaluateAll((els) =>
      els.map((el) => ({
        tag: el.tagName.toLowerCase(),
        type: el.getAttribute('type') || '',
        name: el.getAttribute('name') || '',
        id: el.id || '',
        placeholder: el.getAttribute('placeholder') || '',
        label: el.labels?.[0]?.textContent?.trim() || el.getAttribute('aria-label') || '',
        required: el.required,
        testId: el.getAttribute('data-testid') || '',
      })),
    );

    const buttons = await page.locator('button, input[type=submit], a.btn, [role=button]').evaluateAll((els) =>
      els
        .map((el) => ({
          tag: el.tagName.toLowerCase(),
          type: el.getAttribute('type') || '',
          text: (el.textContent || el.value || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 80),
          href: el.getAttribute('href') || '',
        }))
        .filter((b) => b.text.length > 0),
    );

    const links = await page.locator('nav a, header a, footer a').evaluateAll((els) =>
      [...new Set(els.map((a) => ({ text: a.textContent?.trim().replace(/\s+/g, ' ').slice(0, 60), href: a.getAttribute('href') })))],
    );

    const headings = await page.locator('h1, h2, h3').evaluateAll((els) =>
      els.map((h) => ({ level: h.tagName, text: h.textContent?.trim().replace(/\s+/g, ' ').slice(0, 120) })),
    );

    report.pages.push({
      name,
      url: page.url(),
      title: await page.title(),
      headings,
      forms,
      inputs,
      buttons: buttons.slice(0, 40),
      navLinks: links.filter((l) => l.text).slice(0, 30),
    });
  } catch (e) {
    report.pages.push({ name, url, error: String(e) });
  }
}

const paths = [
  ['/', 'Home'],
  ['/login', 'Login'],
  ['/register', 'Register'],
  ['/signup', 'Signup alias'],
  ['/how-it-works', 'How it works'],
  ['/faq', 'FAQ'],
  ['/about', 'About'],
  ['/contact', 'Contact'],
];

for (const [path, name] of paths) {
  await snapshot(path, name);
}

writeFileSync('scripts/xenpaid-explore.json', JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
await browser.close();
