'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documents',
  ['id', 'name', 'visibility', 'partOrder', 'dateRangeStart', 'dateRangeEnd']
);

function appendPartToList(context, documentPartId, documentId) {
  return context.knex('documents').where('documents.id', documentId)
    .update({partOrder: context.knex.raw(`array_append("partOrder", ${documentPartId})`)});
}

function removePartFromList(context, documentPartId, documentId) {
  return context.knex('documents').where('documents.id', documentId)
    .update({partOrder: context.knex.raw(`array_remove("partOrder", ${documentPartId})`)});
}

function getWithTags(context, tagIds) {
  return standardFunctions.get(context)
    .leftJoin('tagAssignments', 'documents.id', 'tagAssignments.documentId')
    .whereNotNull('tagAssignments.id');
}

module.exports = Object.assign({}, standardFunctions, {
  appendPartToList,
  removePartFromList,
});
