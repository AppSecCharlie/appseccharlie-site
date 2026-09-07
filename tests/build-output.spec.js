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
  expect(homepage).toContain('class="visual-signature"');
  expect(homepage).toContain('class="site-footer"');
  expect(homepage).toContain('Technical Security Leader');
  expect(homepage).toContain('application/ld+json');

  await expect(access(path.join(outputRoot, 'assets/logos/SOURCE/index.html')))
    .rejects.toMatchObject({ code: 'ENOENT' });
});
