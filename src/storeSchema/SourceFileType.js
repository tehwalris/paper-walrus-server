'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  {nodeInterface} = require('./nodeDefinitions'),
  path = require('path');

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: () => ({
    id: globalIdField('SourceFile'),
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({filename}, args, {config}) => path.join(config.publicContentPath, filename),
    },
    previewUrl: {
      type: GraphQLString,
      resolve: ({previewFilename}, args, {config}) => {
        return previewFilename && path.join(config.publicContentPath, previewFilename);
      },
    },
    filename: {
      type: new GraphQLNonNull(GraphQLString),
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
    },
    uploadedAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: date => date.toISOString(),
    },
    irlCreatedAt: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: date => date.toISOString(),
    },
  }),
  interfaces: [nodeInterface],
});
