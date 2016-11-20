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
    await databaseHelpers.sourceFiles.create(context, sourceFile);
    return {};
  },
};
