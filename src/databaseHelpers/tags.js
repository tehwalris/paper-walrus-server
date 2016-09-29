'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'tags',
  ['id', 'type', 'text']
);

function getOfDocument(context, documentId) {
  return standardFunctions.get(context)
    .innerJoin('tagAssignments', 'tags.id', 'tagAssignments.tagId')
    .where('tagAssignments.documentId', documentId);
}

function addToDocument(context, documentId, tagId) {
  return context.knex.insert({tagId, documentId}).into('tagAssignments');
}

function removeFromDocument(context, documentId, tagId) {
  return context.knex('tagAssignments').where({documentId, tagId}).del();
}

module.exports = Object.assign({}, standardFunctions, {
  getOfDocument,
  addToDocument,
  removeFromDocument,
});
