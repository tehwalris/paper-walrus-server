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
  mutateAndGetPayload: (input, context) => {
    const {id} = fromGlobalId(input.id);
    return databaseHelpers.documentParts.getById(context, id).then(documentPart => {
      return context.knex.transaction(trx => {
        const trxContext = Object.assign({}, context, {knex: trx});
        return databaseHelpers.documentParts.deleteById(trxContext, id)
          .then(() => databaseHelpers.documents.removePartFromList(trxContext, id, documentPart.documentId));
      })
      .then(() => ({documentId: documentPart.documentId, documentPart}));
    });
  },
};


