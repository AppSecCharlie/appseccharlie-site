import { test, expect } from '@playwright/test';

const analyticsUrlPattern = /^https:\/\/[^/]*(?:google-analytics|googletagmanager)\.com\//;

test.beforeEach(async ({ page }) => {
  await page.route(analyticsUrlPattern, async (route) => {
    if (route.request().url().includes('googletagmanager.com')) {
      await route.fulfill({ contentType: 'application/javascript', body: '' });
    } else {
      await route.abort('blockedbyclient');
    }
  });
});

async function expectPrimaryNavigation(page) {
  const navigation = page.getByRole('navigation', { name: 'Primary' });
  await expect(navigation.getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/');
  await expect(navigation.getByRole('link', { name: 'Field Notes' })).toHaveAttribute('href', '/field-notes/');
}

test('navigates between Home and the production Field Notes index', async ({ page }) => {
  await page.goto('/');
  await expectPrimaryNavigation(page);
  await page.getByRole('link', { name: 'Field Notes' }).click();

  await expect(page).toHaveURL(/\/field-notes\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Field Notes');
  await expectPrimaryNavigation(page);
  await expect(page.getByRole('link', { name: 'Turning Judgment into Infrastructure' })).toHaveCount(0);

  await page.getByRole('link', { name: 'Home' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('publishes Field Notes index metadata using the site URL pattern', async ({ page }) => {
  await page.goto('/field-notes/');
  await expect(page).toHaveTitle('Field Notes | Charlie Williams');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    'Short notes from work on security, software, trust, and AI.'
  );
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
    'href',
    'https://appseccharlie.com/field-notes/'
  );
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'website');
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`Field Notes index has no browser errors or horizontal overflow on ${viewport.name}`, async ({ page }) => {
    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', (error) => pageErrors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.setViewportSize(viewport);

    const response = await page.goto('/field-notes/');
    expect(response?.ok()).toBe(true);
    await page.evaluate(() => document.fonts.ready);
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(viewport.width);
    await page.screenshot({
      path: `test-artifacts/screenshots/field-notes-index-${viewport.name}.png`,
      fullPage: true
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
