const { rm } = require('node:fs/promises');
const path = require('node:path');

module.exports = function (eleventyConfig) {
  eleventyConfig.on('eleventy.before', async ({ directories, runMode }) => {
    if (runMode !== 'build') return;

    const projectRoot = path.resolve('.');
    const outputDir = path.resolve(directories.output);
    if (outputDir === projectRoot || !outputDir.startsWith(`${projectRoot}${path.sep}`)) {
      throw new Error(`Refusing to clean unsafe Eleventy output directory: ${outputDir}`);
    }
    await rm(outputDir, { recursive: true, force: true });
  });

  eleventyConfig.ignores.add('src/assets/**');
  eleventyConfig.ignores.add('src/css/**');

  eleventyConfig.addPassthroughCopy({ 'src/assets': 'assets' });
  eleventyConfig.addPassthroughCopy({ 'src/css': 'css' });
  eleventyConfig.addPassthroughCopy({ 'src/.well-known': '.well-known' });
  eleventyConfig.addPassthroughCopy({ 'src/CNAME': 'CNAME' });
  eleventyConfig.addPassthroughCopy({ 'src/.nojekyll': '.nojekyll' });
  eleventyConfig.addPassthroughCopy({ 'src/robots.txt': 'robots.txt' });

  eleventyConfig.addFilter('readableDate', (date) => new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  }).format(date));
  eleventyConfig.addFilter('htmlDateString', (date) => date.toISOString().slice(0, 10));
  eleventyConfig.addFilter('journalDate', (date) => {
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    return `${String(date.getUTCDate()).padStart(2, '0')} ${months[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  });
  eleventyConfig.addFilter('fieldNoteNumber', (collection, pageUrl) => {
    const index = collection.findIndex((note) => note.page.url === pageUrl);
    return String(index + 1).padStart(3, '0');
  });

  return {
    dir: {
      input: 'src',
      output: '_site',
      includes: '_includes',
      data: '_data'
    }
  };
};
