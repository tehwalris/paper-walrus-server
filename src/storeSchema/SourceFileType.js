'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  path = require('path'),
  {publicContentPath} = require('../config'); 

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
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
  },
});
