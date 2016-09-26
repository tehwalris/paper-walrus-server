'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'LocationDescriptor',
  fields: {
    description: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
