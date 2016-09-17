'use strict';

module.exports = function createStandardFunctions(tableName, fields) {
  const prefixedFields = fields.map(field => `${tableName}.${field}`);

  function get(context) {
    return context.knex.select(...prefixedFields).from(tableName);
  }

  function getById(context, id) {
    return get(context).where(`${tableName}.id`, id).then(rows => rows[0]);
  }

  function create(context, values) {
    return context.knex.insert(values).into(tableName);
  }

  function deleteById(context, id) {
    return context.knex(tableName).where(`${tableName}.id`, id).del();
  }

  function updateById(context, id, updates) {
    return context.knex(tableName).where(`${tableName}.id`, id).update(updates);
  }

  return {get, getById, create, deleteById, updateById};
}
