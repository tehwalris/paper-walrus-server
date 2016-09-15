'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLEnumType} = require('graphql'),
  databaseHelpers = require('../databaseHelpers'),
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
      resolve: (document, args, context) => {
        return databaseHelpers.getPartsOfDocument(context, document.id);
      },
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
