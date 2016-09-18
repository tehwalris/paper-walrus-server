'use strict';
const {GraphQLObjectType} = require('graphql'),
  nodeDefinitions = require('./nodeDefinitions'),
  viewerField = require('./viewerField');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    node: nodeDefinitions.nodeField,
    viewer: viewerField,
  },
});
