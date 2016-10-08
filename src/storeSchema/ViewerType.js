'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLBoolean, GraphQLID} = require('graphql'),
  _ = require('lodash'),
  {nodeInterface} = require('./nodeDefinitions'),
  databaseHelpers = require('../databaseHelpers'),
  SourceFileType = require('./SourceFileType'),
  WorkSetType = require('./WorkSetType'),
  DocumentType = require('./DocumentType'),
  TagType = require('./TagType'),
  fakeStore = require('../fakeStore'),
  {VIEWER_ID} = require('../constants');

module.exports = new GraphQLObjectType({
  name: 'Viewer',
  fields: () => ({
    id: {
      type: new GraphQLNonNull(GraphQLID),
      resolve: () => VIEWER_ID,
    },
    workSet: {
      type: WorkSetType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.workSets[args.id], //TODO
    },
    /* real queries start here */ //TODO
    documents: {
      type: new GraphQLList(DocumentType),
      args: {requiredTagIds: {type: new GraphQLList(GraphQLString)}},
      resolve: (parent, args, context) => {
        if(args.requiredTagIds) {
          const tagIds = args.requiredTagIds.map(globalId => fromGlobalId(globalId).id);
          return databaseHelpers.documents.getWithTags(context, tagIds).orderBy('documents.id');
        }
        return databaseHelpers.documents.get(context).orderBy('documents.id');
      },
    },
    sourceFiles: {
      type: new GraphQLList(SourceFileType),
      args: {onlyUnassigned: {type: GraphQLBoolean}},
      resolve: (parent, args, context) => {
        if(args.onlyUnassigned)
          return databaseHelpers.sourceFiles.getUnassigned(context).orderBy('sourceFiles.id');
        return databaseHelpers.sourceFiles.get(context).orderBy('sourceFiles.id');
      },
    },
    tags: {
      type: new GraphQLList(TagType),
      resolve: (parent, args, context) => {
        return databaseHelpers.tags.get(context).orderBy('tags.id');
      },
    },
  }),
  interfaces: [nodeInterface],
});
