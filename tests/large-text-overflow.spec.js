import { test, expect } from '@playwright/test';

const analyticsUrlPattern = /^https:\/\/[^/]*(?:google-analytics|googletagmanager)\.com\//;
const publishedPages = [
  '/',
  '/field-notes/',
  '/field-notes/the-afterlife-of-a-bug-report/',
  '/field-notes/turning-judgment-into-infrastructure/'
];

test('published pages do not overflow at a 390px viewport with Chromium default text set to 32px', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  await page.route(analyticsUrlPattern, async (route) => {
    if (route.request().url().includes('googletagmanager.com')) {
      await route.fulfill({ contentType: 'application/javascript', body: '' });
    } else {
      await route.abort('blockedbyclient');
    }
  });

  await page.setViewportSize({ width: 390, height: 844 });
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Page.setFontSizes', { fontSizes: { standard: 32, fixed: 32 } });

  for (const path of publishedPages) {
    const response = await page.goto(path);
    expect(response?.ok(), path).toBe(true);
    await page.evaluate(() => document.fonts.ready);

    const dimensions = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth
    }));
    expect(dimensions.scrollWidth, path).toBeLessThanOrEqual(dimensions.viewportWidth);
  }

  expect(browserErrors).toEqual([]);
});
