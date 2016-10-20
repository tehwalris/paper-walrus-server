'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

function getNewPartOrder(oldPartOrder, newPartId) {
  return [...oldPartOrder, newPartId];
}

module.exports = {
  name: 'CreateDocumentPart',
  inputFields: {
    documentPart: {
      type: new GraphQLInputObjectType({
        name: `CreateDocumentPartInputValue`,
        fields: {
          documentId: {type: new GraphQLNonNull(GraphQLString)},
          sourceFileId: {type: new GraphQLNonNull(GraphQLString)},
        },
      }),
    },
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
    const documentId = fromGlobalId(input.documentPart.documentId).id;
    const sourceFileId = fromGlobalId(input.documentPart.sourceFileId).id;
    let documentPart, document;
    await context.knex.transaction(async (trx) => {
      const trxContext = Object.assign({}, context, {knex: trx});
      document = await databaseHelpers.documents.getByIdAndLockRelated(trxContext, documentId);
      const [documentPartId] = await databaseHelpers.documentParts
        .create(trxContext, { documentId, sourceFileId })
        .returning('id');
      documentPart = await databaseHelpers.documentParts.getById(trxContext, documentPartId);
      const documentUpdates = {
        partOrder: getNewPartOrder(document.partOrder, documentPartId),
        ...(await databaseHelpers.documentParts.getDateRangeOfDocument(trxContext, documentId)),
      };
      await databaseHelpers.documents.updateById(trxContext, documentId, documentUpdates)
      Object.assign(document, documentUpdates);
    });
    return {documentPart, document};
  },
};

