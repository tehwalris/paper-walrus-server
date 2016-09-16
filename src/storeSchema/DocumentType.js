'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList} = require('graphql'),
  databaseHelpers = require('../databaseHelpers'),
  DocumentPartType = require('./DocumentPartType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel');

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
      type: new GraphQLNonNull(DocumentVisibilityLevel),
    },
  },
});
