'use strict';
const {GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  LocationDescriptorType = require('./LocationDescriptorType'),
  DocumentType = require('./DocumentType');

module.exports = new GraphQLObjectType({
  name: 'ReferencePoint',
  fields: {
    document: {
      type: new GraphQLNonNull(DocumentType),
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});

