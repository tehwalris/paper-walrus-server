'use strict';
const createStandardFunctions = require('./createStandardFunctions');

const standardFunctions = createStandardFunctions(
  'documents',
  ['id', 'name', 'visibility', 'partOrder', 'dateRangeStart', 'dateRangeEnd']
);

function getWithTags(context, tagIds) {
  return standardFunctions.get(context)
    .leftJoin('tagAssignments', 'documents.id', 'tagAssignments.documentId')
    .whereNotNull('tagAssignments.id');
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
  getByIdAndLockRelated,
});
