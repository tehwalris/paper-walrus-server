const _ = require('lodash');

exports.seed = function(knex, Promise) {
  function createSourceFiles() {
    return Promise.all(_.times(3, i => {
      const id = i + 1;
      return knex('sourceFiles').insert({id, filename: `fakeFilename${id}`, mimeType: `fakeMimeType${id}`});
    }));
  }

  function createDocuments() {
    return Promise.all([
      knex('documents').insert({id: 1, name: 'Standalone document with parts', visibility: 'standalone'}),
      knex('documents').insert({id: 2, name: 'Anonymous document without parts', visibility: 'anonymous'}),
    ]);
  }

  function createDocumentParts() {
    return Promise.all([
      knex('documentParts').insert({id: 1, documentId: 1, sourceFileId: 1}),
      knex('documentParts').insert({id: 2, documentId: 1, sourceFileId: 2}),
    ]);
  }

  return createSourceFiles()
    .then(() => createDocuments())
    .then(() => createDocumentParts());
};
