'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  databaseHelpers = require('../databaseHelpers'),
  SourceFileType = require('./SourceFileType'),
  LocationDescriptorType = require('./LocationDescriptorType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'DocumentPart',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    sourceFile: {
      type: new GraphQLNonNull(SourceFileType),
      resolve: (documentPart, args, context) => {
        return databaseHelpers.sourceFiles.getById(context, documentPart.sourceFileId);
      },
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});
