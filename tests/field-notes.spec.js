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
  const header = page.locator('.site-header');
  const navigation = header.getByRole('navigation', { name: 'Primary' });
  await expect(header.getByRole('link', { name: 'Charlie Williams' })).toHaveAttribute('href', '/');
  await expect(header).not.toContainText('Technical Security Leader');
  await expect(navigation.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/#about');
  await expect(navigation.getByRole('link', { name: 'Field Notes' })).toHaveAttribute('href', '/field-notes/');
}

async function expectStickyHeader(page) {
  const header = page.locator('.site-header');
  await expect(header).toHaveCSS('position', 'sticky');
  await expect(header).toHaveCSS('top', '0px');
  await expect(header).toHaveCSS('background-color', 'rgb(244, 241, 232)');
  await expect(header).toHaveCSS('box-shadow', 'none');
}

test('navigates between Home and the production Field Notes index', async ({ page }) => {
  await page.goto('/');
  await expectPrimaryNavigation(page);
  await page.getByRole('link', { name: 'Field Notes' }).click();

  await expect(page).toHaveURL(/\/field-notes\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Field Notes');
  await expectPrimaryNavigation(page);
  await expect(page.getByRole('link', { name: 'Field Notes' })).toHaveClass(/is-active/);
  await expect(page.getByRole('link', { name: 'Field Notes' })).toHaveAttribute('aria-current', 'page');
  await expect(page.getByRole('link', { name: 'Turning Judgment into Infrastructure' })).toHaveCount(1);

  await page.getByRole('link', { name: 'Charlie Williams' }).click();
  await expect(page).toHaveURL(/\/$/);
});

test('Field Notes header has a sensible keyboard order', async ({ page }) => {
  await page.goto('/field-notes/');

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Charlie Williams' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'About' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Field Notes' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Turning Judgment into Infrastructure' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.locator('.contact-links').getByRole('link', { name: 'Email' })).toBeFocused();
});

test('Field Notes keeps the homepage signature out and includes the shared contact footer', async ({ page }) => {
  await page.goto('/field-notes/');

  await expect(page.locator('.visual-signature')).toHaveCount(0);
  await expect(page.locator('.routes-strip')).toHaveCount(0);
  const footer = page.locator('.site-footer');
  await expect(footer.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:this@appseccharlie.com');
  await expect(footer.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', 'https://linkedin.com/in/charlie-williams3');
  await expect(footer.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', 'https://github.com/appseccharlie');
  await expect(footer.getByRole('link', { name: 'X (Twitter)' })).toHaveAttribute('href', 'https://x.com/AppSecCharlie');
});

test('Field Notes index and article keep the shared header sticky without homepage routes', async ({ page }) => {
  for (const [path, shouldScroll] of [
    ['/field-notes/', false],
    ['/field-notes/turning-judgment-into-infrastructure/', true]
  ]) {
    await page.goto(path);
    await expectStickyHeader(page);
    await expect(page.locator('.routes-strip')).toHaveCount(0);

    if (shouldScroll) {
      await page.locator('.site-footer').scrollIntoViewIfNeeded();
      expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(200);
      expect(Math.abs(await page.locator('.site-header').evaluate((element) => element.getBoundingClientRect().top)))
        .toBeLessThanOrEqual(1);
      await expect(page.locator('.site-name')).toBeVisible();
      await expect(page.locator('.site-nav')).toBeVisible();
    }
  }
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

test('Field Notes index and article use deterministic journal metadata and approved copy', async ({ page }) => {
  await page.goto('/field-notes/');

  const summary = page.locator('.note-summary').first();
  await expect(summary.locator('.note-number')).toHaveText('FIELD NOTE 001');
  await expect(summary.locator('time')).toHaveText('06 SEP 2026');
  await summary.getByRole('link', { name: 'Turning Judgment into Infrastructure' }).click();

  await expect(page).toHaveURL(/\/field-notes\/turning-judgment-into-infrastructure\/$/);
  await expect(page.locator('.note-number')).toHaveText('FIELD NOTE 001');
  await expect(page.locator('.field-note header time')).toHaveText('06 SEP 2026');
  await expect(page.locator('.note-dek')).toHaveText('Encoding the repeatable parts of expert judgment into systems that can apply them consistently over time.');
  await expect(page.locator('.note-body')).toContainText('A lot of repeated work starts at the task layer: answer this question, review this change, make this decision.');
  await expect(page.locator('.note-body strong')).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'Back to Field Notes' })).toHaveAttribute('href', '/field-notes/');
  await expect(page.getByRole('link', { name: 'Field Notes', exact: true })).toHaveClass(/is-active/);
  await expect(page.getByRole('link', { name: 'Field Notes', exact: true })).not.toHaveAttribute('aria-current', 'page');
});

test('Field Notes use the paper palette, editorial measure, and sans/serif/mono type roles', async ({ page }) => {
  await page.goto('/field-notes/turning-judgment-into-infrastructure/');

  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 241, 232)');
  expect(await page.locator('.field-note h1').evaluate((element) => getComputedStyle(element).fontFamily))
    .toMatch(/Iowan Old Style|Palatino Linotype|Book Antiqua|Georgia/);
  expect(await page.locator('.note-meta').evaluate((element) => getComputedStyle(element).fontFamily))
    .toMatch(/ui-monospace|SFMono-Regular|Cascadia Code|Consolas/);
  const articleWidth = await page.locator('.note-body').evaluate((element) => element.getBoundingClientRect().width);
  expect(articleWidth).toBeLessThanOrEqual(720);
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
    await expect(page.locator('.site-descriptor')).toHaveCount(0);
    expect(await page.locator('.site-header').evaluate((element) => element.getBoundingClientRect().height))
      .toBeLessThanOrEqual(64);
    await page.screenshot({
      path: `test-artifacts/screenshots/field-notes-index-${viewport.name}.png`,
      fullPage: true
    });

    const articleResponse = await page.goto('/field-notes/turning-judgment-into-infrastructure/');
    expect(articleResponse?.ok()).toBe(true);
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(viewport.width);
    await page.screenshot({
      path: `test-artifacts/screenshots/field-note-001-${viewport.name}.png`,
      fullPage: true
    });

    expect(pageErrors).toEqual([]);
    expect(consoleErrors).toEqual([]);
  });
}
