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
      resolve: (documentPart, args, {knex}) => {
        return knex.select(
          'sourceFiles.id',
          'sourceFiles.filename',
          'sourceFiles.mimeType'
        ).from('sourceFiles').where('sourceFiles.id', documentPart.sourceFileId)
          .then(rows => rows[0]);
      },
    },
    location: {
      type: LocationDescriptorType,
    },
  },
});
