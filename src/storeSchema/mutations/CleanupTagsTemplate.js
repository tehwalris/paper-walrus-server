'use strict';
const {GraphQLString, GraphQLInputObjectType, GraphQLNonNull} = require('graphql'),
  {fromGlobalId} = require('graphql-relay'),
  DocumentType = require('../DocumentType'),
  DocumentPartType = require('../DocumentPartType'),
  viewerField = require('../viewerField'),
  databaseHelpers = require('../../databaseHelpers');

module.exports = {
  name: 'CleanupTags',
  outputFields: {
    viewer: viewerField,
  },
  mutateAndGetPayload: (input, context) => {
    return databaseHelpers.tags.deleteUnused(context)
      .then(() => ({})); //Return value must be an object
  },
};

