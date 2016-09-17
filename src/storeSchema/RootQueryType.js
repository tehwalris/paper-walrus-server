'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLBoolean} = require('graphql'),
  _ = require('lodash'),
  nodeDefinitions = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers'),
  SourceFileType = require('./SourceFileType'),
  WorkSetType = require('./WorkSetType'),
  DocumentType = require('./DocumentType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    workSet: {
      type: WorkSetType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.workSets[args.id],
    },
    /* real queries start here */ //TODO
    node: nodeDefinitions.nodeField,
    documents: {
      type: new GraphQLList(DocumentType),
      resolve: (parent, args, context) => {
        return databaseHelpers.documents.get(context);
      },
    },
    document: {
      type: DocumentType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args, context) => {
        return databaseHelpers.documents.getById(context, args.id);
      },
    },
    sourceFiles: {
      type: new GraphQLList(SourceFileType),
      args: {onlyUnassigned: {type: GraphQLBoolean}},
      resolve: (parent, args, context) => {
        if(args.onlyUnassigned)
          return databaseHelpers.sourceFiles.getUnassigned(context);
        return databaseHelpers.sourceFiles.get(context);
      },
    },
  },
});
