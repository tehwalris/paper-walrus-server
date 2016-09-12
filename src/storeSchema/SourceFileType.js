'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    filename: {
      type: new GraphQLNonNull(GraphQLString),
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
