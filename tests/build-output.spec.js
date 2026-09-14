import { test, expect } from '@playwright/test';
import { access, readFile, readdir } from 'node:fs/promises';
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
    'robots.txt',
    'sitemap.xml',
    'css/styles.css',
    'assets/favicon.svg',
    'assets/favicon.ico',
    'assets/js/gtag-init.js'
  ];

  await Promise.all(requiredPaths.map((relativePath) =>
    expect(access(path.join(outputRoot, relativePath))).resolves.toBeUndefined()
  ));

  const homepage = await readFile(path.join(outputRoot, 'index.html'), 'utf8');
  expect(homepage).toContain('<h1 class="supporting-positioning"><span class="visually-hidden">Charlie Williams, Technical Security Leader: </span>AppSec · AI Security · Identity &amp; Trust</h1>');
  expect(homepage).toContain('FIELD 01 / PROFILE');
  expect(homepage).toContain('FIELD 02 / CAPABILITIES');
  expect(homepage).toContain('FIELD 03 / EXPERIENCE');
  expect(homepage).toContain('class="site-footer"');
  expect(homepage).toContain('Technical Security Leader');
  expect(homepage).toContain('application/ld+json');
  expect(homepage).toContain('<meta name="theme-color" content="#F4F1E8">');
  expect(homepage).toContain('href="/assets/favicon.svg" type="image/svg+xml" sizes="any"');
  expect(homepage).toContain('href="/assets/favicon.ico" type="image/x-icon"');
  expect(homepage).not.toContain('prefers-color-scheme');
  expect(homepage.match(/<link rel="icon"/g)).toHaveLength(2);
  expect(homepage.indexOf('/assets/favicon.svg')).toBeLessThan(homepage.indexOf('/assets/favicon.ico'));
  expect(homepage.match(/<!--email_off-->\s*<li><a href="mailto:this@appseccharlie\.com"[^>]*>Email<\/a><\/li>\s*<!--\/email_off-->/g)).toHaveLength(2);

  const sourceFavicons = (await readdir(path.resolve('src/assets')))
    .filter((filename) => filename.startsWith('favicon'));
  const outputFavicons = (await readdir(path.join(outputRoot, 'assets')))
    .filter((filename) => filename.startsWith('favicon'));
  expect(sourceFavicons).toEqual(['favicon.ico', 'favicon.svg']);
  expect(outputFavicons).toEqual(['favicon.ico', 'favicon.svg']);
  expect(homepage).not.toContain('fonts.googleapis.com');
  expect(homepage).not.toContain('fonts.gstatic.com');

  const stylesheet = await readFile(path.join(outputRoot, 'css', 'styles.css'), 'utf8');
  expect(stylesheet.toLowerCase()).not.toContain('#1ee97a');
  expect(stylesheet).toContain('--paper: #F4F1E8');
  expect(stylesheet).toContain('--ballpoint: #315F8D');

  const sitemap = await readFile(path.join(outputRoot, 'sitemap.xml'), 'utf8');
  expect(sitemap).toContain('https://appseccharlie.com/</loc>');
  expect(sitemap).toContain('https://appseccharlie.com/field-notes/</loc>');
  expect(sitemap).toContain('https://appseccharlie.com/field-notes/the-afterlife-of-a-bug-report/</loc>');
  expect(sitemap).toContain('https://appseccharlie.com/field-notes/turning-judgment-into-infrastructure/</loc>');

  const robots = await readFile(path.join(outputRoot, 'robots.txt'), 'utf8');
  expect(robots).toContain('Sitemap: https://appseccharlie.com/sitemap.xml');
});

test('Pages deployment includes hidden production files', async () => {
  const workflow = await readFile(pagesWorkflow, 'utf8');
  expect(workflow).toMatch(/include-hidden-files:\s*true/);
  expect(workflow).toContain('actions/upload-pages-artifact');
  expect(workflow).toContain('actions/deploy-pages');
  expect(workflow).toContain('release:');
  expect(workflow).toContain('needs: deploy');
  expect(workflow).toMatch(/permissions:\s*\n\s*contents:\s*write/);
  expect(workflow).toContain('uses: appsecdemos/reusable-workflows/.github/workflows/semantic_release.yml@fb957a83115daf8f28e1e90311049fd8224e0ddb');
  expect(workflow).not.toContain('gh release create');
  expect(workflow).not.toContain('actions/github-script');
});
