const {fromGlobalId, nodeDefinitions} = require('graphql-relay'),
  _ = require('lodash'),
  databaseHelpers = require('../databaseHelpers');

const prepareTypeInfo = _.memoize(() => {
  //This function delays evaluation of types,
  //since otherwise the circular require would not work.
  const graphqlTypesByTableName = {
    documents: require('./DocumentType'),
    documentParts: require('./DocumentPartType'),
    sourceFiles: require('./SourceFile'),
  };
  const getByIdByGraphqlTypeName = _.chain(graphqlTypesByTableName)
    .invertBy(graphqlType => graphqlType.name)
    .mapValues(tableName => databaseHelpers[tableName].getById)
    .value();
  return {graphqlTypesByTableName, getByIdByGraphqlTypeName};
});

module.exports = nodeDefinitions(
  (globalId, context) => {
    const {type, id} = fromGlobalId(globalId);
    const getById = prepareTypeInfo().getByIdByGraphqlTypeName[type];
    return getById ? getById(id) : null;
  },
  (object) => {
    return prepareTypeInfo().graphqlTypesByTableName[object.__tableName] || null;
  }
);
