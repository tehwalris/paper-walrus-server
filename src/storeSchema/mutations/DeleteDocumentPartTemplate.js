'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

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
      resolve: ({documentId}, args, context) => {
        return databaseHelpers.documents.getById(context, documentId);
      },
    },
    viewer: viewerField,
  },
  mutateAndGetPayload: async (input, context) => {
    const {id} = fromGlobalId(input.id);
    const documentPart = await databaseHelpers.documentParts.getById(context, id);
    await context.knex.transaction(async (trx) => {
      const trxContext = Object.assign({}, context, {knex: trx});
      await databaseHelpers.documentParts.deleteById(trxContext, id)
      await databaseHelpers.documents.removePartFromList(trxContext, id, documentPart.documentId)
    })
    return {documentId: documentPart.documentId, documentPart}
  },
};
