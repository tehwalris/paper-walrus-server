'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLList} = require('graphql'),
  DocumentType = require('./DocumentType'),
  ReferenceType = require('./ReferenceType');

module.exports = new GraphQLObjectType({
  name: 'WorkSet',
  fields: {
    coreDocuments: {
      type: new GraphQLNonNull(new GraphQLList(DocumentType)),
    },
    references: {
      type: new GraphQLNonNull(new GraphQLList(ReferenceType)),
    },
  },
});

