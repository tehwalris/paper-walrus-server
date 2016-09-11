'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: {
    filename: {
      type: new GraphQLNonNull(GraphQLString),
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
