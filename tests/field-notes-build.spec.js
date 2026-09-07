import { test, expect } from '@playwright/test';
import { access, cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve('.');
const eleventyBinary = path.join(projectRoot, 'node_modules', '.bin', 'eleventy');

test('production output publishes the approved first Field Note at its clean URL', async () => {
  const indexHtml = await readFile(path.join(projectRoot, '_site', 'field-notes', 'index.html'), 'utf8');

  expect(indexHtml).toContain('FIELD NOTE 001');
  expect(indexHtml).toContain('06 SEP 2026');
  expect(indexHtml).toContain('Turning Judgment into Infrastructure');
  await expect(access(path.join(
    projectRoot,
    '_site',
    'field-notes',
    'turning-judgment-into-infrastructure',
    'index.html'
  ))).resolves.toBeUndefined();
});

test('published notes render Markdown at clean URLs in newest-first order', async () => {
  const root = await mkdtemp(path.join(tmpdir(), 'field-notes-eleventy-'));
  const inputDir = path.join(root, 'src');
  const outputDir = path.join(root, '_site');

  try {
    await cp(path.join(projectRoot, 'src'), inputDir, { recursive: true });
    await cp(
      path.join(projectRoot, 'eleventy.config.js'),
      path.join(root, 'eleventy.config.js')
    );

    const firstNote = await readFile(
      path.join(projectRoot, 'src', 'field-notes', 'turning-judgment-into-infrastructure.md'),
      'utf8'
    );
    await writeFile(
      path.join(inputDir, 'field-notes', 'turning-judgment-into-infrastructure.md'),
      firstNote.replace('draft: true', 'draft: false')
    );
    await writeFile(
      path.join(inputDir, 'field-notes', 'earlier-note.md'),
      `---\ntitle: Earlier note\ndate: 2026-08-01\ndescription: An earlier published note.\ndraft: false\n---\n\nEarlier body.\n`
    );
    await writeFile(
      path.join(inputDir, 'field-notes', 'newer-draft.md'),
      `---\ntitle: Newer draft\ndate: 2026-10-01\ndescription: This must stay private.\ndraft: true\n---\n\nDraft body.\n`
    );

    await execFileAsync(eleventyBinary, [], { cwd: root });

    const indexHtml = await readFile(path.join(outputDir, 'field-notes', 'index.html'), 'utf8');
    const noteHtml = await readFile(path.join(
      outputDir,
      'field-notes',
      'turning-judgment-into-infrastructure',
      'index.html'
    ), 'utf8');

    expect(indexHtml.indexOf('Turning Judgment into Infrastructure'))
      .toBeLessThan(indexHtml.indexOf('Earlier note'));
    expect(indexHtml).not.toContain('Newer draft');
    expect(indexHtml).toContain('FIELD NOTE 002');
    expect(indexHtml).toContain('FIELD NOTE 001');
    expect(noteHtml).toContain('FIELD NOTE 002');
    expect(noteHtml).toContain('06 SEP 2026');
    expect(noteHtml).toContain('<p class="note-dek">Encoding the repeatable parts of expert judgment into systems that can apply them consistently over time.</p>');
    expect(noteHtml).toContain('<p>A lot of repeated work starts at the task layer:');
    expect(noteHtml).toContain('<strong>Encode the invariants, preserve the exceptions, and instrument the mechanism so reality can tell you when the model is wrong.</strong>');
    expect(noteHtml).toContain('class="site-header"');
    expect(noteHtml).toContain('class="site-name" href="/">Charlie Williams</a>');
    expect(noteHtml).toContain('href="/#about">About</a>');
    expect(noteHtml).toContain('class="site-link is-active" href="/field-notes/">Field Notes</a>');
    expect(noteHtml).not.toContain('aria-current="page"');
    expect(noteHtml).not.toContain('note-breadcrumb');
    expect(noteHtml).toContain('>Back to Field Notes</a>');
    expect(noteHtml).not.toContain('class="visual-signature"');
    expect(noteHtml).toContain('class="site-footer"');
    expect(noteHtml).toContain('class="contact-links"');
    expect(noteHtml).toContain('https://appseccharlie.com/field-notes/turning-judgment-into-infrastructure/');
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
