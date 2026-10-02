import { chromium } from 'playwright';

const browser = await chromium.launch();
const page = await browser.newPage();

async function extra(url) {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 45000 });
  await page.waitForTimeout(1000);

  const ctas = await page.locator('a, button').evaluateAll((els) =>
    els
      .map((el) => ({
        tag: el.tagName.toLowerCase(),
        text: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 70),
        href: el.getAttribute('href') || '',
      }))
      .filter((x) => x.text && x.text.length > 1),
  );

  const faqItems = await page.locator('[class*="faq"], details, [data-state]').count();
  const loginLinks = await page.locator('a').evaluateAll((as) =>
    as.map((a) => ({ text: a.textContent?.trim(), href: a.href })).filter((x) => x.text),
  );

  return { url: page.url(), ctas: ctas.slice(0, 50), faqCount: faqItems, links: loginLinks.slice(0, 20) };
}

const results = {};
results.homeHero = await extra('https://xenpaid.com/');
results.login = await extra('https://xenpaid.com/login');
results.register = await extra('https://xenpaid.com/register');
results.contact = await extra('https://xenpaid.com/contact');
results.token = await extra('https://xenpaid.com/token');
results.terms = await extra('https://xenpaid.com/terms');
results.privacy = await extra('https://xenpaid.com/privacy');

console.log(JSON.stringify(results, null, 2));
await browser.close();
