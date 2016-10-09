'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'sourceFiles',
  ['id', 'filename', 'mimeType', 'previewFilename', 'uploadedAt', 'irlCreatedAt']
);

function getUnassigned(context) {
  return standardFunctions.get(context)
    .leftJoin('documentParts', 'sourceFiles.id', 'documentParts.sourceFileId')
    .whereNull('documentParts.id');
}

module.exports = Object.assign({}, standardFunctions, {
  getUnassigned,
});
