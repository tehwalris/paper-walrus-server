'use strict';
const {GraphQLObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  {globalIdField} = require('graphql-relay'),
  {nodeInterface} = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers'),
  SourceFileType = require('./SourceFileType'),
  LocationDescriptorType = require('./LocationDescriptorType');

module.exports = new GraphQLObjectType({
  name: 'DocumentPart',
  fields: () => ({
    id: globalIdField('DocumentPart'),
    sourceFile: {
      type: new GraphQLNonNull(SourceFileType),
      resolve: (documentPart, args, context) => {
        return databaseHelpers.sourceFiles.getById(context, documentPart.sourceFileId);
      },
    },
    document: {
      type: new GraphQLNonNull(require('./DocumentType')),
      resolve: (documentPart, args, context) => {
        return databaseHelpers.documents.getById(context, documentPart.documentId);
      },
    },
    location: {
      type: LocationDescriptorType,
    },
  }),
  interfaces: [nodeInterface],
});
