'use strict';
const {GraphQLString, GraphQLInt, GraphQLList, GraphQLNonNull, GraphQLInputObjectType, GraphQLObjectType} = require('graphql'),
  uuid = require('uuid').v4,
  mime = require('mime'),
  {toPairs} = require('lodash'),
  databaseHelpers = require('../../databaseHelpers');

module.exports = {
  name: 'UploadSourceFiles',
  inputFields: {
    plannedUploadInfo: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(new GraphQLInputObjectType({
        name: 'PlannedFileUploadInfo',
        fields: {
          name: {type: new GraphQLNonNull(GraphQLString)},
          type: {type: new GraphQLNonNull(GraphQLString)},
        },
      })))),
    },
  },
  outputFields: {
    uploadTargets: {
      type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(new GraphQLObjectType({
        name: 'FileUploadTarget',
        fields: {
          postUrl: {type: new GraphQLNonNull(GraphQLString)},
          formData: {type: new GraphQLNonNull(new GraphQLList(new GraphQLNonNull(new GraphQLObjectType({
            name: 'FileUploadFormDataEntry',
            fields: {
              key: {type: new GraphQLNonNull(GraphQLString)},
              value: {type: new GraphQLNonNull(GraphQLString)},
            },
          }))))},
        },
      })))),
    },
  },
  mutateAndGetPayload: async (input, context) => {
    // TODO check file sizes and types
    const uploadTargets = await Promise.all(input.plannedUploadInfo.map(fileInfo => {
      const policy = context.minio.newPostPolicy();
      policy.setBucket(context.config.minioBucket);
      policy.setKey(uuid() + '.' + mime.extension(fileInfo.type));
      policy.setContentType(fileInfo.type);
      var expires = new Date();
      expires.setSeconds(24*60*60); // TODO move to config
      policy.setExpires(expires);
      return context.minio.presignedPostPolicy(policy).then(({postURL, formData}) => ({
        postUrl: postURL,
        formData: toPairs(formData).map(([key, value]) => ({key, value})),
      }));
    }));
    return {uploadTargets};
  },
};
