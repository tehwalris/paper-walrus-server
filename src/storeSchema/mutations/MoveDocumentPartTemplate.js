'use strict';
const {GraphQLString, GraphQLInt, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

module.exports = {
  name: 'MoveDocumentPart',
  inputFields: {
    id: {type: new GraphQLNonNull(GraphQLString)},
    position: {type: new GraphQLNonNull(GraphQLInt)}, //non-negative - TODO enforce here (enforced in resolve)
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
    const {id} = fromGlobalId(input.documentPartId);
    return databaseHelpers.documentParts.getById(context, id).then(documentPart => {
      return context.knex.transaction(trx => {
        const trxContext = Object.assign({}, context, {knex: trx});
        //getById is unchainable, must use get
        return databaseHelpers.documents.get(trxContext)
          .where('documents.id', documentPart.documentId).forUpdate()
          .then(document => databaseHelpers.documents.updateById(documentPart.documentId, {
            partOrder: [], //TODO
          }));
      })
      .then(() => ({documentId: documentPart.documentId, documentPart}));
    });
  },
};


