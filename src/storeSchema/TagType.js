'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  {nodeInterface} = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers');

module.exports = new GraphQLObjectType({
  name: 'Tag',
  fields: () => ({
    id: globalIdField('Tag'),
    type: {
      type: GraphQLString,
    },
    text: {
      type: GraphQLString,
    },
  }),
  interfaces: [nodeInterface],
});
