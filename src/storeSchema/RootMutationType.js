'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  databaseHelpers = require('../databaseHelpers'),
  mutationHelpers = require('./mutationHelpers'),
  DocumentType = require('./DocumentType'),
  DocumentPartType = require('./DocumentPartType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel'),
  viewerField = require('./viewerField'),
  UploadSourceFilesTemplate = require('./mutations/UploadSourceFilesTemplate'),
  CreateDocumentPartTemplate = require('./mutations/CreateDocumentPartTemplate'),
  DeleteDocumentPartTemplate = require('./mutations/DeleteDocumentPartTemplate'),
  MoveDocumentPartTemplate = require('./mutations/MoveDocumentPartTemplate');

module.exports = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: () => mutationHelpers.convertTemplatesToMutations([
    UploadSourceFilesTemplate,
    CreateDocumentPartTemplate,
    DeleteDocumentPartTemplate,
    MoveDocumentPartTemplate,
    ...mutationHelpers.getMutationTemplatesForType(
      DocumentType,
      databaseHelpers.documents,
      {createInputFields: {
        name: {type: GraphQLString},
        visibility: {type: new GraphQLNonNull(DocumentVisibilityLevel)},
      }}
    ),
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
