'use strict';
const {GraphQLObjectType ,GraphQLInputObjectType, GraphQLNonNull, GraphQLString} = require('graphql'),
  _ = require('lodash');

function capitalizeFirstLetter(string) {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

function getInputTypeName(mutationName) {
  return `${capitalizeFirstLetter(mutationName)}Input`;
}

function createStandardMutation({name, inputFields, returnType, resolve}) {
  return {
    type: returnType,
    args: {
      input: {
        type: new GraphQLInputObjectType({
          name: getInputTypeName(name),
          fields: inputFields,
        }),
      },
    },
    resolve,
  };
}

function getMutationName(action, Type) {
  return `${action}${capitalizeFirstLetter(Type.name)}`;
}

function getMutationTemplatesForType(Type, databaseHelpersForType, {createInputFields}) {
  return [
    {
      name: getMutationName('create', Type),
      inputFields: createInputFields,
      returnType: Type,
      resolve: (parent, {input}, context) => {
        return databaseHelpersForType.create(context, input).returning('id')
          .then(([id]) => databaseHelpersForType.getById(context, id)); //TODO single query
      },
    },
    {
      name: getMutationName('delete', Type),
      inputFields: {
        id: {type: new GraphQLNonNull(GraphQLString)},
      },
      returnType: GraphQLString,
      resolve: (parent, {input: {id}}, context) => {
        return databaseHelpersForType.deleteById(context, id).then(() => id);
      },
    },
  ];
}

function convertTemplatesToMutations(templates) {
  return _.chain(templates)
    .keyBy('name')
    .mapValues(template => createStandardMutation(template))
    .value();
}

module.exports = {
  createStandardMutation,
  getMutationTemplatesForType,
  convertTemplatesToMutations,
};
