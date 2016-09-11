'use strict';
const {GraphQLString, GraphQLObjectType} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: {
    filename: {
      type: GraphQLString,
    },
    mimeType: {
      type: GraphQLString,
    },
  },
});
