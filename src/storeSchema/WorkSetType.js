'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLString} = require('graphql'),
  DocumentType = require('./DocumentType'),
  ReferenceType = require('./ReferenceType');

module.exports = new GraphQLObjectType({
  name: 'WorkSet',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    coreDocuments: {
      type: new GraphQLNonNull(new GraphQLList(DocumentType)),
      // resolve: workSet => workSet.coreDocumentIds.map(documentId => fakeStore.documents[documentId]), // TODO
    },
    references: {
      type: new GraphQLNonNull(new GraphQLList(ReferenceType)),
    },
  },
});

