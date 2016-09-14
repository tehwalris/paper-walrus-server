'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull, GraphQLList, GraphQLBoolean} = require('graphql'),
  _ = require('lodash'),
  SourceFileType = require('./SourceFileType'),
  WorkSetType = require('./WorkSetType'),
  DocumentType = require('./DocumentType'),
  fakeStore = require('../fakeStore');

module.exports = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    sourceFile: {
      type: SourceFileType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.sourceFiles[args.id],
    },
    document: {
      type: DocumentType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.documents[args.id],
    },
    workSet: {
      type: WorkSetType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.workSets[args.id],
    },
    /* real queries start here */ //TODO
    documents: {
      type: new GraphQLList(DocumentType),
      resolve: () => _.values(fakeStore.documents),
    },
    sourceFiles: {
      type: new GraphQLList(SourceFileType),
      args: {onlyUnassigned: {type: GraphQLBoolean}},
      resolve: (parent, args) => {
        const onlyUnassigned = args.onlyUnassigned || false;
        const sourceFiles = _.values(fakeStore.sourceFiles);
        if(onlyUnassigned) {
          const assignedSourceFileIds =
            _.chain(fakeStore.documents).flatMap('parts').map('sourceFileId').uniq().value();
          return sourceFiles.filter(({id}) => !assignedSourceFileIds.includes(id));
        }
        return sourceFiles;
      },
    },
  },
});
