const {GraphQLEnumType} = require('graphql');

module.exports = new GraphQLEnumType({
  name: 'DocumentVisibilityLevel',
  values: {
    'anonymous': {},
    'standalone': {},
  }
});
