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
      resolve: ({documentId}, args, context) => {
        return databaseHelpers.documents.getById(context, documentId);
      },
    },
    viewer: viewerField,
  },
  mutateAndGetPayload: (input, context) => {
    const {id} = fromGlobalId(input.id);
    return databaseHelpers.documentParts.getById(context, id).then(documentPart => {
      return context.knex.transaction(trx => {
        const trxContext = Object.assign({}, context, {knex: trx});
        //getById is unchainable, must use get
        return databaseHelpers.documents.get(trxContext, documentPart.documentId)
          .where('documents.id', documentPart.documentId).forUpdate()
          .then(documents => databaseHelpers.documents.updateById(
            trxContext,
            documentPart.documentId,
            {partOrder: getNewPartOrder(documents[0].partOrder, +id, input.targetPosition)}
          ));
      })
      .then(() => ({documentId: documentPart.documentId, documentPart}));
    });
  },
};


