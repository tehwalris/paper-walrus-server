'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLEnumType} = require('graphql'),
  _ = require('lodash'),
  databaseHelpers = require('../databaseHelpers'),
  DocumentType = require('./DocumentType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel');

module.exports = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: {
    createDocument: {
      type: DocumentType,
      args: {input: {type: new GraphQLInputObjectType({
        name: 'CreateDocumentInput',
        fields: {
          name: {type: GraphQLString},
          visibility: {type: new GraphQLNonNull(DocumentVisibilityLevel)},
        },
      })}},
      resolve: (parent, {input}, context) => {
        return databaseHelpers.createDocument(context, input).returning('id')
          .then(([id]) => databaseHelpers.getDocumentById(context, id)); //TODO single query
      },
    },
  },
});
