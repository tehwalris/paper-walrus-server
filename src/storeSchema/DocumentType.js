'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLInt} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  _ = require('lodash'),
  {nodeInterface} = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers'),
  DocumentPartType = require('./DocumentPartType'),
  TagType = require('./TagType'),
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
    tags: {
      type: new GraphQLNonNull(new GraphQLList(TagType)),
      resolve: (document, args, context) => {
        return databaseHelpers.tags.getOfDocument(context, document.id);
      },
    },
    dateRange: {
      type: new GraphQLObjectType({
        name: 'DateRange',
        fields: {
          start: {type: new GraphQLNonNull(GraphQLString)},
          end: {type: new GraphQLNonNull(GraphQLString)},
        },
      }),
      resolve: (document) => ({
        start: document.dateRangeStart.toISOString(),
        end: document.dateRangeEnd.toISOString(),
      }),
    },
  }),
  interfaces: [nodeInterface],
});
