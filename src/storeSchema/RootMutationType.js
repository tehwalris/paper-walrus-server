'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql'),
  databaseHelpers = require('../databaseHelpers'),
  mutationHelpers = require('./mutationHelpers'),
  DocumentType = require('./DocumentType'),
  DocumentVisibilityLevel = require('./DocumentVisibilityLevel');

module.exports = new GraphQLObjectType({
  name: 'RootMutationType',
  fields: mutationHelpers.convertTemplatesToMutations([
    ...mutationHelpers.getMutationTemplatesForType(DocumentType, databaseHelpers.documents, {
      createInputFields: {
        name: {type: GraphQLString},
        visibility: {type: new GraphQLNonNull(DocumentVisibilityLevel)},
      },
    }),
    {
      name: 'renameDocument',
      inputFields: {
        id: {type: new GraphQLNonNull(GraphQLString)},
        name: {type: GraphQLString},
      },
      returnType: DocumentType,
      resolve: (parent, {input: {id, name}}, context) => {
        return databaseHelpers.documents.updateById(context, id, {name: name || null})
          .then(() => databaseHelpers.documents.getById(context, id)); //TODO single query
      },
    },
  ]),
});
