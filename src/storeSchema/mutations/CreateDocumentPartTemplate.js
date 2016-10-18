'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

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
      resolve: ({documentPartId}, args, context) => {
        return databaseHelpers.documentParts.getById(context, documentPartId);
      },
    },
    document: {
      type: DocumentType,
      resolve: ({documentId}, args, context) => {
        return databaseHelpers.documents.getById(context, documentId);
      },
    },
    viewer: viewerField,
  },
  mutateAndGetPayload: async (input, context) => {
    const documentId = fromGlobalId(input.documentPart.documentId).id;
    const sourceFileId = fromGlobalId(input.documentPart.sourceFileId).id;
    let documentPartId;
    await context.knex.transaction(async (trx) => {
      const trxContext = Object.assign({}, context, {knex: trx});
      const documentPartCreationResponse = await databaseHelpers.documentParts
        .create(trxContext, { documentId, sourceFileId })
        .returning('id');
      documentPartId = documentPartCreationResponse[0]
      await databaseHelpers.documents.appendPartToList(
        trxContext,
        documentPartId,
        documentId
      )
    });
    return {documentPartId, documentId};
  },
};

