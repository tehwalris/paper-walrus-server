'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  SourceFileType = require('./SourceFileType'),
  LocationDescriptorType = require('./LocationDescriptorType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'DocumentPart',
  fields: {
    sourceFile: {
      type: new GraphQLNonNull(SourceFileType),
      resolve: documentPart => fakeStore.sourceFiles[documentPart.sourceFileId],
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});
