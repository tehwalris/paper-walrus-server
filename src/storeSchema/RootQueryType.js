'use strict';
const {GraphQLString, GraphQLObjectType} = require('graphql'),
  SourceFileType = require('./SourceFileType'),
  WorkSetType = require('./WorkSetType'),
  DocumentType = require('./DocumentType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    sourceFile: {
      type: SourceFileType,
      args: {id: {type: GraphQLString}},
      resolve: (parent, args) => fakeStore.sourceFiles[args.id],
    },
    document: {
      type: DocumentType,
      args: {id: {type: GraphQLString}},
      resolve: (parent, args) => fakeStore.documents[args.id],
    },
    workSet: {
      type: WorkSetType,
      args: {id: {type: GraphQLString}},
      resolve: (parent, args) => fakeStore.workSets[args.id],
    },
  },
});
