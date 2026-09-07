import { test, expect } from '@playwright/test';

const analyticsUrlPattern = /^https:\/\/[^/]*(?:google-analytics|googletagmanager)\.com\//;
const analyticsCollectionUrlPattern = /^https:\/\/[^/]*google-analytics\.com\/.*collect/;
const interceptedAnalyticsRequests = new WeakMap();

test.beforeEach(async ({ page }) => {
  const interceptedRequests = [];
  interceptedAnalyticsRequests.set(page, interceptedRequests);
  await page.route(analyticsUrlPattern, async (route) => {
    const url = route.request().url();
    interceptedRequests.push(url);
    if (url.includes('googletagmanager.com')) {
      await route.fulfill({ contentType: 'application/javascript', body: '' });
    } else {
      await route.abort('blockedbyclient');
    }
  });
});

const expectedCapabilities = [
  'Product & Application Security',
  'AI & Agent Security',
  'Security Platforms & Data',
  'Trust, Fraud & Abuse',
  'Identity & Authorization'
];

const expectedCapabilityGroups = [
  ['Product & Application Security', 'Secure architecture + threat modeling', 'Code + software supply-chain security', 'Developer guardrails + secure defaults'],
  ['AI & Agent Security', 'MCP + agent trust boundaries', 'Delegated authority + permissions', 'Governance + observability'],
  ['Security Platforms & Data', 'Policy-as-code + automation', 'Security telemetry + data models', 'Developer workflows + decision-grade metrics'],
  ['Trust, Fraud & Abuse', 'Account trust + recovery', 'Fraud + abuse signals', 'Risk states + high-risk product controls'],
  ['Identity & Authorization', 'Authentication + authorization', 'Identity + access controls', 'Delegated permissions + least privilege']
];

const expectedExperience = [
  ['Manager, Product Security', 'April 2026 – Present'],
  ['Staff Application Security Manager', 'October 2025 – March 2026'],
  ['Staff Application Security Engineer', 'January 2024 – September 2025'],
  ['Senior Application Security Engineer II', 'April 2023 – December 2023'],
  ['Lead Engineer', 'January 2016 – April 2023']
];

const expectedSocialLinks = [
  ['Email', 'mailto:this@appseccharlie.com'],
  ['LinkedIn', 'https://linkedin.com/in/charlie-williams3'],
  ['GitHub', 'https://github.com/appseccharlie'],
  ['X (Twitter)', 'https://x.com/AppSecCharlie']
];

const expectedSummary = [
  'I lead Product Security at Upside, with a background in Application Security and security engineering. I stay hands-on in architecture and engineering while managing the team, with current work spanning AppSec, authentication and account trust, AI security and enablement, and the data and automation behind those programs.',
  'My work often starts with ambiguity: understanding the problem, gathering enough evidence to make a decision, and turning that into systems, controls, and workflows that hold up in practice. A recurring theme is the trust boundary: what people, services, or agents are allowed to do, and under what conditions. Those boundaries increasingly cut across traditional security domains and org charts.'
];

async function loadPage(page) {
  const response = await page.goto('/');
  expect(response?.ok()).toBe(true);
  await page.evaluate(() => document.fonts.ready);
}

test('homepage loads without uncaught errors and applies its production stylesheet', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));

  await loadPage(page);

  await expect(page.getByRole('heading', { level: 1 })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Charlie Williams' })).toHaveCount(0);
  await expect(page.locator('body')).toHaveCSS('background-color', 'rgb(244, 241, 232)');
  await expect(page.locator('body')).toHaveCSS('color', 'rgb(32, 32, 30)');
  await expect(page.locator('link[href*="fonts.googleapis.com"]')).toHaveCount(0);
  expect(await page.evaluate(() => typeof window.gtag)).toBe('function');
  expect(await page.evaluate(() => Array.isArray(window.dataLayer))).toBe(true);
  expect(browserErrors).toEqual([]);
});

test('shared header identifies the site and links to About and Field Notes', async ({ page }) => {
  await loadPage(page);

  const header = page.locator('.site-header');
  await expect(header.getByRole('link', { name: 'Charlie Williams' })).toHaveAttribute('href', '/');
  await expect(header).not.toContainText('Technical Security Leader');
  await expect(header.getByRole('link', { name: 'About' })).toHaveAttribute('href', '/#about');
  await expect(header.getByRole('link', { name: 'Field Notes' })).toHaveAttribute('href', '/field-notes/');
  await expect(page.locator('#about')).toHaveCount(1);
});

test('blocks production Google Analytics traffic during browser tests', async ({ page }) => {
  const collectionResponses = [];
  const consoleErrors = [];
  page.on('response', (response) => {
    if (analyticsCollectionUrlPattern.test(response.url())) collectionResponses.push(response.url());
  });
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await loadPage(page);

  expect(interceptedAnalyticsRequests.get(page).length).toBeGreaterThan(0);
  expect(collectionResponses).toEqual([]);
  expect(consoleErrors).toEqual([]);
});

test('renders current positioning, capabilities, and complete work history', async ({ page }) => {
  await loadPage(page);

  await expect(page.locator('.section-label')).toHaveText([
    'FIELD 01 / PROFILE',
    'FIELD 02 / CAPABILITIES',
    'FIELD 03 / EXPERIENCE'
  ]);
  await expect(page.locator('.visual-signature, .slider-container, .icon-list, .vslide')).toHaveCount(0);
  await expect(page.locator('.summary h2:not(.section-label)')).toHaveCount(0);
  await expect(page.locator('.summary .supporting-positioning')).toHaveText('AppSec · AI Security · Identity & Trust');
  await expect(page.getByRole('heading', { name: 'FIELD 02 / CAPABILITIES' })).toHaveCSS('text-transform', 'uppercase');
  await expect(page.getByRole('heading', { name: 'Work Experience' })).toHaveCSS('text-transform', 'uppercase');
  await expect(page.locator('.summary > p:not(.supporting-positioning):not(.section-label)')).toHaveText(expectedSummary);
  await expect(page.locator('.work-experience')).toContainText('Manager, Product Security');
  await expect(page.locator('main')).not.toContainText('Staff Security Engineer');

  await expect(page.locator('.skills b')).toHaveText(expectedCapabilities);
  expect(await page.locator('.skills > div').evaluateAll((groups) => groups.map((group) =>
    [...group.querySelectorAll('span')].map((line) => line.textContent.trim())
  ))).toEqual(expectedCapabilityGroups);

  const experiences = page.locator('.experience');
  await expect(experiences).toHaveCount(expectedExperience.length);
  for (const [index, [role, dates]] of expectedExperience.entries()) {
    await expect(experiences.nth(index).locator('h4')).toHaveText(role);
    await expect(experiences.nth(index).locator('.dates')).toHaveText(dates);
  }
  await expect(experiences.nth(0)).toContainText('authentication and account-trust architecture');
  await expect(page.getByRole('heading', { name: 'Staff Application Security Engineer', exact: true })).toBeVisible();
  await expect(experiences.last().locator('h5')).toHaveText('Application Security');
});

test('renders the expected contact destinations in the shared footer', async ({ page }) => {
  await loadPage(page);

  const footer = page.locator('.site-footer');
  for (const [label, href] of expectedSocialLinks) {
    await expect(footer.getByRole('link', { name: label })).toHaveAttribute('href', href);
  }
});

test('header and footer links have a sensible keyboard order and visible focus', async ({ page }) => {
  await loadPage(page);

  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Charlie Williams' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'About' })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Field Notes' })).toBeFocused();

  const links = page.locator('.contact-links a');
  for (let index = 0; index < await links.count(); index += 1) {
    await page.keyboard.press('Tab');
    await expect(links.nth(index)).toBeFocused();
    await page.waitForTimeout(250);

    expect(await links.nth(index).evaluate((element) => {
      const styles = getComputedStyle(element);
      return {
        backgroundColor: styles.backgroundColor,
        outlineColor: styles.outlineColor,
        outlineStyle: styles.outlineStyle,
        outlineWidth: styles.outlineWidth
      };
    })).toEqual({
      backgroundColor: 'rgb(244, 241, 232)',
      outlineColor: 'rgb(49, 95, 141)',
      outlineStyle: 'solid',
      outlineWidth: '3px'
    });
  }
});

test('footer links retain readable text contrast on hover', async ({ page }) => {
  await loadPage(page);

  const links = page.locator('.contact-links a');
  for (let index = 0; index < await links.count(); index += 1) {
    const link = links.nth(index);
    await link.hover();

    await expect.poll(() => link.evaluate((element) => {
      const parseRgb = (color) => color.match(/\d+(?:\.\d+)?/g).slice(0, 3).map(Number);
      const luminance = (color) => {
        const channels = parseRgb(color).map((channel) => {
          const normalized = channel / 255;
          return normalized <= 0.04045
            ? normalized / 12.92
            : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return (0.2126 * channels[0]) + (0.7152 * channels[1]) + (0.0722 * channels[2]);
      };
      const styles = getComputedStyle(element);
      const foreground = luminance(styles.color);
      const background = luminance(styles.backgroundColor);

      return (Math.max(foreground, background) + 0.05)
        / (Math.min(foreground, background) + 0.05);
    })).toBeGreaterThanOrEqual(4.5);
  }
});

test('uses numbered field metadata instead of the former animated signature', async ({ page }) => {
  await loadPage(page);

  await expect(page.locator('.visual-signature, .slider-container, .carousel-accessible-label, .icon-list')).toHaveCount(0);
  const labels = page.locator('.section-label');
  await expect(labels).toHaveCount(3);
  expect(await labels.evaluateAll((elements) => elements.every((element) => {
    const styles = getComputedStyle(element);
    return styles.textAlign === 'start'
      && styles.textTransform === 'uppercase'
      && styles.color === 'rgb(102, 100, 95)'
      && /ui-monospace|SFMono-Regular|Cascadia Code|Consolas/.test(styles.fontFamily);
  }))).toBe(true);
});

test('uses the accent for capability and job-title scan points while experience context stays neutral', async ({ page }) => {
  await loadPage(page);

  const accent = 'rgb(49, 95, 141)';
  const ink = 'rgb(32, 32, 30)';

  expect(await page.locator('.skills b').evaluateAll((elements) =>
    elements.every((element) => getComputedStyle(element).color === 'rgb(49, 95, 141)')
  )).toBe(true);
  expect(await page.locator('.work-experience h4').evaluateAll((elements) =>
    elements.every((element) => getComputedStyle(element).color === 'rgb(49, 95, 141)')
  )).toBe(true);

  for (const selector of ['.skills span', '.work-experience h3', '.work-experience h5', '.work-experience .dates', '.work-experience p']) {
    expect(await page.locator(selector).evaluateAll((elements) =>
      elements.every((element) => getComputedStyle(element).color === 'rgb(32, 32, 30)')
    ), `${selector} should use ink`).toBe(true);
  }

  await expect(page.locator('.skills b').first()).toHaveCSS('color', accent);
  await expect(page.locator('.work-experience h4').first()).toHaveCSS('color', accent);
  await expect(page.locator('.work-experience h3').first()).toHaveCSS('color', ink);
});

test('capability grid uses a balanced 3 + 2 desktop layout with readable responsive fallbacks', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 }
  ]) {
    await page.setViewportSize(viewport);
    await loadPage(page);

    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(viewport.width);

    const layout = await page.locator('.skills').evaluate((grid) => {
      const gridBox = grid.getBoundingClientRect();
      return {
        gridLeft: gridBox.left,
        gridRight: gridBox.right,
        gridCenter: gridBox.left + (gridBox.width / 2),
        groups: [...grid.children].map((group) => {
          const box = group.getBoundingClientRect();
          return {
            left: box.left,
            right: box.right,
            width: box.width,
            top: box.top,
            textAlign: getComputedStyle(group).textAlign
          };
        })
      };
    });
    expect(layout.groups.every(({ textAlign }) => textAlign === 'left')).toBe(true);

    const rowCount = new Set(layout.groups.map(({ top }) => Math.round(top))).size;
    if (viewport.width >= 1024) {
      expect(rowCount).toBe(2);
      expect(Math.max(...layout.groups.slice(0, 3).map(({ top }) => top))
        - Math.min(...layout.groups.slice(0, 3).map(({ top }) => top))).toBeLessThanOrEqual(1);
      expect(Math.abs(
        ((layout.groups[3].left + layout.groups[4].right) / 2) - layout.gridCenter
      )).toBeLessThanOrEqual(1);
    } else if (viewport.width >= 768) {
      expect(rowCount).toBe(3);
      expect(Math.abs(
        ((layout.groups[4].left + layout.groups[4].right) / 2) - layout.gridCenter
      )).toBeLessThanOrEqual(1);
    } else {
      expect(rowCount).toBe(5);
      expect(Math.max(...layout.groups.map(({ left }) => left))
        - Math.min(...layout.groups.map(({ left }) => left))).toBeLessThanOrEqual(1);
      expect(Math.max(...layout.groups.map(({ width }) => width))
        - Math.min(...layout.groups.map(({ width }) => width))).toBeLessThanOrEqual(1);
      expect(layout.groups.every(({ left, right }) => (
        Math.abs(left - layout.gridLeft) <= 1 && Math.abs(right - layout.gridRight) <= 1
      ))).toBe(true);
    }
  }
});

test('FIELD markers use consistent content spacing and Profile flows into Capabilities', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await loadPage(page);

  const spacing = await page.evaluate(() => {
    const profileParagraph = document.querySelector('.summary > p:not(.supporting-positioning):not(.section-label):last-child');
    const capabilitiesLabel = document.querySelector('.capabilities > .section-label');
    const firstCapability = document.querySelector('.skills > div');
    const experienceLabel = document.querySelector('.work-experience > .section-label');
    const firstExperience = document.querySelector('.work-experience > .experience');
    const firstExperienceTitle = firstExperience.querySelector('.experience-title');

    return {
      profileToCapabilities: capabilitiesLabel.getBoundingClientRect().top - profileParagraph.getBoundingClientRect().bottom,
      capabilitiesLabelToRule: firstCapability.getBoundingClientRect().top - capabilitiesLabel.getBoundingClientRect().bottom,
      experienceLabelToContent: firstExperienceTitle.getBoundingClientRect().top - experienceLabel.getBoundingClientRect().bottom,
      firstExperienceBorderWidth: getComputedStyle(firstExperience).borderBlockStartWidth
    };
  });

  expect.soft(spacing.profileToCapabilities).toBeGreaterThanOrEqual(36);
  expect.soft(spacing.profileToCapabilities).toBeLessThanOrEqual(40);
  expect.soft(Math.abs(spacing.capabilitiesLabelToRule - spacing.experienceLabelToContent)).toBeLessThanOrEqual(1);
  expect(spacing.firstExperienceBorderWidth).toBe('0px');
});

test('About prose and positioning line use a left-aligned readable measure', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 }
  ]) {
    await page.setViewportSize(viewport);
    await loadPage(page);

    const prose = page.locator('.summary > p:not(.supporting-positioning):not(.section-label)');
    expect(await prose.evaluateAll(
      (paragraphs) => paragraphs.every((paragraph) =>
        getComputedStyle(paragraph).textAlign === 'left'
      )
    )).toBe(true);
    await expect(page.locator('.summary .supporting-positioning')).toHaveCSS('text-align', 'left');
    const measure = await prose.first().evaluate((element) => element.getBoundingClientRect().width);
    expect(measure).toBeLessThanOrEqual(850);
    expect(await prose.first().evaluate((element) => getComputedStyle(element).fontFamily))
      .toMatch(/Iowan Old Style|Palatino Linotype|Book Antiqua|Georgia/);
    const fontSize = Number.parseFloat(await prose.first().evaluate((element) => getComputedStyle(element).fontSize));
    if (viewport.width <= 390) {
      expect(fontSize).toBeGreaterThanOrEqual(16);
      expect(fontSize).toBeLessThanOrEqual(16.4);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth))
      .toBeLessThanOrEqual(viewport.width);
  }
});

test('Work Experience continues the editorial alignment without a slide-like gap', async ({ page }) => {
  await loadPage(page);

  const heading = page.getByRole('heading', { name: 'Work Experience' });
  await expect(heading).toHaveCSS('text-align', 'start');
  const spacing = await page.locator('.work-experience').evaluate((section) => {
    const headingBox = section.querySelector('h2').getBoundingClientRect();
    const firstRoleBox = section.querySelector('.experience-title').getBoundingClientRect();
    return firstRoleBox.top - headingBox.bottom;
  });
  expect(spacing).toBeLessThanOrEqual(32);
});

test('publishes current metadata and structured data', async ({ page }) => {
  await loadPage(page);

  const canonicalDescription = 'Technical security leader with a Staff-level security engineering background across Product Security, AppSec, AI and agent security, identity, trust, and security platforms.';

  await expect(page).toHaveTitle('Charlie Williams | Technical Security Leader');
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    'content',
    canonicalDescription
  );
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute(
    'content',
    'Charlie Williams | Technical Security Leader'
  );
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute(
    'content',
    canonicalDescription
  );
  await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', 'https://appseccharlie.com/');
  await expect(page.locator('meta[property="og:type"]')).toHaveAttribute('content', 'profile');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://appseccharlie.com/');

  const structuredData = JSON.parse(
    await page.locator('script[type="application/ld+json"]').textContent()
  );
  expect(structuredData).toMatchObject({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Charlie Williams',
    jobTitle: 'Manager, Product Security',
    description: canonicalDescription,
    url: 'https://appseccharlie.com/'
  });
  expect(structuredData.knowsAbout).toEqual([
    'Security Engineering',
    'Product Security',
    'Application Security',
    'AI Security',
    'Agent Security',
    'Authentication and Authorization',
    'Identity Security',
    'Account Trust and Fraud',
    'Security Platform Engineering',
    'Software Supply Chain Security',
    'Security Data Engineering'
  ]);
  expect(structuredData.sameAs).toEqual([
    'https://linkedin.com/in/charlie-williams3',
    'https://x.com/AppSecCharlie',
    'https://github.com/appseccharlie'
  ]);
  expect(structuredData.hasOccupation).toEqual({
    '@type': 'Occupation',
    name: 'Manager, Product Security'
  });

  const metadataAndOccupation = [
    await page.locator('meta[name="description"]').getAttribute('content'),
    await page.locator('meta[property="og:description"]').getAttribute('content'),
    structuredData.description,
    JSON.stringify(structuredData.hasOccupation)
  ].join(' ');
  expect(metadataAndOccupation).not.toContain('Staff Security Engineer');
  expect(metadataAndOccupation).not.toContain('—');
  await expect(page.locator('body')).not.toContainText('—');
});

for (const viewport of [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 }
]) {
  test(`${viewport.name} layout has no horizontal overflow and keeps the supporting line together`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await loadPage(page);

    const dimensions = await page.evaluate(() => ({
      viewportWidth: document.documentElement.clientWidth,
      contentWidth: document.documentElement.scrollWidth
    }));
    expect(dimensions.contentWidth).toBeLessThanOrEqual(dimensions.viewportWidth);

    const supportingLine = await page.locator('.summary .supporting-positioning').evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      lineHeight: Number.parseFloat(getComputedStyle(element).lineHeight)
    }));
    expect(supportingLine.height).toBeLessThanOrEqual(supportingLine.lineHeight * 1.1);

    await expect(page.locator('.site-descriptor')).toHaveCount(0);
    expect(await page.locator('.site-header').evaluate((element) => element.getBoundingClientRect().height))
      .toBeLessThanOrEqual(64);
    await expect(page.locator('.visual-signature, .slider-container, .icon-list')).toHaveCount(0);
  });

  test(`captures inspected ${viewport.name} top, summary, and work-experience screenshots`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await loadPage(page);
    const aboutBottom = await page.locator('.summary > p:not(.supporting-positioning):not(.section-label)').last().evaluate((element) => {
      const box = element.getBoundingClientRect();
      return Math.ceil(box.bottom + window.scrollY + 24);
    });
    if (aboutBottom > viewport.height) {
      await page.setViewportSize({ width: viewport.width, height: aboutBottom });
    }
    await page.screenshot({
      path: `test-artifacts/screenshots/${viewport.name}-homepage-top-through-about.png`,
      clip: { x: 0, y: 0, width: viewport.width, height: aboutBottom }
    });

    await page.locator('section.capabilities').screenshot({
      path: `test-artifacts/screenshots/${viewport.name}-homepage-capabilities.png`
    });

    await page.locator('.work-experience').screenshot({
      path: `test-artifacts/screenshots/${viewport.name}-homepage-experience.png`
    });

    if (viewport.name === 'desktop') {
      await page.locator('.capabilities').evaluate((element) => {
        document.documentElement.style.scrollBehavior = 'auto';
        element.scrollIntoView({ block: 'start' });
      });
      await page.screenshot({
        path: 'test-artifacts/screenshots/desktop-homepage-capabilities-into-experience.png',
        clip: { x: 0, y: 0, width: viewport.width, height: viewport.height }
      });
      await page.screenshot({
        path: 'test-artifacts/screenshots/desktop-homepage-full.png',
        fullPage: true
      });
    }
  });
}
