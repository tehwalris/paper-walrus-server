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
      resolve: (document, args, {knex}) => {
        return knex.select(
          'documentParts.sourceFileId'
        ).from('documentParts').where('documentParts.documentId', document.id);
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
