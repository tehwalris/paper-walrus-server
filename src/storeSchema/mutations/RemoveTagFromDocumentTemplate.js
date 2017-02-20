'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

module.exports = {
  name: 'RemoveTagFromDocument',
  inputFields: {
    tagId: {type: new GraphQLNonNull(GraphQLString)},
    documentId: {type: new GraphQLNonNull(GraphQLString)},
  },
  outputFields: {
    document: {
      type: DocumentType,
      resolve: ({documentId}, args, context) => {
        return databaseHelpers.documents.getById(context, documentId);
      },
    },
    viewer: viewerField,
  },
  mutateAndGetPayload: (input, context) => {
    const documentId = fromGlobalId(input.documentId).id;
    const tagId = fromGlobalId(input.tagId).id;
    return databaseHelpers.tags.removeFromDocument(context, documentId, tagId)
      .then(() => ({documentId}));
  },
};

