'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLBoolean} = require('graphql'),
  _ = require('lodash'),
  databaseHelpers = require('../databaseHelpers'),
  SourceFileType = require('./SourceFileType'),
  WorkSetType = require('./WorkSetType'),
  DocumentType = require('./DocumentType'),
  fakeStore = require('../fakeStore'),
  {VIEWER_ID} = require('../constants');

module.exports = new GraphQLObjectType({
  name: 'Viewer',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: () => VIEWER_ID,
    },
    workSet: {
      type: WorkSetType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.workSets[args.id],
    },
    /* real queries start here */ //TODO
    documents: {
      type: new GraphQLList(DocumentType),
      resolve: (parent, args, context) => {
        return databaseHelpers.documents.get(context);
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
