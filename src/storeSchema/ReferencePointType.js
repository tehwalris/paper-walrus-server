'use strict';
const {GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  LocationDescriptorType = require('./LocationDescriptorType'),
  DocumentType = require('./DocumentType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'ReferencePoint',
  fields: {
    document: {
      type: new GraphQLNonNull(DocumentType),
      resolve: referencePoint => fakeStore.documents[referencePoint.documentId],
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});

