'use strict';
const {GraphQLObjectType, GraphQLInputObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  {mutationWithClientMutationId, fromGlobalId} = require('graphql-relay'),
  _ = require('lodash'),
  ViewerType = require('./ViewerType');

const viewerField = {
  type: ViewerType,
  resolve: () => ({}),
};

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function lowercaseFirstLetter(string) {
  return string.charAt(0).toLowerCase() + string.slice(1);
}

function getMutationName(action, Type) {
  return `${capitalizeFirstLetter(action)}${capitalizeFirstLetter(Type.name)}`;
}

function getMutationTemplatesForType(Type, databaseHelpersForType, {createInputFields}) {
  const valueFieldName = lowercaseFirstLetter(Type.name);
  return [
    {
      name: getMutationName('create', Type),
      inputFields: {
        [valueFieldName]: {
          type: new GraphQLInputObjectType({
            name: `${getMutationName('create', Type)}InputValue`,
            fields: createInputFields,
          }),
        },
      },
      outputFields: {
        [valueFieldName]: {
          type: Type,
        },
        viewer: viewerField,
      },
      mutateAndGetPayload: (input, context) => {
        return databaseHelpersForType.create(context, input[valueFieldName]).returning('id')
          .then(([id]) => databaseHelpersForType.getById(context, id)) //TODO single query
          .then(value => ({[valueFieldName]: value}));
      },
    },
    {
      name: getMutationName('delete', Type),
      inputFields: {
        id: {type: new GraphQLNonNull(GraphQLString)},
      },
      outputFields: {
        [valueFieldName]: {
          type: Type,
        },
        viewer: viewerField,
      },
      mutateAndGetPayload: ({id: globalId}, context) => {
        const {id} = fromGlobalId(globalId);
        return databaseHelpersForType.getById(context, id).then(deletedValue => {
          return databaseHelpersForType.deleteById(context, id) //TODO single query
            .then(value => ({[valueFieldName]: value}));
        });
      },
    },
  ];
}

function convertTemplatesToMutations(templates) {
  return _.chain(templates)
    .keyBy(template => lowercaseFirstLetter(template.name))
    .mapValues(template => mutationWithClientMutationId(template))
    .value();
}

module.exports = {
  getMutationTemplatesForType,
  convertTemplatesToMutations,
};
