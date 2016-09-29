const {fromGlobalId, nodeDefinitions} = require('graphql-relay'),
  _ = require('lodash'),
  databaseHelpers = require('../databaseHelpers'),
  {VIEWER_ID, VIEWER_BODY} = require('../constants');

const prepareTypeInfo = _.memoize(() => {
  //This function delays evaluation of types,
  //since otherwise the circular require would not work.
  const graphqlTypesByTableName = {
    documents: require('./DocumentType'),
    documentParts: require('./DocumentPartType'),
    sourceFiles: require('./SourceFileType'),
    tags: require('./TagType'),
  };
  const getByIdByGraphqlTypeName = _.chain(graphqlTypesByTableName)
    .invertBy(graphqlType => graphqlType.name)
    .mapValues(tableName => databaseHelpers[tableName].getById)
    .value();
  return {graphqlTypesByTableName, getByIdByGraphqlTypeName};
});

module.exports = nodeDefinitions(
  (globalId, context) => {
    if(globalId === VIEWER_ID)
      return VIEWER_BODY;
    const {type, id} = fromGlobalId(globalId);
    const getById = prepareTypeInfo().getByIdByGraphqlTypeName[type];
    return getById ? getById(context, id) : null;
  },
  (object) => {
    if(object === VIEWER_BODY)
      return require('./ViewerType');
    return prepareTypeInfo().graphqlTypesByTableName[object.__tableName] || null;
  }
);
