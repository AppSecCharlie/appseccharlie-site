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

const expectedCarouselTerms = [
  'Application Security',
  'Product Security',
  'AI Security',
  'Agent Security',
  'Platform Security',
  'Data Security'
];

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

const expectedTechnologies = [
  ['GitHub', '/assets/logos/github-icon.svg'],
  ['GitHub Actions', '/assets/logos/github-actions.svg'],
  ['Claude', '/assets/logos/claude-icon.svg'],
  ['GitHub Copilot', '/assets/logos/github-copilot.svg'],
  ['Python', '/assets/logos/python.svg'],
  ['AWS', '/assets/logos/aws.svg'],
  ['Terraform', '/assets/logos/terraform-icon.svg'],
  ['Snowflake', '/assets/logos/snowflake-icon.svg'],
  ['dbt', '/assets/logos/dbt-icon.svg']
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

async function freezeCarouselAt(page, index) {
  await page.locator('.vmove').evaluate((element, selectedIndex) => {
    const slideHeight = document.querySelector('.vwrap').getBoundingClientRect().height;
    element.style.animation = 'none';
    element.style.transform = `translateY(-${selectedIndex * slideHeight}px)`;
  }, index);
}

async function visibleCarouselSlides(page) {
  return page.locator('.slider-container').evaluate((container) => {
    const wrapper = container.querySelector('.vwrap');
    const wrapperBox = wrapper.getBoundingClientRect();

    return [...container.querySelectorAll('.vslide')]
      .filter((slide) => {
        const box = slide.getBoundingClientRect();
        const visibleHeight = Math.max(
          0,
          Math.min(box.bottom, wrapperBox.bottom) - Math.max(box.top, wrapperBox.top)
        );
        return visibleHeight > 0.5;
      })
      .map((slide) => slide.textContent.trim());
  });
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

  await expect(page.locator('.visual-signature')).not.toContainText('Technical Security Leader');
  await expect(page.locator('.visual-signature')).not.toContainText('AppSec · AI Security · Identity & Trust');
  await expect(page.locator('.summary h2:not(.section-label)')).toHaveCount(0);
  await expect(page.locator('.summary .supporting-positioning')).toHaveText('AppSec · AI Security · Identity & Trust');
  await expect(page.getByRole('heading', { name: 'Capabilities' })).toHaveCSS('text-transform', 'uppercase');
  await expect(page.getByRole('heading', { name: 'Work Experience' })).toHaveCSS('text-transform', 'uppercase');
  await expect(page.locator('.summary > p:not(.supporting-positioning)')).toHaveText(expectedSummary);
  await expect(page.locator('.work-experience')).toContainText('Manager, Product Security');
  await expect(page.locator('.visual-signature')).not.toContainText('Staff Security Engineer');
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

  await expect(page.locator('.visual-signature .contact-links')).toHaveCount(0);
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

test('renders the nine vendored technology logos without a runtime icon dependency', async ({ page }) => {
  await loadPage(page);

  const icons = page.locator('.icon-list img');
  await expect(icons).toHaveCount(expectedTechnologies.length);
  expect(await icons.evaluateAll((elements) => elements.map((icon) => [
    icon.alt,
    icon.title,
    new URL(icon.src).pathname
  ]))).toEqual(expectedTechnologies.map(([name, src]) => [name, name, src]));
  expect(await icons.evaluateAll((elements) => elements.every((icon) => icon.complete && icon.naturalWidth > 0))).toBe(true);
  await expect(page.locator(
    'link[href*="devicon"], link[href*="font-awesome"], [class*="devicon-"], [class*="fa-"]'
  )).toHaveCount(0);
});

test('uses a compact homepage-only visual signature before About', async ({ page }) => {
  await loadPage(page);

  const signature = page.locator('.visual-signature');
  await expect(signature).toBeVisible();
  await expect(signature.locator('.slider-container')).toBeVisible();
  await expect(signature.locator('.field-prefix')).toHaveText('FIELD /');
  await expect(signature.locator('.icon-list img')).toHaveCount(expectedTechnologies.length);
  await expect(signature.locator('.social-links')).toHaveCount(0);

  const positions = await page.locator('.visual-signature, #about').evaluateAll(([visualSignature, about]) => ({
    signatureBottom: visualSignature.getBoundingClientRect().bottom,
    aboutTop: about.getBoundingClientRect().top,
    signatureHeight: visualSignature.getBoundingClientRect().height
  }));
  expect(positions.signatureBottom).toBeLessThanOrEqual(positions.aboutTop);
  expect(positions.signatureHeight).toBeLessThanOrEqual(128);

  const carouselFontSize = Number.parseFloat(await signature.locator('.vslide').first().evaluate(
    (element) => getComputedStyle(element).fontSize
  ));
  expect(carouselFontSize).toBeGreaterThanOrEqual(20);
  expect(carouselFontSize).toBeLessThanOrEqual(28);
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
        gridCenter: gridBox.left + (gridBox.width / 2),
        groups: [...grid.children].map((group) => {
          const box = group.getBoundingClientRect();
          return {
            left: box.left,
            right: box.right,
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
    }
  }
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

    const prose = page.locator('.summary > p:not(.supporting-positioning)');
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

test('carousel is accessible without an auto-updating live region', async ({ page }) => {
  await loadPage(page);

  await expect(page.locator('.carousel-accessible-label')).toHaveText(
    'Application Security, Product Security, AI Security, Agent Security, Platform Security, Data Security'
  );
  await expect(page.locator('.carousel-accessible-label')).toHaveClass(/visually-hidden/);
  await expect(page.locator('.slider-container')).toHaveAttribute('aria-hidden', 'true');
  await expect(page.locator('.slider-container')).not.toHaveAttribute('aria-live', /.+/);
});

test('carousel moves smoothly between terms on desktop and mobile', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 390, height: 844 }
  ]) {
    await page.setViewportSize(viewport);
    await loadPage(page);

    const motion = await page.locator('.vmove').evaluate((element) => {
      const animation = element.getAnimations()[0];
      animation.pause();
      animation.currentTime = 1000;

      return {
        offset: Math.abs(new DOMMatrixReadOnly(getComputedStyle(element).transform).m42),
        slideHeight: document.querySelector('.vwrap').getBoundingClientRect().height
      };
    });

    expect(motion.offset).toBeGreaterThan(1);
    expect(motion.offset).toBeLessThan(motion.slideHeight - 1);
  }
});

test('reduced-motion mode freezes the first carousel term without clipping', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await loadPage(page);

  await expect(page.locator('.vmove')).toHaveCSS('animation-name', 'none');
  expect(await visibleCarouselSlides(page)).toEqual(['Application Security']);

  const initialTransform = await page.locator('.vmove').evaluate((element) => getComputedStyle(element).transform);
  await page.waitForTimeout(500);
  await expect(page.locator('.vmove')).toHaveCSS('transform', initialTransform);
});

test('carousel cycles normally and every configured security area can occupy the visible slot', async ({ page }) => {
  await loadPage(page);

  await expect(page.locator('.vslide')).toHaveText(expectedCarouselTerms);
  const initialTransform = await page.locator('.vmove').evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(
    () => page.locator('.vmove').evaluate((element) => getComputedStyle(element).transform),
    { timeout: 3500 }
  ).not.toBe(initialTransform);
  const nextTransform = await page.locator('.vmove').evaluate((element) => getComputedStyle(element).transform);
  await expect.poll(
    () => page.locator('.vmove').evaluate((element) => getComputedStyle(element).transform),
    { timeout: 3500 }
  ).not.toBe(nextTransform);

  for (const [index, term] of expectedCarouselTerms.entries()) {
    await freezeCarouselAt(page, index);
    expect(await visibleCarouselSlides(page)).toEqual([term]);
  }
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
    expect(await page.locator('.visual-signature').evaluate((element) => element.getBoundingClientRect().height))
      .toBeLessThanOrEqual(128);
  });

  test(`captures inspected ${viewport.name} top, summary, and work-experience screenshots`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await loadPage(page);
    await freezeCarouselAt(page, 3);

    const aboutBottom = await page.locator('.summary > p:not(.supporting-positioning)').last().evaluate((element) => {
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

    const capabilitiesBottom = await page.locator('.summary').evaluate((element) => {
      const box = element.getBoundingClientRect();
      return box.bottom + window.scrollY;
    });
    const overviewHeight = Math.ceil(capabilitiesBottom);
    if (overviewHeight > viewport.height) {
      await page.setViewportSize({ width: viewport.width, height: overviewHeight });
    }
    await page.screenshot({
      path: `test-artifacts/screenshots/${viewport.name}-homepage-through-capabilities.png`,
      clip: { x: 0, y: 0, width: viewport.width, height: overviewHeight }
    });
    await page.setViewportSize(viewport);

    if (viewport.name === 'desktop') {
      await page.screenshot({
        path: 'test-artifacts/screenshots/desktop-capabilities-experience-start.png',
        fullPage: true
      });
    }

    await page.locator('section.summary').screenshot({
      path: `test-artifacts/screenshots/${viewport.name}-summary-capabilities.png`
    });

    const workStart = page.locator('.work-experience');
    await workStart.evaluate((element) => element.scrollIntoView({ block: 'start' }));
    await page.screenshot({
      path: `test-artifacts/screenshots/${viewport.name}-work-experience-start.png`,
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height
      }
    });
  });
}
