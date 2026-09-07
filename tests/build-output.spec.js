import { test, expect } from '@playwright/test';
import { access, readFile } from 'node:fs/promises';
import path from 'node:path';

const outputRoot = path.resolve('_site');

test('build emits the homepage and required static files', async () => {
  const requiredPaths = [
    'index.html',
    'CNAME',
    '.nojekyll',
    '.well-known/pub.asc',
    '.well-known/security.txt',
    'css/styles.css',
    'assets/favicon.ico',
    'assets/js/gtag-init.js',
    'assets/logos/github-icon.svg'
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
  expect(homepage).not.toContain('class="visual-signature"');
  expect(homepage).not.toContain('class="slider-container"');
  expect(homepage).not.toContain('class="icon-list"');
  expect(homepage).toContain('class="site-footer"');
  expect(homepage).toContain('Technical Security Leader');
  expect(homepage).toContain('application/ld+json');
  expect(homepage).toContain('<meta name="theme-color" content="#F4F1E8">');
  expect(homepage).not.toContain('fonts.googleapis.com');
  expect(homepage).not.toContain('fonts.gstatic.com');

  const stylesheet = await readFile(path.join(outputRoot, 'css', 'styles.css'), 'utf8');
  expect(stylesheet.toLowerCase()).not.toContain('#1ee97a');
  expect(stylesheet).toContain('--paper: #F4F1E8');
  expect(stylesheet).toContain('--ballpoint: #315F8D');
  expect(stylesheet).not.toContain('@keyframes slidev');
  expect(stylesheet).not.toContain('.vmove');
  expect(stylesheet).not.toContain('.tech-icon');

  await expect(access(path.join(outputRoot, 'assets/logos/SOURCE/index.html')))
    .rejects.toMatchObject({ code: 'ENOENT' });
});
