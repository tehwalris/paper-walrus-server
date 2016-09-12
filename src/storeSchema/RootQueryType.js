'use strict';
const {GraphQLString, GraphQLObjectType} = require('graphql'),
  SourceFileType = require('./SourceFileType'),
  WorkSetType = require('./WorkSetType');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    sourceFile: {
      type: SourceFileType,
      resolve: () => ({filename: 'fakeFilename', mimeType: 'fakeMimetype'}),
    },
    workSet: {
      type: WorkSetType,
    },
  },
});
