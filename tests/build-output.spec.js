import { test, expect } from '@playwright/test';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const outputRoot = path.resolve('_site');
const pagesWorkflow = path.resolve('.github/workflows/publish_site.yml');

test('build emits the homepage and required static files', async () => {
  const requiredPaths = [
    'index.html',
    'CNAME',
    '.nojekyll',
    '.well-known/pub.asc',
    '.well-known/security.txt',
    'css/styles.css',
    'assets/favicon.svg',
    'assets/favicon.ico',
    'assets/js/gtag-init.js'
  ];

  await Promise.all(requiredPaths.map((relativePath) =>
    expect(access(path.join(outputRoot, relativePath))).resolves.toBeUndefined()
  ));

  const homepage = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
  expect(homepage).not.toContain('<h1>Charlie Williams</h1>');
  expect(homepage).not.toContain('id="about-heading"');
  expect(homepage).toContain('FIELD 01 / PROFILE');
  expect(homepage).toContain('FIELD 02 / CAPABILITIES');
  expect(homepage).toContain('FIELD 03 / EXPERIENCE');
  expect(homepage).toContain('class="site-footer"');
  expect(homepage).toContain('Technical Security Leader');
  expect(homepage).toContain('application/ld+json');
  expect(homepage).toContain('<meta name="theme-color" content="#F4F1E8">');
  expect(homepage).toContain('href="/assets/favicon.svg" type="image/svg+xml" sizes="any"');
  expect(homepage).toContain('href="/assets/favicon.ico" type="image/x-icon"');
  expect(homepage).not.toContain('favicon-light.svg');
  expect(homepage).not.toContain('favicon-dark.svg');
  expect(homepage).not.toContain('prefers-color-scheme');
  expect(homepage).not.toContain('fonts.googleapis.com');
  expect(homepage).not.toContain('fonts.gstatic.com');

  const stylesheet = await readFile(path.join(outputRoot, 'css', 'styles.css'), 'utf8');
  expect(stylesheet.toLowerCase()).not.toContain('#1ee97a');
  expect(stylesheet).toContain('--paper: #F4F1E8');
  expect(stylesheet).toContain('--ballpoint: #315F8D');
});

test('Pages deployment includes hidden production files', async () => {
  const workflow = await readFile(pagesWorkflow, 'utf8');
  expect(workflow).toMatch(/include-hidden-files:\s*true/);
});
