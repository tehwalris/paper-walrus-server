'use strict';
const {GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  SourceFileType = require('./SourceFileType'),
  LocationDescriptorType = require('./LocationDescriptorType');

module.exports = new GraphQLObjectType({
  name: 'DocumentPart',
  fields: {
    sourceFile: {
      type: new GraphQLNonNull(SourceFileType),
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});
