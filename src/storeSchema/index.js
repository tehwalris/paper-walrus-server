'use strict';
const {GraphQLSchema, GraphQLObjectType, GraphQLString} = require('graphql'),
  RootQueryType = require('./RootQueryType'),
  RootMutationType = require('./RootMutationType');

module.exports = new GraphQLSchema({
  query: RootQueryType,
  mutation: RootMutationType,
});
