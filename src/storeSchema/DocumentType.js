'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLInt} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  {nodeInterface} = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers'),
  DocumentPartType = require('./DocumentPartType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel');

module.exports = new GraphQLObjectType({
  name: 'Document',
  fields: () => ({
    id: globalIdField('Document'),
    name: {
      type: GraphQLString,
    },
    partOrder: {
      type: new GraphQLList(GraphQLInt),
    },
    parts: {
      type: new GraphQLNonNull(new GraphQLList(DocumentPartType)),
      resolve: (document, args, context) => {
        return databaseHelpers.documentParts.getOfDocument(context, document.id);
      },
    },
    visibility: {
      type: new GraphQLNonNull(DocumentVisibilityLevel),
    },
  }),
  interfaces: [nodeInterface],
});
