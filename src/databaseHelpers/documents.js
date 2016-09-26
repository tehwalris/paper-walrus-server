'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documents',
  ['id', 'name', 'visibility', 'partOrder']
);

function appendPartToList(context, documentPartId, documentId) {
  return context.knex('documents').where('documents.id', documentId)
    .update({partOrder: context.knex.raw(`array_append("partOrder", ${documentPartId})`)});
}

function removePartFromList(context, documentPartId, documentId) {
  return context.knex('documents').where('documents.id', documentId)
    .update({partOrder: context.knex.raw(`array_remove("partOrder", ${documentPartId})`)});
}

module.exports = Object.assign({}, standardFunctions, {
  appendPartToList,
  removePartFromList,
});
