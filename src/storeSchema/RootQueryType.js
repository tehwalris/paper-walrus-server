'use strict';
const {GraphQLObjectType} = require('graphql'),
  nodeDefinitions = require('./nodeDefinitions'),
  ViewerType = require('./ViewerType');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    node: nodeDefinitions.nodeField,
    viewer: {
      type: ViewerType,
      resolve: () => ({}),
    },
  },
});
