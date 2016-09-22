'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLInt} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  _ = require('lodash'),
  {nodeInterface} = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers'),
  DocumentPartType = require('./DocumentPartType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel');

function getOrderedParts(unorderedParts, partOrder) {
  return partOrder.map(partId => _.find(unorderedParts, ['id', partId]));
}

module.exports = new GraphQLObjectType({
  name: 'Document',
  fields: () => ({
    id: globalIdField('Document'),
    name: {
      type: GraphQLString,
    },
    parts: {
      type: new GraphQLNonNull(new GraphQLList(DocumentPartType)),
      resolve: (document, args, context) => {
        return databaseHelpers.documentParts.getOfDocument(context, document.id)
          .then(unorderedParts => getOrderedParts(unorderedParts, document.partOrder));
      },
    },
    visibility: {
      type: new GraphQLNonNull(DocumentVisibilityLevel),
    },
  }),
  interfaces: [nodeInterface],
});
