'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
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
        return databaseHelpers.documents.create(context, input).returning('id')
          .then(([id]) => databaseHelpers.documents.getById(context, id)); //TODO single query
      },
    },
    renameDocument: {
      type: DocumentType,
      args: {input: {type: new GraphQLInputObjectType({
        name: 'RenameDocumentInput',
        fields: {
          id: {type: new GraphQLNonNull(GraphQLString)},
          name: {type: GraphQLString},
        },
      })}},
      resolve: (parent, {input: {id, name}}, context) => {
        return databaseHelpers.documents.updateById(context, id, {name: name || null}).returning('id')
          .then(([id]) => databaseHelpers.documents.getById(context, id)); //TODO single query
      },
    },
    deleteDocument: {
      type: GraphQLString,
      args: {input: {type: new GraphQLInputObjectType({
        name: 'DeleteDocumentInput',
        fields: {
          id: {type: new GraphQLNonNull(GraphQLString)},
        },
      })}},
      resolve: (parent, {input: {id, name}}, context) => {
        return databaseHelpers.documents.deleteById(context, id).then(() => id);
      },
    },
  },
});
