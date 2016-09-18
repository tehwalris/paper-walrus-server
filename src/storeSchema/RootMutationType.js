'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  databaseHelpers = require('../databaseHelpers'),
  mutationHelpers = require('./mutationHelpers'),
  DocumentType = require('./DocumentType'),
  DocumentPartType = require('./DocumentPartType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel'),
  ViewerType = require('./ViewerType'); //TODO

const viewerField = { //TODO
  type: ViewerType,
  resolve: () => ({}),
};

module.exports = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: () => mutationHelpers.convertTemplatesToMutations([
    ...mutationHelpers.getMutationTemplatesForType(
      DocumentType,
      databaseHelpers.documents,
      {createInputFields: {
        name: {type: GraphQLString},
        visibility: {type: new GraphQLNonNull(DocumentVisibilityLevel)},
      }}
    ),
    {
      name: 'CreateDocumentPart',
      inputFields: {
        documentPart: {
          type: new GraphQLInputObjectType({
            name: `CreateDocumentPartInputValue`,
            fields: {
              documentId: {type: new GraphQLNonNull(GraphQLString)},
              sourceFileId: {type: new GraphQLNonNull(GraphQLString)},
            },
          }),
        },
      },
      outputFields: {
        documentPart: {
          type: DocumentPartType,
          resolve: ({documentPartId}, args, context) => {
            return databaseHelpers.documentParts.getById(context, documentPartId);
          },
        },
        document: {
          type: DocumentType,
          resolve: ({documentId}, args, context) => {
            return databaseHelpers.documents.getById(context, documentId);
          },
        },
        viewer: viewerField,
      },
      mutateAndGetPayload: (input, context) => {
        const inputValue = {
          documentId: fromGlobalId(input.documentPart.documentId).id,
          sourceFileId: fromGlobalId(input.documentPart.sourceFileId).id,
        };
        return databaseHelpers.documentParts.create(context, inputValue).returning('id')
          .then(([documentPartId]) => ({
            documentPartId,
            documentId: inputValue.documentId,
          }));
      },
    },
    {
      name: 'RenameDocument',
      inputFields: {
        id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: GraphQLString},
      },
      outputFields: {
        document: {
          type: DocumentType,
          resolve: ({id}, args, context) => databaseHelpers.documents.getById(context, id),
        },
      },
      mutateAndGetPayload: ({id: globalId, name}, context) => {
        const {id} = fromGlobalId(globalId);
        return databaseHelpers.documents.updateById(context, id, {name: name || null})
          .then(() => ({id}));
      },
    },
  ]),
});
