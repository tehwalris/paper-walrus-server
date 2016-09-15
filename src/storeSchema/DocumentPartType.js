'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  databaseHelpers = require('../databaseHelpers'),
  SourceFileType = require('./SourceFileType'),
  LocationDescriptorType = require('./LocationDescriptorType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'DocumentPart',
  fields: {
    sourceFile: {
      type: new GraphQLNonNull(SourceFileType),
      resolve: (documentPart, args, context) => {
        return databaseHelpers.getSourceFileById(context, documentPart.sourceFileId);
      },
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});
