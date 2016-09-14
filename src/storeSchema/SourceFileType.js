'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: sourceFile => `/content/${sourceFile.filename}`
    },
    filename: {
      type: new GraphQLNonNull(GraphQLString),
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
