'use strict';
const {GraphQLString, GraphQLInt, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

function getNewPartOrder(oldPartOrder, partIdToMove, targetPosition) {
  const oldPartIndex = oldPartOrder.findIndex(id => id === partIdToMove);
  if(oldPartIndex < 0)
    throw new Error('Part to move does not exist (this shouldn\'t happend).');
  const limitedTargetPosition = Math.max(0, Math.min(oldPartOrder.length, targetPosition));
  const newPartOrder = [...oldPartOrder];
  let oldPartIndexAfterInsert = oldPartIndex;
  if(limitedTargetPosition <= oldPartIndex)
    oldPartIndexAfterInsert++;
  newPartOrder.splice(limitedTargetPosition, 0, partIdToMove);
  newPartOrder.splice(oldPartIndexAfterInsert, 1);
  return newPartOrder;
}

module.exports = {
  name: 'MoveDocumentPart',
  inputFields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
    targetPosition: {type: new GraphQLNonNull(GraphQLInt)}, //non-negative - TODO enforce here (enforced in resolve)
  },
  outputFields: {
    documentPart: {
      type: DocumentPartType,
    },
    document: {
      type: DocumentType,
    },
    viewer: viewerField,
  },
  mutateAndGetPayload: async (input, context) => {
    const {id} = fromGlobalId(input.id);
    const documentPart = await databaseHelpers.documentParts.getById(context, id);
    let document;
    await context.knex.transaction(async (trx) => {
      const trxContext = Object.assign({}, context, {knex: trx});
      document = await databaseHelpers.documents.getByIdAndLockRelated(
        trxContext,
        documentPart.documentId
      );
      const documentUpdates = {
        partOrder: getNewPartOrder(document.partOrder, +id, input.targetPosition),
      };
      await databaseHelpers.documents.updateById(
        trxContext,
        documentPart.documentId,
        documentUpdates
      )
      Object.assign(document, documentUpdates);
    })
    return {document, documentPart};
  },
};
