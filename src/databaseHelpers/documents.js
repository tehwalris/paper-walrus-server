'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documents',
  ['id', 'name', 'visibility', 'partOrder', 'dateRangeStart', 'dateRangeEnd']
);

function getWithTags(context, tagIds) {
  if(!tagIds.length)
    return standardFunctions.get(context);
  return standardFunctions.get(context)
    .innerJoin('tagAssignments', 'documents.id', 'tagAssignments.documentId')
    .whereIn('tagAssignments.tagId', tagIds)
    .groupBy('documents.id')
    .havingRaw('count(*) = ?', [tagIds.length]);
}

// IMPORTANT
// This will lock document within the transaction it is used in.
// By convention, this implies a lock on related document parts.
// This must be used anywhere document or parts are mutated.
async function getByIdAndLockRelated(context, documentId) {
  const response = await standardFunctions.get(context).where('documents.id', documentId).forUpdate();
  return response[0];
}

module.exports = Object.assign({}, standardFunctions, {
  getWithTags,
  getByIdAndLockRelated,
});
