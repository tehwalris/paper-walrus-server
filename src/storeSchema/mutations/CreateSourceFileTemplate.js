'use strict';
const {GraphQLString, GraphQLNonNull} = require('graphql'),
  mime = require('mime'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

module.exports = {
  name: 'CreateSourceFile',
  inputFields: {
    key: {type: new GraphQLNonNull(GraphQLString)},
  },
  outputFields: {
    viewer: viewerField,
  },
  mutateAndGetPayload: async (input, context) => {
    const statResult = await context.minio.statObject(context.config.minioBucket, input.key);
    const sourceFile = {
      filename: input.key,
      mimeType: statResult.contentType,
    };
    const [id] = await databaseHelpers.sourceFiles.create(context, sourceFile).returning('id');
    if(context.previewGenerator.isSupportedInputType(statResult.contentType))
      await context.previewGenerator.generate(id, input.key);
    return {};
  },
};
