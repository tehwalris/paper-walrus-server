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
      resolve: ({filename}, args, {config, minio}) => minio.presignedGetObject(config.minioBucket, filename),
    },
    previewUrl: {
      type: GraphQLString,
      resolve: ({previewFilename}, args, {config, minio}) => minio.presignedGetObject(config.minioBucket, previewFilename),
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
