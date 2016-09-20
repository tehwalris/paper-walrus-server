exports.up = function(knex, Promise) {
  return knex.schema.table('documents', table => {
    table.specificType('partOrder', 'integer[]').notNull().defaultTo('{}');
  });
};

exports.down = function(knex, Promise) {
  return knex.schema.table('documents', table => {
    table.dropColumn('partOrder');
  });
};
