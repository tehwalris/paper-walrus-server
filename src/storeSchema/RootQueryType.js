'use strict';
const {GraphQLString, GraphQLObjectType} = require('graphql'),
  SourceFileType = require('./SourceFileType'),
  DocumentType = require('./DocumentType');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    sourceFile: {
      type: SourceFileType,
      resolve: () => ({filename: 'fakeFilename', mimeType: 'fakeMimetype'}),
    },
    document: {
      type: DocumentType,
    },
  },
});
