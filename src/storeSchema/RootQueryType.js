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
    workSet: {
      type: WorkSetType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args) => fakeStore.workSets[args.id],
    },
    /* real queries start here */ //TODO
    documents: {
      type: new GraphQLList(DocumentType),
      resolve: (parent, args, {knex}) => {
        return knex.select(
          'documents.id',
          'documents.name',
          'documents.visibility'
        ).from('documents');
      },
    },
    document: {
      type: DocumentType,
      args: {id: {type: new GraphQLNonNull(GraphQLString)}},
      resolve: (parent, args, {knex}) => {
        return knex.select(
          'documents.id',
          'documents.name',
          'documents.visibility'
        ).from('documents').where('id', args.id).then(rows => rows[0]);
      },
    },
    sourceFiles: {
      type: new GraphQLList(SourceFileType),
      args: {onlyUnassigned: {type: GraphQLBoolean}},
      resolve: (parent, args, {knex}) => {
        const baseQuery = knex.select(
          'sourceFiles.id',
          'sourceFiles.filename',
          'sourceFiles.mimeType'
        ).from('sourceFiles');
        if(args.onlyUnassigned) {
          return baseQuery
            .leftJoin('documentParts', 'sourceFiles.id', 'documentParts.sourceFileId')
            .whereNull('documentParts.id');
        }
        return baseQuery;
      },
    },
  },
});
