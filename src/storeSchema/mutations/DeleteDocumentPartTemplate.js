'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

function getNewPartOrder(oldPartOrder, removedPartId) {
  return oldPartOrder.filter(partId => partId !== removedPartId);
}

module.exports = {
  name: 'DeleteDocumentPart',
  inputFields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
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
    const {id: documentPartId} = fromGlobalId(input.id);
    const documentPart = await databaseHelpers.documentParts.getById(context, documentPartId);
    const { documentId } = documentPart;
    let document;
    await context.knex.transaction(async (trx) => {
      const trxContext = Object.assign({}, context, {knex: trx});
      document = await databaseHelpers.documents.getByIdAndLockRelated(trxContext, documentId);
      await databaseHelpers.documentParts.deleteById(trxContext, documentPartId)
      const documentUpdates = {
        partOrder: getNewPartOrder(document.partOrder, documentPartId),
        ...(await databaseHelpers.documentParts.getDateRangeOfDocument(trxContext, documentId)),
      };
      await databaseHelpers.documents.updateById(trxContext, documentId, documentUpdates)
      Object.assign(document, documentUpdates);
    })
    return {document, documentPart}
  },
};
