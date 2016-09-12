'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLEnumType} = require('graphql'),
  DocumentPartType = require('./DocumentPartType');

module.exports = new GraphQLObjectType({
  name: 'Document',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    name: {
      type: GraphQLString,
    },
    parts: {
      type: new GraphQLNonNull(new GraphQLList(DocumentPartType)),
    },
    visibility: {
      type: new GraphQLNonNull(new GraphQLEnumType({
        name: 'DocumentVisibilityLevel',
        values: {
          'anonymous': {},
          'standalone': {},
        }
      })),
    },
  },
});
