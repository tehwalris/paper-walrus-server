'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  {nodeInterface} = require('./nodeDefinitions'),
  path = require('path'),
  {publicContentPath} = require('../config'); 

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: () => ({
    id: globalIdField('SourceFile'),
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: ({filename}) => path.join(publicContentPath, filename),
    },
    previewUrl: {
      type: GraphQLString,
      resolve: ({previewFilename}) => {
        return previewFilename && path.join(publicContentPath, previewFilename);
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
    },
    irlCreatedAt: {
      type: new GraphQLNonNull(GraphQLString),
    },
  }),
  interfaces: [nodeInterface],
});
