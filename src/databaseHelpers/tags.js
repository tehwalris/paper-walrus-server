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

function deleteUnused(context) {
  //HACK 
  //Can't use true join here: https://github.com/tgriesser/knex/issues/873
  //Following didn't work:
  //http://stackoverflow.com/questions/21662726/delete-using-left-outer-join-in-postgres/33723604#33723604
  //Using subquery instead
  return context.knex('tags')
    .whereNotExists(
      context.knex('tagAssignments').whereRaw('"tagAssignments"."tagId" = "tags"."id"')
    )
    .del();
}

module.exports = Object.assign({}, standardFunctions, {
  getOfDocument,
  addToDocument,
  removeFromDocument,
  deleteUnused,
});
