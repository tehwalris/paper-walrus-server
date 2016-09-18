'use strict';
const viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

module.exports = {
  name: 'UploadSourceFiles',
  inputFields: {},
  outputFields: {
    viewer: viewerField,
  },
  mutateAndGetPayload: (input, context) => {
    return context.knex.transaction(trx => {
      return context.loadSourceFiles()
        .then(files => Promise.all(files.map(sourceFile => {
          return databaseHelpers.sourceFiles.create(context, sourceFile).transacting(trx);
        })));
    });
  },
};
