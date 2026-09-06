function excludeDraft(data) {
  return data.draft === true && process.env.ELEVENTY_RUN_MODE === 'build';
}

module.exports = {
  permalink(data) {
    return excludeDraft(data) ? false : data.permalink;
  },
  eleventyExcludeFromCollections(data) {
    return excludeDraft(data) ? true : data.eleventyExcludeFromCollections;
  }
};
