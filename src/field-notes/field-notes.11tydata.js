module.exports = {
  layout: 'layouts/field-note.njk',
  tags: 'fieldNotes',
  permalink(data) {
    return `/field-notes/${data.page.fileSlug}/index.html`;
  },
  titleSuffix: ' | Field Notes | Charlie Williams'
};
