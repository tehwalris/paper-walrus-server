'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  ReferencePointType = require('./ReferencePointType');

module.exports = new GraphQLObjectType({
  name: 'Reference',
  fields: {
    pointA: {
      type: new GraphQLNonNull(ReferencePointType),
    },
    pointB: {
      type: new GraphQLNonNull(ReferencePointType),
    },
  },
});
