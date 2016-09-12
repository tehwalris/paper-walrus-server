'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLString} = require('graphql'),
  DocumentType = require('./DocumentType'),
  ReferenceType = require('./ReferenceType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'WorkSet',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    coreDocuments: {
      type: new GraphQLNonNull(new GraphQLList(DocumentType)),
      resolve: workSet => workSet.coreDocumentIds.map(documentId => fakeStore.documents[documentId]),
    },
    references: {
      type: new GraphQLNonNull(new GraphQLList(ReferenceType)),
    },
  },
});

