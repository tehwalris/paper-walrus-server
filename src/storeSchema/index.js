'use strict';
const {GraphQLSchema, GraphQLObjectType, GraphQLString} = require('graphql'),
  RootQueryType = require('./RootQueryType');

module.exports = new GraphQLSchema({query: RootQueryType});
