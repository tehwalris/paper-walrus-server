'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documentParts',
  ['id', 'sourceFileId']
);

function getOfDocument(context, documentId) {
  return standardFunctions.get(context).where('documentParts.documentId', documentId);
}

module.exports = Object.assign({}, standardFunctions, {
  getOfDocument,
});
