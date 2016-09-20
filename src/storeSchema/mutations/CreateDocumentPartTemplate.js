'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

function appendPartToList(knex, documentPartId, documentId) {
  return knex('documents').where('documents.id', documentId)
    .update({
      'partOrder': knex.raw(`array_append("partOrder", ${documentPartId})`),
    });
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
  mutateAndGetPayload: (input, context) => {
    const inputValue = {
      documentId: fromGlobalId(input.documentPart.documentId).id,
      sourceFileId: fromGlobalId(input.documentPart.sourceFileId).id,
    };
    return context.knex.transaction(trx => {
      const trxContext = Object.assign({}, context, {knex: trx});
      return databaseHelpers.documentParts.create(trxContext, inputValue).returning('id')
        .then(([documentPartId]) => {
          return appendPartToList(trx, documentPartId, inputValue.documentId)
            .then(() => ({
              documentPartId,
              documentId: inputValue.documentId,
            }));
        });
    });
  },
};

