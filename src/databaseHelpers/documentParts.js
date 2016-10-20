'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documentParts',
  ['id', 'sourceFileId', 'documentId']
);

function getOfDocument(context, documentId) {
  return standardFunctions.get(context).where('documentParts.documentId', documentId);
}

async function getDateRangeOfDocument(context, documentId) {
  const response = await context.knex('documentParts')
    .min('sourceFiles.irlCreatedAt as dateRangeStart')
    .max('sourceFiles.irlCreatedAt as dateRangeEnd')
    .leftJoin('sourceFiles', 'documentParts.sourceFileId', 'sourceFiles.id')
    .where('documentParts.documentId', documentId);
  return {
    dateRangeStart: response[0].dateRangeStart || new Date(),
    dateRangeEnd: response[0].dateRangeEnd || new Date(),
  }
}

module.exports = Object.assign({}, standardFunctions, {
  getOfDocument,
  getDateRangeOfDocument,
});
