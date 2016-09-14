'use strict';
const {GraphQLString, GraphQLObjectType, GraphQLNonNull} = require('graphql');

module.exports = new GraphQLObjectType({
  name: 'SourceFile',
  fields: {
    id: {
      type: new GraphQLNonNull(GraphQLString),
    },
    url: {
      type: new GraphQLNonNull(GraphQLString),
      resolve: sourceFile => `/content/${sourceFile.filename}`
    },
    previewUrl: {
      type: GraphQLString,
      resolve: () => 'https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcRaSMMInJm7RUGQzIovTrbwFkNzBaMXAPrwLv1iDEyRU7Dcph_I', //TODO
    },
    filename: {
      type: new GraphQLNonNull(GraphQLString),
    },
    mimeType: {
      type: new GraphQLNonNull(GraphQLString),
    },
  },
});
